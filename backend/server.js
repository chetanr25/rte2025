import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = "../frontend/src/db/db.json";

app.get("/templates", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  res.json(data);
});

app.post("/templates/:id", (req, res) => {
  const { id } = req.params;
  const updatedTemplate = req.body;
  const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  const index = data.findIndex(t => String(t.id) === id);

  if (index !== -1) {
    data[index] = updatedTemplate;
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    res.json({ message: "Template saved successfully!" });
  } else {
    res.status(404).json({ message: "Template not found" });
  }
});

app.listen(4000, () => console.log("Server running on port 4000"));
