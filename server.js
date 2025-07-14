const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());

const PICKS_FILE = path.join(__dirname, "data", "picks.json");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/picks", (req, res) => {
  fs.readFile(PICKS_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error reading picks.");
    res.send(JSON.parse(data));
  });
});

app.post("/api/picks", (req, res) => {
  const { name, fightId, pick, method, isUnderdog } = req.body;
  fs.readFile(PICKS_FILE, "utf8", (err, rawData) => {
    if (err) return res.status(500).send("Failed to read picks file.");
    const data = JSON.parse(rawData);

    if (!data[name]) data[name] = [];

    const existing = data[name].find(p => p.fightId === fightId);
    if (existing) return res.status(400).send("Already picked.");

    data[name].push({ fightId, pick, method, isUnderdog });
    fs.writeFile(PICKS_FILE, JSON.stringify(data, null, 2), err => {
      if (err) return res.status(500).send("Failed to save pick.");
      res.send("Pick saved.");
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ UFC Picks app running on port ${PORT}`);
});
