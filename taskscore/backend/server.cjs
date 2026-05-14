const express = require("express");
const cors = require("cors");
const db = require("./database/db.cjs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const tasksRoutes = require("./routes/tasks.js");
const techniciansRoutes = require("./routes/technicians.js");
const notificationsRoutes = require("./routes/notifications.js");

const JWT_SECRET = "taskscore_secret_dev";

app.use(cors());
app.use(express.json());

function calcularPontuacao(prazo, entrega) {
  const p = new Date(prazo);
  const e = new Date(entrega);

  p.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);

  return e <= p ? 3 : -3;
}

function addHistory(taskId, action, details = "") {
  db.run(
    `
    INSERT INTO task_history (taskId, action, details, createdAt)
    VALUES (?, ?, ?, ?)
    `,
    [taskId, action, details, new Date().toISOString()]
  );
}

app.get("/", (req, res) => {
  res.json({ status: "online", message: "Backend TaskScore rodando" });
});

app.get("/tasks", (req, res) => {
  db.all("SELECT * FROM tasks ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/tasks", (req, res) => {
  const { title, deadline, responsavel, status, priority, description, slaHours } = req.body;

  if (!title || !deadline || !responsavel) {
    return res.status(400).json({ error: "Título, prazo e responsável são obrigatórios." });
  }

  const createdAt = new Date().toISOString();

  db.run(
    `
    INSERT INTO tasks (
      title, deadline, responsavel, status, score,
      createdAt, finishedAt, priority, description, slaHours, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      title,
      deadline,
      responsavel,
      status || "pendente",
      0,
      createdAt,
      null,
      priority || "media",
      description || "",
      slaHours || 24,
      createdAt,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      addHistory(this.lastID, "created", "Tarefa criada.");

      db.get("SELECT * FROM tasks WHERE id = ?", [this.lastID], (err, task) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(task);
      });
    }
  );
});

app.post("/tasks/:id/finish", (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, task) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!task) return res.status(404).json({ error: "Tarefa não encontrada." });

    const finishedAt = new Date().toISOString();
    const score = calcularPontuacao(task.deadline, finishedAt);

    db.run(
      `
      UPDATE tasks
      SET status = ?, score = ?, finishedAt = ?
      WHERE id = ?
      `,
      ["concluida", score, finishedAt, id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        addHistory(id, "finished", `Tarefa concluída com ${score} pontos.`);

        db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, updatedTask) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(updatedTask);
        });
      }
    );
  });
});

app.patch("/tasks/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: "Status é obrigatório." });

  db.run("UPDATE tasks SET status = ?, updatedAt = ? WHERE id = ?", [status, new Date().toISOString(), id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    addHistory(id, "status_changed", `Status alterado para ${status}.`);

    db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, updatedTask) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(updatedTask);
    });
  });
});

app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, task) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!task) return res.status(404).json({ error: "Tarefa não encontrada." });

    const title = req.body.title ?? task.title;
    const deadline = req.body.deadline ?? task.deadline;
    const responsavel = req.body.responsavel ?? task.responsavel;
    const status = req.body.status ?? task.status;
    const priority = req.body.priority ?? task.priority ?? "media";
    const description = req.body.description ?? task.description ?? "";
    const slaHours = req.body.slaHours ?? task.slaHours ?? 24;
    const updatedAt = new Date().toISOString();

    db.run(
      `
      UPDATE tasks
      SET title = ?, deadline = ?, responsavel = ?, status = ?,
          priority = ?, description = ?, slaHours = ?, updatedAt = ?
      WHERE id = ?
      `,
      [title, deadline, responsavel, status, priority, description, slaHours, updatedAt, id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        addHistory(id, "updated", `Tarefa editada. Prioridade: ${priority}. SLA: ${slaHours}h.`);

        db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, updatedTask) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(updatedTask);
        });
      }
    );
  });
});

app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, deletedId: id });
  });
});

app.get("/tasks/:id/history", (req, res) => {
  db.all(
    "SELECT * FROM task_history WHERE taskId = ? ORDER BY id DESC",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.get("/dashboard", (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, tasks) => {
    if (err) return res.status(500).json({ error: err.message });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const total = tasks.length;
    const concluidas = tasks.filter((t) => t.status === "concluida").length;
    const andamento = tasks.filter((t) => t.status === "andamento").length;

    const pendentes = tasks.filter((t) => {
      const deadline = new Date(t.deadline);
      deadline.setHours(0, 0, 0, 0);
      return t.status !== "concluida" && t.status !== "andamento" && deadline >= today;
    }).length;

    const atrasadas = tasks.filter((t) => {
      const deadline = new Date(t.deadline);
      deadline.setHours(0, 0, 0, 0);
      return t.status !== "concluida" && deadline < today;
    }).length;

    res.json({ total, concluidas, andamento, pendentes, atrasadas });
  });
});

app.get("/technicians", (req, res) => {
  db.all("SELECT * FROM technicians ORDER BY name ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/technicians", (req, res) => {
  const { name, role } = req.body;

  if (!name) return res.status(400).json({ error: "Nome obrigatório." });

  db.run(
    `
    INSERT INTO technicians (name, role, createdAt)
    VALUES (?, ?, ?)
    `,
    [name.trim(), role || "Técnico de TI", new Date().toISOString()],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get("SELECT * FROM technicians WHERE id = ?", [this.lastID], (err, technician) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(technician);
      });
    }
  );
});

app.put("/technicians/:id", (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;

  if (!name) return res.status(400).json({ error: "Nome do técnico é obrigatório." });

  db.run(
    `
    UPDATE technicians
    SET name = ?, role = ?
    WHERE id = ?
    `,
    [name.trim(), role || "Técnico de TI", id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get("SELECT * FROM technicians WHERE id = ?", [id], (err, technician) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(technician);
      });
    }
  );
});

app.delete("/technicians/:id", (req, res) => {
  db.run("DELETE FROM technicians WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get("/notifications", (req, res) => {
  db.all("SELECT * FROM tasks WHERE status != 'concluida'", [], (err, tasks) => {
    if (err) return res.status(500).json({ error: err.message });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const notifications = tasks
      .map((task) => {
        const deadline = new Date(task.deadline);
        deadline.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          return {
            type: "danger",
            title: "Tarefa atrasada",
            message: `${task.title} está atrasada há ${Math.abs(diffDays)} dia(s).`,
            task,
          };
        }

        if (diffDays === 0) {
          return {
            type: "warning",
            title: "Vence hoje",
            message: `${task.title} vence hoje.`,
            task,
          };
        }

        if (diffDays === 1) {
          return {
            type: "info",
            title: "Vence amanhã",
            message: `${task.title} vence amanhã.`,
            task,
          };
        }

        return null;
      })
      .filter(Boolean);

    res.json(notifications);
  });
});

app.post("/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    `
    INSERT INTO users (name, email, password, role, createdAt)
    VALUES (?, ?, ?, ?, ?)
    `,
    [name, email, hashedPassword, role || "tecnico", new Date().toISOString()],
    function (err) {
      if (err) return res.status(500).json({ error: "Usuário já existe ou erro no banco." });

      res.json({
        id: this.lastID,
        name,
        email,
        role: role || "tecnico",
      });
    }
  );
});

// LOGIN
app.post("/auth/login", (req, res) => {
  const { username, email, password } = req.body;

  const login = username || email;

  if (!login || !password) {
    return res.status(400).json({ error: "Usuário e senha são obrigatórios." });
  }

  db.get(
    "SELECT * FROM users WHERE name = ? OR email = ?",
    [login, login],
    async (err, user) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!user) {
        return res.status(401).json({ error: "Usuário ou senha inválidos." });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: "Usuário ou senha inválidos." });
      }

      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "8h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  );
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Backend TaskScore com SQLite rodando na porta ${PORT}`);
});