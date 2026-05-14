const express = require("express");
const db = require("../database/db.cjs");

const router = express.Router();

// LISTAR TÉCNICOS
router.get("/", (req, res) => {
  db.all("SELECT * FROM technicians ORDER BY name ASC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

// CRIAR TÉCNICO
router.post("/", (req, res) => {
  const { name, role } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Nome do técnico é obrigatório." });
  }

  const createdAt = new Date().toISOString();

  db.run(
    `
    INSERT INTO technicians (name, role, createdAt)
    VALUES (?, ?, ?)
    `,
    [name, role || "Técnico de TI", createdAt],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.get(
        "SELECT * FROM technicians WHERE id = ?",
        [this.lastID],
        (err, technician) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json(technician);
        }
      );
    }
  );
});

// DELETAR TÉCNICO
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM technicians WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ success: true, deletedId: id });
  });
});

module.exports = router;