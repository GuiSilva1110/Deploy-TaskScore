const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error("Erro ao conectar banco:", err.message);
  } else {
    console.log("SQLite conectado.");
  }
});

// TABELA DE TAREFAS
db.serialize(() => {

  db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'tecnico',
    createdAt TEXT
  )
`);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      deadline TEXT NOT NULL,
      responsavel TEXT NOT NULL,
      status TEXT DEFAULT 'pendente',
      score INTEGER DEFAULT 0,
      createdAt TEXT,
      finishedAt TEXT
    )
  `);

db.run("ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'media'", () => {});
db.run("ALTER TABLE tasks ADD COLUMN description TEXT DEFAULT ''", () => {});
db.run("ALTER TABLE tasks ADD COLUMN slaHours INTEGER DEFAULT 24", () => {});
db.run("ALTER TABLE tasks ADD COLUMN updatedAt TEXT", () => {});

db.run(`
  CREATE TABLE IF NOT EXISTS task_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taskId INTEGER NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    createdAt TEXT
  )
`);
  // TABELA DE TÉCNICOS
  db.run(`
    CREATE TABLE IF NOT EXISTS technicians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      role TEXT DEFAULT 'Técnico de TI',
      createdAt TEXT
    )
  `);

  // TABELA DE NOTIFICAÇÕES
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      message TEXT,
      read INTEGER DEFAULT 0,
      createdAt TEXT
    )
  `);
});

module.exports = db;