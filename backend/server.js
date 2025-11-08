import express from "express";
import fs from "fs";
import cors from "cors";
import { spawn } from "child_process";


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

app.post("/run-python", async (req, res) => {
  try {
    // Accept either flat body or body.body wrapper
    const payload = req.body && req.body.body ? req.body.body : req.body || {};
    let { transcription, template, pdf } = payload;

    if (!transcription) {
      return res.status(400).json({ success: false, error: "Missing 'transcription'" });
    }

    // If template is not provided, use the first template's field labels
    if (!template || !Array.isArray(template)) {
      try {
        const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
        const first = Array.isArray(data) && data.length ? data[0] : null;
        template = first?.fields?.map((f) => f.label) || [];
      } catch {
        template = [];
      }
    }

    // Resolve default/sample PDF if not provided or invalid
    const defaultPdf = new URL("../src/inputs/file.pdf", import.meta.url).pathname;
    if (!pdf || typeof pdf !== "string" || !fs.existsSync(pdf)) {
      pdf = defaultPdf;
    }

    const scriptPath = new URL("../src/main.py", import.meta.url).pathname;
    const py = process.env.PYTHON || "python3"; // macOS typically uses python3
    const args = [
      scriptPath,
      String(transcription),
      JSON.stringify(template || []),
      String(pdf),
    ];

    let output = "";
    let errorOutput = "";

    const child = spawn(py, args);
    child.on("error", (err) => {
      if (err && err.code === "ENOENT") {
        // Fallback to 'python'
        const child2 = spawn("python", args);
        child2.stdout?.on("data", (d) => (output += d.toString()));
        child2.stderr?.on("data", (d) => (errorOutput += d.toString()));
        child2.on("close", (code) => {
          console.log(` Python script finished with code ${code}`);
          if (errorOutput) console.error(" Python Error:", errorOutput);
          res.json({ success: code === 0, output: output || errorOutput || "No output from Python" });
        });
      } else {
        res.status(500).json({ success: false, error: String(err?.message || err) });
      }
    });

    child.stdout?.on("data", (d) => (output += d.toString()));
    child.stderr?.on("data", (d) => (errorOutput += d.toString()));
    child.on("close", (code) => {
      console.log(` Python script finished with code ${code}`);
      if (errorOutput) console.error(" Python Error:", errorOutput);
      res.json({ success: code === 0, output: output || errorOutput || "No output from Python" });
    });
  } catch (err) {
    console.error(" Error in /run-python:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(4000, () => console.log("Server running on port 4000"));
