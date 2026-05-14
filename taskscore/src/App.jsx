import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import "./App.css";
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCorners,
} from "@dnd-kit/core";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  CheckSquare,
  Clock3,
  FileText,
  FolderKanban,
  KanbanSquare,
  LayoutDashboard,
  Moon,
  Plus,
  Sun,
  Trash2,
  Trophy,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = "https://deploy-taskscore-1.onrender.com";


const colors = {
  primary: "#006B5F",
  primaryDark: "#003C3C",
  primarySoft: "#E5F6F3",
  accent: "#00A091",
  green: "#7AC143",
  yellow: "#F5B82E",
  blue: "#2F6FE4",
  red: "#EF4444",
  bg: "#F4F7F8",
  card: "#FFFFFF",
  text: "#073B3A",
  muted: "#64748B",
  border: "#DCE7E7",
};

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TechniciansPage({
  technicians,
  newTechnician,
  setNewTechnician,
  newTechnicianRole,
  setNewTechnicianRole,
  addTechnician,
  deleteTechnician,
  editingTechnicianId,
editingTechnicianName,
setEditingTechnicianName,
editingTechnicianRole,
setEditingTechnicianRole,
startEditTechnician,
cancelEditTechnician,
saveEditTechnician,
}) {
  return (
    <section className="technicians-layout">
      <div className="card">
        <h2>Adicionar técnico</h2>

        <div className="technician-form">
          <input
            placeholder="Nome do técnico"
            value={newTechnician}
            onChange={(e) => setNewTechnician(e.target.value)}
            className="input"
          />

          <input
            placeholder="Cargo do técnico"
            value={newTechnicianRole}
            onChange={(e) => setNewTechnicianRole(e.target.value)}
            className="input"
          />

          <button onClick={addTechnician} className="btn btn-primary">
            Adicionar
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Técnicos cadastrados</h2>

        <div className="technicians-grid">
         {technicians.map((tech) => {
  const isEditing = editingTechnicianId === tech.id;
        


  return (
    <div
      key={tech.id}
      className={`technician-card ${isEditing ? "editing" : ""}`}
    >
      <div className="tech-avatar">
        {getInitials(tech.name)}
      </div>

      {isEditing ? (
        <div className="tech-edit-form">
          <input
            className="input"
            placeholder="Nome do técnico"
            value={editingTechnicianName}
            onChange={(e) =>
              setEditingTechnicianName(e.target.value)
            }
          />

          <input
            className="input"
            placeholder="Cargo"
            value={editingTechnicianRole}
            onChange={(e) =>
              setEditingTechnicianRole(e.target.value)
            }
          />

          <div className="tech-actions">
            <button
              onClick={saveEditTechnician}
              className="btn btn-green"
            >
              Salvar
            </button>

            <button
              onClick={cancelEditTechnician}
              className="btn btn-dark"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="tech-info">
            <strong>{tech.name}</strong>
            <small>
              {tech.role || "Técnico de TI"}
            </small>
          </div>

          <div className="tech-actions">
            <button
              onClick={() => startEditTechnician(tech)}
              className="btn btn-yellow"
            >
              Editar
            </button>

            <button
              onClick={() => deleteTechnician(tech.id)}
              className="btn btn-red"
            >
              Excluir
            </button>
          </div>
        </>
      )}
    </div>
  );
})}
        </div>
      </div>
    </section>
  );
}

export default function App() {

const [authUser, setAuthUser] = useState(() => {
  const saved = localStorage.getItem("taskscore_user");
  return saved ? JSON.parse(saved) : null;
});

const [loginUsername, setLoginUsername] = useState("");
const [loginPassword, setLoginPassword] = useState("");
const [loginError, setLoginError] = useState("");
  const [editingTechnicianId, setEditingTechnicianId] = useState(null);
const [editingTechnicianName, setEditingTechnicianName] = useState("");
const [editingTechnicianRole, setEditingTechnicianRole] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [technicians, setTechnicians] = useState([]);
const [newTechnician, setNewTechnician] = useState("");
const [newTechnicianRole, setNewTechnicianRole] = useState("");
const users = technicians.map((tech) => tech.name);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [responsavel, setResponsavel] = useState("Lucas");
  const [selectedUser, setSelectedUser] = useState("Todos");
  const [activeView, setActiveView] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
const [taskHistory, setTaskHistory] = useState([]);


  useEffect(() => {
    
  fetch(`${API_URL}/notifications`)
  .then((res) => res.json())
  .then((data) => setNotifications(data));

    fetch(`${API_URL}/technicians`)
  .then((res) => res.json())
  .then((data) => {
    setTechnicians(data);
    if (data.length > 0) {
      setResponsavel(data[0].name);
    }
  });

    fetch(`${API_URL}/tasks`)
      .then((res) => res.json())
      .then((data) => setTasks(Array.isArray(data) ? data : []))
      .catch(() => setTasks([]));
  }, []);

  async function handleLogin(e) {
  e.preventDefault();
  setLoginError("");

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: loginUsername,
        password: loginPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoginError(data.error || "Erro ao fazer login.");
      return;
    }

    localStorage.setItem("taskscore_token", data.token);
    localStorage.setItem("taskscore_user", JSON.stringify(data.user));

    setAuthUser(data.user);
    setLoginEmail("");
    setLoginPassword("");
  } catch (error) {
    setLoginError("Erro ao conectar com o servidor.");
  }
}

function handleLogout() {
  localStorage.removeItem("taskscore_token");
  localStorage.removeItem("taskscore_user");
  setAuthUser(null);
}
function addTechnician() {
  if (!newTechnician.trim()) return;

  fetch(`${API_URL}/technicians`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: newTechnician.trim(),
      role: newTechnicianRole.trim() || "Técnico de TI",
    }),
  })
    .then((res) => res.json())
    .then((tech) => {
      setTechnicians((current) => [...current, tech]);

      setNewTechnician("");
      setNewTechnicianRole("");
    });
}

function startEditTechnician(tech) {
  setEditingTechnicianId(tech.id);
  setEditingTechnicianName(tech.name);
  setEditingTechnicianRole(tech.role || "Técnico de TI");
}

function cancelEditTechnician() {
  setEditingTechnicianId(null);
  setEditingTechnicianName("");
  setEditingTechnicianRole("");
}

function saveEditTechnician() {
  if (!editingTechnicianName.trim()) return;

  fetch(`${API_URL}/technicians/${editingTechnicianId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: editingTechnicianName.trim(),
      role: editingTechnicianRole.trim() || "Técnico de TI",
    }),
  })
    .then((res) => res.json())
    .then((updatedTech) => {
      setTechnicians((current) =>
        current.map((tech) =>
          tech.id === updatedTech.id ? updatedTech : tech
        )
      );

      cancelEditTechnician();
    });
}

function deleteTechnician(id) {
  fetch(`${API_URL}/technicians/${id}`, {
    method: "DELETE",
  }).then(() => {
    setTechnicians((current) =>
      current.filter((tech) => tech.id !== id)
    );
  });
}

  async function addTask() {
  if (!title.trim() || !deadline || !responsavel) {
    alert("Preencha título, prazo e responsável.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        deadline,
        responsavel,
        status: "pendente",
        score: 0,
        priority: "media",
        description: "",
        slaHours: 24,
        createdAt: new Date().toISOString(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data);
      alert(data.error || "Erro ao criar tarefa.");
      return;
    }

    setTasks((currentTasks) => [data, ...currentTasks]);

    setTitle("");
    setDeadline("");
    setResponsavel(users[0] || "");
  } catch (error) {
    console.error(error);
    alert("Erro ao conectar com o backend.");
  }
}

  function deleteTask(taskId) {
    fetch(`${API_URL}/tasks/${taskId}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => {
        setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
      })
      .catch(() => alert("Não foi possível excluir a tarefa."));
  }

  function finishTask(task) {
    fetch(`${API_URL}/tasks/${task.id}/finish`, { method: "POST" })
      .then((res) => res.json())
      .then((updatedTask) => {
        setTasks((currentTasks) =>
          currentTasks.map((item) => (item.id === task.id ? updatedTask : item))
        );
      })
      .catch(() => alert("Não foi possível concluir a tarefa."));
  }

  async function updateTask(taskId, updatedData) {
  try {
    const res = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    const updatedTask = await res.json();

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? updatedTask : task
      )
    );

    setEditingTask(null);
  } catch (err) {
    console.error(err);
  }
}

async function loadTaskHistory(taskId) {
  try {
    const res = await fetch(`${API_URL}/tasks/${taskId}/history`);
    const data = await res.json();

    setTaskHistory(data);
  } catch (err) {
    console.error(err);
  }
}

  function updateTaskStatus(taskId, newStatus) {
    fetch(`${API_URL}/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then((updatedTask) => {
        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === taskId ? updatedTask : task))
        );
      })
      .catch(() => alert("Não foi possível atualizar o status da tarefa."));
  }

  function handleDragEnd(event) {
  const { active, over } = event;

  if (!over) return;

  const taskId = active.id;
  const newStatus = over.id;

  const task = tasks.find((t) => t.id === taskId);

  if (!task) return;

  if (task.status === newStatus) return;

  fetch(`${API_URL}/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: newStatus,
    }),
  })
    .then((res) => res.json())
    .then((updatedTask) => {
      const updated = tasks.map((t) =>
        t.id === taskId ? updatedTask : t
      );

      setTasks(updated);
    });
}

  function getRealStatus(task) {
    if (task.status === "concluida") return "concluida";
    if (task.status === "andamento") return "andamento";
    if (task.deadline && new Date(task.deadline) < new Date(new Date().setHours(0, 0, 0, 0))) {
      return "atrasada";
    }
    return "pendente";
  }

  const filteredTasks = useMemo(() => {
    return selectedUser === "Todos"
      ? tasks
      : tasks.filter((task) => task.responsavel === selectedUser);
  }, [tasks, selectedUser]);

  const total = filteredTasks.length;
  const concluidas = filteredTasks.filter((task) => task.status === "concluida").length;
  const pendentes = filteredTasks.filter((task) => getRealStatus(task) === "pendente").length;
  const andamento = filteredTasks.filter((task) => getRealStatus(task) === "andamento").length;
  const atrasadas = filteredTasks.filter((task) => getRealStatus(task) === "atrasada").length;

  const ranking = useMemo(() => {
    return users
      .map((user) => {
        const userTasks = tasks.filter((task) => task.responsavel === user);
        const score = userTasks.reduce((acc, task) => acc + (Number(task.score) || 0), 0);
        return { user, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [tasks, users]);

  const statusData = [
    { name: "Concluídas", value: concluidas },
    { name: "Pendentes", value: pendentes },
    { name: "Em andamento", value: andamento },
    { name: "Atrasadas", value: atrasadas },
  ];

  const performanceData = users.map((user) => {
    const userTasks = tasks.filter((task) => task.responsavel === user);
    return {
      name: user,
      tarefas: userTasks.length,
      concluidas: userTasks.filter((task) => task.status === "concluida").length,
      pontos: userTasks.reduce((acc, task) => acc + (Number(task.score) || 0), 0),
    };
  });

  const timelineData = filteredTasks.map((task, index) => ({
    name: `T${index + 1}`,
    pontos: Number(task.score) || 0,
  }));

  function exportCSV() {
    const header = ["Titulo", "Responsavel", "Prazo", "Status", "Pontos"];
    const rows = filteredTasks.map((task) => [
      task.title,
      task.responsavel,
      task.deadline,
      getRealStatus(task),
      task.score || 0,
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((item) => `"${String(item).replaceAll('"', '""')}"`).join(";"))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-taskscore-sicoob.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportPrintReport() {
    window.print();
  }

  const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { id: "kanban", label: "Kanban", icon: <KanbanSquare size={20} /> },
  { id: "tasks", label: "Tarefas", icon: <CheckSquare size={20} /> },
  { id: "technicians", label: "Técnicos", icon: <Activity size={20} /> },
  { id: "reports", label: "Relatórios", icon: <FileText size={20} /> },
];

  function Avatar({ name }) {
    return <div className="avatar">{getInitials(name)}</div>;
  }

if (!authUser) {
  return (
    <div className="login-page">
      <style>{`
  * { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: Inter, Arial, sans-serif;
  }

  .login-page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    background:
      radial-gradient(circle at top left, rgba(0,160,145,.25), transparent 35%),
      linear-gradient(135deg, #002F2F 0%, #005C52 45%, #00A091 100%);
    position: relative;
    overflow: hidden;
  }

  .login-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
    background-size: 32px 32px;
    opacity: .4;
  }

  .login-left {
    position: relative;
    z-index: 2;
    padding: 70px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: white;
  }

  .login-logo {
    width: 190px;
    margin-bottom: 28px;
    filter: drop-shadow(0 10px 30px rgba(0,0,0,.25));
  }

  .login-brand h1 {
    font-size: 58px;
    margin: 0;
    font-weight: 900;
    letter-spacing: -3px;
  }

  .login-brand p {
    margin-top: 18px;
    font-size: 19px;
    line-height: 1.6;
    color: rgba(255,255,255,.85);
    max-width: 620px;
  }

  .login-features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
    margin-top: 46px;
    max-width: 700px;
  }

  .feature-card {
    background: rgba(255,255,255,.10);
    border: 1px solid rgba(255,255,255,.15);
    backdrop-filter: blur(10px);
    padding: 22px;
    border-radius: 20px;
    font-weight: 800;
  }

  .login-right {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
  }

  .login-card {
    width: 100%;
    max-width: 430px;
    background: rgba(255,255,255,.96);
    backdrop-filter: blur(20px);
    border-radius: 32px;
    padding: 42px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    box-shadow: 0 25px 60px rgba(0,0,0,.28);
  }

  .login-card-top h2 {
    margin: 0;
    color: #003C3C;
    font-size: 40px;
    font-weight: 900;
  }

  .login-card-top span {
    color: #64748B;
    font-size: 15px;
  }

  .login-input {
    width: 100%;
    padding: 16px 18px;
    border-radius: 16px;
    border: 1px solid #D8E3E3;
    font-size: 15px;
    outline: none;
  }

  .login-input:focus {
    border-color: #00A091;
    box-shadow: 0 0 0 4px rgba(0,160,145,.15);
  }

  .login-button {
    height: 56px;
    border: none;
    border-radius: 18px;
    background: linear-gradient(135deg,#00A091,#00796B);
    color: white;
    font-size: 16px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 15px 35px rgba(0,160,145,.35);
  }

  .login-footer {
    text-align: center;
    color: #64748B;
    margin-top: 10px;
    font-size: 14px;
  }

  @media (max-width: 1100px) {
    .login-page {
      grid-template-columns: 1fr;
    }

    .login-left {
      display: none;
    }

    .login-right {
      padding: 24px;
    }
  }
`}</style>
      <div className="login-overlay" />

      <div className="login-left">
        <div className="login-brand">
          <img
            src="/sicoob-nossacoop.png"
            alt="Sicoob"
            className="login-logo"
          />

          <h1>TaskScore Pro</h1>

          <p>
            Plataforma corporativa para gestão de demandas,
            SLA, produtividade e performance da equipe de TI.
          </p>
        </div>

        <div className="login-features">
          <div className="feature-card">
            📊 Dashboard em tempo real
          </div>

          <div className="feature-card">
            ⚡ Gestão inteligente de SLA
          </div>

          <div className="feature-card">
            🧩 Kanban interativo
          </div>

          <div className="feature-card">
            🔐 Segurança corporativa
          </div>
        </div>
      </div>

      <div className="login-right">
        <form
          onSubmit={handleLogin}
          className="login-card"
        >
          <div className="login-card-top">
            <h2>Entrar</h2>

            <span>
              Acesse sua conta corporativa
            </span>
          </div>

          <input
            type="text"
            placeholder="Usuário corporativo"
            value={loginUsername}
onChange={(e) => setLoginUsername(e.target.value)}
            className="login-input"
          />

          <input
            type="password"
            placeholder="Senha"
            value={loginPassword}
            onChange={(e) =>
              setLoginPassword(e.target.value)
            }
            className="login-input"
          />

          {loginError && (
            <div className="login-error">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
          >
            Entrar no sistema
          </button>

          <div className="login-footer">
            Sicoob NossaCoop • Gestão TI
          </div>
        </form>
      </div>
    </div>
  );
}

  function StatCard({ label, value, icon, color, description }) {
    return (
      <motion.div className="card stat-card" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <div className="stat-icon" style={{ background: `${color}18`, color }}>
          {icon}
        </div>
        <div>
          <strong>{label}</strong>
          <h2 style={{ color }}>{value}</h2>
          <small>{description}</small>
        </div>
      </motion.div>
    );
  }

  function TaskCard({ task }) {
    const status = getRealStatus(task);
    const statusColor =
      status === "concluida"
        ? colors.green
        : status === "andamento"
        ? colors.blue
        : status === "atrasada"
        ? colors.red
        : colors.yellow;
        const priorityColor = {
  baixa: "#22c55e",
  media: "#f59e0b",
  alta: "#ef4444",
};
    return (
      <motion.div
        className="task-card"
        style={{ borderLeftColor: statusColor }}
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="task-header">
          <Avatar name={task.responsavel} />
          <div>
            <h3>{task.title}</h3>
            <small>{task.responsavel}</small>
          </div>
        </div>

        <p>Prazo: {task.deadline}</p>
        <p>
          Status: <strong style={{ color: statusColor }}>{status}</strong>
        </p>
        <p>
          Pontos: <strong>{task.score || 0}</strong>
        </p>
        <p>
  Prioridade:
  <strong
    style={{
      color: priorityColor[task.priority || "media"],
      marginLeft: 6,
    }}
  >
    {task.priority || "media"}
  </strong>
</p>

<p>
  SLA:
  <strong> {task.slaHours || 24}h</strong>
</p>
        <div className="task-actions">
          {task.status !== "concluida" && (
            <button onClick={() => finishTask(task)} className="btn btn-green">
              <CheckCircle2 size={16} />
              Concluir
            </button>
          )}
          <button
  onClick={() => {
    setEditingTask(task);
    loadTaskHistory(task.id);
  }}
  className="btn btn-primary"
>
  Editar
</button>

          {task.status !== "concluida" && (
            <button onClick={() => updateTaskStatus(task.id, "andamento")} className="btn btn-yellow">
              <Activity size={16} />
              Em andamento
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm("Deseja realmente excluir esta tarefa?")) {
                deleteTask(task.id);
              }
            }}
            className="btn btn-red"
          >
            <Trash2 size={16} />
            Excluir
          </button>
        </div>
      </motion.div>
    );
  }



  function Dashboard() {
    return (
      <>
        <section className="stats-grid">
          <StatCard label="Total" value={total} icon={<FolderKanban size={28} />} color={colors.primary} description="Tarefas cadastradas" />
          <StatCard label="Concluídas" value={concluidas} icon={<CheckCircle2 size={28} />} color={colors.green} description="Tarefas finalizadas" />
          <StatCard label="Pendentes" value={pendentes} icon={<Clock3 size={28} />} color={colors.yellow} description="Aguardando execução" />
          <StatCard label="Em andamento" value={andamento} icon={<Activity size={28} />} color={colors.blue} description="Em execução" />
          <StatCard label="Atrasadas" value={atrasadas} icon={<AlertTriangle size={28} />} color={colors.red} description="Fora do prazo" />
        </section>

        <section className="card notifications-card">
  <h2>🔔 Notificações de prazo</h2>

  {notifications.length === 0 ? (
    <p>Nenhuma notificação no momento.</p>
  ) : (
    notifications.map((item, index) => (
      <div key={index} className="notification-item">
        <strong>{item.title}</strong>
        <p>{item.message}</p>
      </div>
    ))
  )}
</section>

        <section className="charts-grid">
          <motion.div className="card chart-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h3><BarChart3 size={20} /> Performance por pessoa</h3>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={70} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tarefas" name="Total de tarefas" fill={colors.blue} radius={[10, 10, 0, 0]} animationDuration={900} />
                  <Bar dataKey="concluidas" name="Concluídas" fill={colors.accent} radius={[10, 10, 0, 0]} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div className="card chart-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <h3><Activity size={20} /> Status das tarefas</h3>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={110} innerRadius={60} paddingAngle={4} label animationDuration={900}>
                    <Cell fill={colors.green} />
                    <Cell fill={colors.yellow} />
                    <Cell fill={colors.blue} />
                    <Cell fill={colors.red} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </section>

        <section className="charts-grid">
          <motion.div className="card chart-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h3><Trophy size={20} /> Pontuação por pessoa</h3>
            <div className="chart-box small-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={70} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="pontos" name="Pontos" fill={colors.primary} radius={[10, 10, 0, 0]} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div className="card chart-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <h3><BarChart3 size={20} /> Evolução de pontos</h3>
            <div className="chart-box small-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" interval={0} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="pontos" stroke={colors.primary} strokeWidth={3} dot={{ r: 5 }} animationDuration={900} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </section>
      </>
    );
  }
function DraggableTask({ task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} />
    </div>
  );
}

function DroppableColumn({ column, children }) {
  const { setNodeRef } = useDroppable({
    id: column.status,
  });

  return (
    <div ref={setNodeRef} className="card kanban-column">
      <h2 style={{ color: column.color }}>{column.title}</h2>
      {children}
    </div>
  );
}

 function Kanban() {
  const columns = [
    { title: "Pendente", status: "pendente", color: colors.yellow },
    { title: "Em andamento", status: "andamento", color: colors.blue },
    { title: "Atrasada", status: "atrasada", color: colors.red },
    { title: "Concluída", status: "concluida", color: colors.green },
  ];

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <section className="kanban-grid">
        {columns.map((column) => (
          <DroppableColumn key={column.status} column={column}>
            {filteredTasks
              .filter((task) => getRealStatus(task) === column.status)
              .map((task) => (
                <DraggableTask key={task.id} task={task} />
              ))}
          </DroppableColumn>
        ))}
      </section>
    </DndContext>
  );
}

  function Reports() {
    return (
      <section className="card reports-card">
        <h2>Relatórios</h2>
        <p>Exporte o relatório das tarefas filtradas por usuário ou do setor inteiro.</p>

        <div className="report-actions">
          <button onClick={exportCSV} className="btn btn-primary">Exportar CSV</button>
          <button onClick={exportPrintReport} className="btn btn-dark">Imprimir / Salvar PDF</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tarefa</th>
                <th>Responsável</th>
                <th>Prazo</th>
                <th>Status</th>
                <th>Pontos</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.responsavel}</td>
                  <td>{task.deadline}</td>
                  <td>{getRealStatus(task)}</td>
                  <td>{task.score || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <div className={`app-shell ${darkMode ? "dark" : ""}`}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: ${colors.bg}; }
        .app-shell {
          display: flex;
          min-height: 100vh;
          font-family: Inter, Arial, sans-serif;
          background: linear-gradient(135deg, #F4F7F8 0%, #EEF4F5 100%);
          color: ${colors.text};
        }
        .sidebar {
  width: 290px;
  min-width: 290px;
  background: linear-gradient(180deg, #003C3C 0%, #005B52 55%, #006B5F 100%);
  color: #fff;
  padding: 26px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

        .logo-area { margin-bottom: 34px; }
        .logo-area img { width: 210px; max-width: 100%; display: block; margin-bottom: 18px; }
        .logo-fallback { font-size: 22px; font-weight: 900; margin-bottom: 18px; }
        .divider { height: 1px; background: rgba(255,255,255,.18); }
        .side-nav { display: grid; gap: 12px; }
        .nav-btn {
          border: 0;
          width: 100%;
          text-align: left;
          padding: 15px 16px;
          border-radius: 16px;
          color: #fff;
          cursor: pointer;
          font-size: 17px;
          font-weight: 800;
          background: transparent;
          letter-spacing: .2px;
          transition: all .25s ease;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-btn:hover { background: rgba(255,255,255,.10); transform: translateX(3px); }
        .nav-btn.active {
          background: linear-gradient(135deg, ${colors.accent}, ${colors.primary});
          box-shadow: 0 14px 30px rgba(0,0,0,.22);
        }
        .sidebar-user {
  margin-top: 24px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255,255,255,.10);
  border: 1px solid rgba(255,255,255,.18);
  position: static;
}
        .sidebar-user p { margin: 6px 0 0; opacity: .8; }
        .main-content {
          flex: 1;
          padding: 32px 36px;
          min-width: 0;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 26px;
        }
        .page-header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .theme-btn {
          width: 48px;
          height: 48px;
          padding: 0;
          display: grid;
          place-items: center;
        }
        .page-header h1 {
          margin: 0;
          font-size: clamp(30px, 4vw, 44px);
          font-weight: 900;
          letter-spacing: -2px;
          color: ${colors.text};
          line-height: 1.05;
        }
        .page-header p {
          color: ${colors.muted};
          margin: 8px 0 0;
          font-size: clamp(15px, 2vw, 18px);
        }
        .card {
          background: #fff;
          border-radius: 22px;
          padding: 24px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          border: 1px solid ${colors.border};
          transition: all .25s ease;
        }
        .input, .select {
          padding: 13px 16px;
          border-radius: 14px;
          border: 1px solid ${colors.border};
          outline: none;
          color: ${colors.text};
          background: #fff;
          font-size: 15px;
          min-width: 0;
          width: 100%;
        }
        .btn {
          padding: 13px 20px;
          border-radius: 14px;
          border: 0;
          color: #fff;
          font-weight: 800;
          cursor: pointer;
          transition: all .25s ease;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn:hover { transform: translateY(-1px); filter: brightness(.98); }
        .btn-primary { background: linear-gradient(135deg, ${colors.accent}, ${colors.primary}); box-shadow: 0 18px 40px rgba(0,160,145,.35); }
        .btn-green { background: ${colors.green}; padding: 9px 12px; }
        .btn-yellow { background: ${colors.yellow}; color: ${colors.text}; padding: 9px 12px; }
        .btn-red { background: ${colors.red}; padding: 9px 12px; }
        .btn-dark { background: ${colors.primaryDark}; }
        .task-form-card { margin-bottom: 24px; }
        .task-form-card h2 { margin: 0 0 16px; text-align: center; color: ${colors.text}; font-size: 26px; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .task-form-grid {
          display: grid;
          grid-template-columns: minmax(220px, 1fr) minmax(150px, 190px) minmax(150px, 190px) minmax(140px, 170px);
          gap: 14px;
          align-items: center;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }
        .stat-card { display: flex; align-items: center; gap: 18px; min-height: 150px; }
        .stat-icon {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
        }
        .stat-card h2 { margin: 6px 0; font-size: 32px; }
        .stat-card small { color: ${colors.muted}; }
        .charts-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; margin-bottom: 24px; }
        .chart-card h3 { font-size: 20px; color: ${colors.text}; margin: 0 0 18px; display: flex; align-items: center; gap: 10px; }
        .chart-box { width: 100%; height: 330px; min-width: 0; }
        .small-chart { height: 300px; }
        .kanban-grid { display: grid; grid-template-columns: repeat(4, minmax(240px, 1fr)); gap: 18px; overflow-x: auto; padding-bottom: 10px; }
        .kanban-column { min-height: 450px; }
        .task-card {
          border: 1px solid ${colors.border};
          border-left: 6px solid ${colors.primary};
          border-radius: 18px;
          padding: 16px;
          margin-bottom: 12px;
          background: #fff;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
        }
        .task-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .task-card h3 { margin: 0; color: ${colors.text}; }
        .task-card p { color: ${colors.muted}; margin: 8px 0; }
        .task-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${colors.primarySoft};
          color: ${colors.primary};
          display: grid;
          place-items: center;
          font-weight: 900;
          font-size: 14px;
          flex: 0 0 auto;
        }
        .tasks-layout { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr); gap: 18px; }
        .ranking-row { display: flex; justify-content: space-between; border-bottom: 1px solid ${colors.border}; padding: 14px 0; color: ${colors.text}; }
        .reports-card h2 { color: ${colors.text}; margin-top: 0; }
        .reports-card p { color: ${colors.muted}; }
        .report-actions { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 650px; }
        thead tr { background: ${colors.primarySoft}; color: ${colors.text}; }
        th, td { padding: 14px; text-align: left; border-bottom: 1px solid ${colors.border}; }

        .dark {
          background: #071B1B;
          color: #fff;
        }
        .dark .app-shell,
        .app-shell.dark {
          background: linear-gradient(135deg, #061B1B 0%, #092525 100%);
          color: #fff;
        }
        .dark .card,
        .dark .task-card {
          background: #0F2A2A;
          border-color: rgba(255,255,255,.08);
        }
        .dark .input,
        .dark .select {
          background: #123333;
          color: #fff;
          border-color: rgba(255,255,255,.12);
        }
        .dark .page-header h1,
        .dark .task-form-card h2,
        .dark .chart-card h3,
        .dark .task-card h3,
        .dark .reports-card h2,
        .dark .ranking-row {
          color: #fff;
        }
        .dark .page-header p,
        .dark .task-card p,
        .dark small,
        .dark .reports-card p,
        .dark .stat-card small {
          color: #C8D5D5;
        }
        .dark thead tr {
          background: rgba(255,255,255,.08);
          color: #fff;
        }

        @media (max-width: 1180px) {
          .app-shell { flex-direction: column; }
          .sidebar {
            position: relative;
            width: 100%;
            min-width: 0;
            height: auto;
            padding: 18px;
          }
          .logo-area { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }
          .logo-area img { width: 170px; margin-bottom: 0; }
          .divider { display: none; }
          .side-nav { grid-template-columns: repeat(4, minmax(120px, 1fr)); }
          .sidebar-user { display: none; }
          .main-content { padding: 24px; }
        }
        @media (max-width: 900px) {
          .page-header { flex-direction: column; align-items: stretch; }
          .page-header-actions { width: 100%; }
          .task-form-grid { grid-template-columns: 1fr 1fr; }
          .task-form-grid .btn { grid-column: 1 / -1; width: 100%; }
          .charts-grid { grid-template-columns: 1fr; }
          .tasks-layout { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .main-content { padding: 18px; }
          .side-nav { grid-template-columns: 1fr 1fr; }
          .nav-btn { font-size: 15px; padding: 13px 12px; }
          .task-form-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr; }
          .stat-card { min-height: 120px; }
          .chart-box { height: 290px; }
          .page-header h1 { letter-spacing: -1px; }
        }
          .notifications-card {
  margin-bottom: 24px;
}

.notification-item {
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  margin-top: 12px;
  border-left: 5px solid #f59e0b;
}

.technicians-layout {
  display: grid;
  gap: 20px;
}

.technician-form {
  grid-template-columns: 1fr;
}

.technician-form {
  display: grid;
  grid-template-columns: 1fr 1fr 180px;
  gap: 12px;
  align-items: center;
}

.technicians-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.technician-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid #dce7e7;
  background: white;
}

.tech-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e5f6f3;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: #006b5f;
}

.tech-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

@media (max-width: 900px) {
  .kanban-grid {
    grid-template-columns: repeat(4, 320px);
    overflow-x: auto;
  }

  .technician-form {
  grid-template-columns: 1fr;
}

  .chart-box {
    height: 260px;
  }

  .task-actions {
    flex-direction: column;
  }

  .task-actions button {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .page-header-actions {
    flex-direction: column;
  }

  .page-header-actions .select,
  .page-header-actions .btn {
    width: 100%;
  }

  .sidebar {
    padding: 14px;
  }

  .side-nav {
  display: grid;
  gap: 12px;
  flex: 1;
}


  .main-content {
    padding: 14px;
  }

  .task-card {
    padding: 14px;
  }

  .chart-box {
    height: 230px;
  }
}

.tech-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tech-actions .btn {
  padding: 9px 12px;
}

@media (max-width: 640px) {
  .technician-card {
    flex-direction: column;
    align-items: stretch;
  }

  .tech-actions {
    width: 100%;
  }

  .tech-actions .btn {
    width: 100%;
  }
}
.technician-card.editing {
  align-items: stretch;
}

.tech-edit-form {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items: center;
}

.tech-edit-form .input {
  min-width: 180px;
}

.tech-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tech-actions .btn {
  min-width: 110px;
  height: 44px;
}

@media (max-width: 900px) {
  .tech-edit-form {
    grid-template-columns: 1fr;
  }

  .tech-edit-form .input,
  .tech-actions .btn {
    width: 100%;
  }
} 

.dark .input,
.dark .select {
  background: #123333;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.18);
}

.dark .input::placeholder {
  color: #a7c4c4;
}

.dark .technician-card {
  background: #0f2a2a;
  border-color: rgba(255, 255, 255, 0.12);
}

.dark .tech-info strong,
.dark .technician-card strong,
.dark .technician-card h2 {
  color: #ffffff;
}

.dark .tech-info small,
.dark .technician-card small {
  color: #c8d5d5;
}

.dark .notification-item {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.dark .notification-item p {
  color: #c8d5d5;
}

.dark table,
.dark th,
.dark td {
  color: #ffffff;
}

.dark .ranking-row span,
.dark .ranking-row strong {
  color: #ffffff;
}

.dark .recharts-text,
.dark .recharts-cartesian-axis-tick-value {
  fill: #c8d5d5;
}

.dark .recharts-legend-item-text {
  color: #c8d5d5 !important;
}

.dark .recharts-tooltip-wrapper {
  color: #073b3a;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 650px;
  background: var(--card);
  border-radius: 24px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.history-box {
  margin-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 16px;
}

.history-item {
  padding: 12px;
  border-radius: 14px;
  background: rgba(255,255,255,0.04);
  margin-bottom: 10px;
}

.logout-btn {
  width: 100%;
  margin-top: 12px;
  padding: 10px 12px;
  border: 0;
  border-radius: 12px;
  background: rgba(255,255,255,0.14);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.22);
}

.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  background:
    radial-gradient(circle at top left, rgba(0,160,145,.25), transparent 35%),
    linear-gradient(135deg, #002F2F 0%, #005C52 45%, #00A091 100%);
  position: relative;
  overflow: hidden;
}

.login-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: .4;
}

.login-left {
  position: relative;
  z-index: 2;
  padding: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
}

.login-brand {
  max-width: 620px;
}

.login-logo {
  width: 150px;
  margin-bottom: 24px;
  filter: drop-shadow(0 10px 30px rgba(0,0,0,.25));
}

.login-brand h1 {
  font-size: 64px;
  margin: 0;
  font-weight: 900;
  letter-spacing: -3px;
}

.login-brand p {
  margin-top: 20px;
  font-size: 20px;
  line-height: 1.7;
  color: rgba(255,255,255,.82);
}

.login-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  margin-top: 50px;
  max-width: 700px;
}

.feature-card {
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
  backdrop-filter: blur(10px);
  padding: 22px;
  border-radius: 20px;
  font-weight: 700;
  transition: .3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  background: rgba(255,255,255,.12);
}

.login-right {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.login-card {
  width: 100%;
  max-width: 430px;
  background: rgba(255,255,255,.95);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  padding: 42px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 25px 60px rgba(0,0,0,.25);
}

.login-card-top h2 {
  margin: 0;
  color: #003C3C;
  font-size: 40px;
  font-weight: 900;
}

.login-card-top span {
  color: #64748B;
  font-size: 15px;
}

.login-input {
  width: 100%;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid #D8E3E3;
  font-size: 15px;
  outline: none;
  transition: .2s;
}

.login-input:focus {
  border-color: #00A091;
  box-shadow: 0 0 0 4px rgba(0,160,145,.15);
}

.login-button {
  height: 56px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg,#00A091,#00796B);
  color: white;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: .25s;
  box-shadow: 0 15px 35px rgba(0,160,145,.35);
}

.login-button:hover {
  transform: translateY(-2px);
}

.login-error {
  background: #FEE2E2;
  color: #DC2626;
  padding: 14px;
  border-radius: 14px;
  font-weight: 700;
}

.login-footer {
  text-align: center;
  color: #64748B;
  margin-top: 10px;
  font-size: 14px;
}

@media (max-width: 1100px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-left {
    display: none;
  }

  .login-right {
    padding: 24px;
  }

  .login-card {
    max-width: 100%;
  }
}
      `}</style>

      <aside className="sidebar">
        <div className="logo-area">
          <img src="/sicoob-nossacoop.png" alt="Sicoob Nossacoop" />
          <div className="logo-fallback">Sicoob Nossacoop</div>
          <div className="divider" />
        </div>

        <nav className="side-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`nav-btn ${activeView === item.id ? "active" : ""}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-user">
  <strong>{authUser?.name || "Usuário"}</strong>
  <p>{authUser?.role || "Gestão TI"}</p>

  <button
    onClick={handleLogout}
    className="logout-btn"
  >
    Sair
  </button>
</div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>Gestão de Demandas TI</h1>
            <p>Agenda, pontuação, Kanban, dashboard e relatórios.</p>
          </div>

          <div className="page-header-actions">
            <button onClick={() => setDarkMode(!darkMode)} className="btn btn-primary theme-btn" title="Alternar tema">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="select">
              <option>Todos</option>
              {users.map((user) => (
                <option key={user}>{user}</option>
              ))}
            </select>
          </div>
        </header>

  
        {activeView === "technicians" && (
  <TechniciansPage
    technicians={technicians}
    newTechnician={newTechnician}
    setNewTechnician={setNewTechnician}
    newTechnicianRole={newTechnicianRole}
    setNewTechnicianRole={setNewTechnicianRole}
    addTechnician={addTechnician}
    editingTechnicianId={editingTechnicianId}
editingTechnicianName={editingTechnicianName}
setEditingTechnicianName={setEditingTechnicianName}
editingTechnicianRole={editingTechnicianRole}
setEditingTechnicianRole={setEditingTechnicianRole}
startEditTechnician={startEditTechnician}
cancelEditTechnician={cancelEditTechnician}
saveEditTechnician={saveEditTechnician}
    deleteTechnician={deleteTechnician}
  />
)}      
        {activeView === "dashboard" && <Dashboard />}
        {activeView === "kanban" && <Kanban />}
        {activeView === "reports" && <Reports />}

       {activeView === "tasks" && (
  <>
    <section className="card task-form-card">
      <h2><Plus size={24} /> Nova tarefa</h2>

      <div className="task-form-grid">
        <input
          placeholder="Título da tarefa"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />

        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="input"
        />

        <select
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
          className="select"
        >
          {users.map((user) => (
            <option key={user}>{user}</option>
          ))}
        </select>

        <button onClick={addTask} className="btn btn-primary">
          <Plus size={18} />
          Adicionar
        </button>
      </div>
    </section>

    <section className="tasks-layout">
      <div className="card">
        <h2>Tarefas</h2>
        {filteredTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <div className="card">
        <h2><Trophy size={22} /> Ranking</h2>
        {ranking.map((item, index) => (
          <div key={item.user} className="ranking-row">
            <span>{index + 1}º {item.user}</span>
            <strong>{item.score} pts</strong>
          </div>
        ))}
      </div>
    </section>
  </>
)}
      {editingTask && (
  <div className="modal-overlay">
    <div className="modal-card">
      <h2>Editar tarefa</h2>

      <input
        className="input"
        value={editingTask.title}
        onChange={(e) =>
          setEditingTask({
            ...editingTask,
            title: e.target.value,
          })
        }
      />

      <input
        type="date"
        className="input"
        value={editingTask.deadline}
        onChange={(e) =>
          setEditingTask({
            ...editingTask,
            deadline: e.target.value,
          })
        }
      />

      <select
        className="input"
        value={editingTask.priority || "media"}
        onChange={(e) =>
          setEditingTask({
            ...editingTask,
            priority: e.target.value,
          })
        }
      >
        <option value="baixa">Baixa</option>
        <option value="media">Média</option>
        <option value="alta">Alta</option>
      </select>

      <input
        type="number"
        className="input"
        value={editingTask.slaHours || 24}
        onChange={(e) =>
          setEditingTask({
            ...editingTask,
            slaHours: Number(e.target.value),
          })
        }
      />

      <textarea
        className="input"
        placeholder="Descrição"
        value={editingTask.description || ""}
        onChange={(e) =>
          setEditingTask({
            ...editingTask,
            description: e.target.value,
          })
        }
      />

      <div className="modal-actions">
        <button
          className="btn btn-green"
          onClick={() =>
            updateTask(editingTask.id, editingTask)
          }
        >
          Salvar
        </button>

        <button
          className="btn btn-dark"
          onClick={() => setEditingTask(null)}
        >
          Cancelar
        </button>
      </div>

      <div className="history-box">
        <h3>Histórico</h3>

        {taskHistory.map((item) => (
          <div key={item.id} className="history-item">
            <strong>{item.action}</strong>
            <p>{item.details}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

      </main>
    </div>
  );
}
