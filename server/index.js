const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());

// Load data files once at startup
const teams = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/teams.json")),
);
const matches = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/matches.json")),
);
const referees = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/referees.json")),
);
const goals = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/goals.json")),
);
const matchCumStats = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/match_cum_agg_stats.json")),
);
const teamMatchStats = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/team_match_stats.json")),
);
const teamsInfo = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/teams_info.json")),
);
const table = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/table.json")),
);

// Teams
app.get("/api/teams", (req, res) => {
  res.json(teams);
});

// Matches
app.get("/api/matches", (req, res) => {
  res.json(matches);
});

// Referees with card stats
app.get("/api/referees", (req, res) => {
  const cardsByMatch = {};
  matchCumStats.forEach((s) => {
    cardsByMatch[s.WS_match_id] = s.totalTotal_Cards || 0;
  });

  const result = referees
    .map((ref) => {
      const refMatches = matches.filter((m) => m.refereeCode === ref.ref_code);
      const totalCards = refMatches.reduce(
        (sum, m) => sum + (cardsByMatch[m.WS_match_id] || 0),
        0,
      );
      const gamesRefereed = refMatches.length;
      const cardsPerGame =
        gamesRefereed > 0
          ? parseFloat((totalCards / gamesRefereed).toFixed(2))
          : 0;
      return {
        name: ref.ref_name,
        totalCards,
        gamesRefereed,
        cardsPerGame,
      };
    })
    .filter((r) => r.gamesRefereed > 0);

  res.json(result);
});

// Goals
app.get("/api/goals", (req, res) => {
  res.json(goals);
});

// Match cum agg stats
app.get("/api/match-stats", (req, res) => {
  res.json(matchCumStats);
});

// Team match stats
app.get("/api/team-match-stats", (req, res) => {
  res.json(teamMatchStats);
});

// Team info
app.get("/api/teams-info", (req, res) => {
  res.json(teamsInfo);
});

// Table
app.get("/api/table", (req, res) => {
  res.json(table);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
