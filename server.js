const express = require("express");
const Database = require("better-sqlite3");
const words = require("./words.json");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Database: creates game.db automatically if it doesn't exist
const db = new Database("game.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    points INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

app.get("/api/words", (req, res) => res.json(words));

app.post("/api/scores", (req, res) => {
  const name = String(req.body.name || "").trim().slice(0, 20);
  const points = Number(req.body.points);
  if (!name || !Number.isInteger(points) || points < 0 || points > 50) {
    return res.status(400).json({ error: "Invalid score" });
  }
  db.prepare("INSERT INTO scores (name, points) VALUES (?, ?)").run(name, points);
  res.status(201).json({ ok: true });
});

app.get("/api/leaderboard", (req, res) => {
  const rows = db.prepare(
    "SELECT name, points FROM scores ORDER BY points DESC, created_at ASC LIMIT 10"
  ).all();
  res.json(rows);
});

app.listen(3000, () => console.log("Running at http://localhost:3000"));