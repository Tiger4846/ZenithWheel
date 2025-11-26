// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;

// ไฟล์เก็บข้อมูล
const DATA_FILE = path.join(__dirname, "prizes.json");

// --- Middleware ---
app.use(cors());
app.use(express.json());

// เสิร์ฟไฟล์หน้าเว็บจากโฟลเดอร์ public
app.use(express.static(path.join(__dirname, "public")));

// --- ฟังก์ชันช่วยอ่าน/เขียนไฟล์ ---
function readPrizesFromFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Read file error:", err);
    return [];
  }
}

function writePrizesToFile(prizes) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(prizes, null, 2), "utf8");
}

// --- API: GET /api/prizes (โหลดรางวัลทั้งหมด) ---
app.get("/api/prizes", (req, res) => {
  const prizes = readPrizesFromFile();
  res.json({ prizes });
});

// --- API: POST /api/prizes (เซฟทั้งชุด) ---
// frontend จะส่ง { prizes: [...] } มา
app.post("/api/prizes", (req, res) => {
  const { prizes } = req.body;
  if (!Array.isArray(prizes)) {
    return res.status(400).json({ error: "prizes must be an array" });
  }

  writePrizesToFile(prizes);
  res.json({ ok: true });
});

// (ออปชันเสริม) endpoint สำหรับหมุนแล้วลดจำนวนทีละช่อง
app.post("/api/prizes/:id/decrement", (req, res) => {
  const id = req.params.id;
  const prizes = readPrizesFromFile();
  const index = prizes.findIndex((p) => String(p.id) === String(id));

  if (index === -1) {
    return res.status(404).json({ error: "Prize not found" });
  }

  if (prizes[index].quantity > 0) {
    prizes[index].quantity -= 1;
  }

  writePrizesToFile(prizes);
  res.json({ ok: true, prize: prizes[index] });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
