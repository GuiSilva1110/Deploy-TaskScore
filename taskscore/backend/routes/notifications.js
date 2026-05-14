const express = require("express");
const db = require("../database/db.cjs");

const router = express.Router();

router.get("/", (req, res) => {
  db.all("SELECT * FROM notifications ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

module.exports = router;