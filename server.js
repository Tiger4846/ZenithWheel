// server.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const prizesModel = require("./prizesModel");
const fs = require("fs"); // Used only for initial seeding if needed

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// เสิร์ฟไฟล์หน้าเว็บจากโฟลเดอร์ public
app.use(express.static(path.join(__dirname, "public")));

// --- Initialization ---
// Initialize DB
(async () => {
  try {
    await prizesModel.initTable();
    console.log("Database initialized.");
  } catch (err) {
    console.error("Initialization error:", err);
  }
})();

// --- API: GET /api/prizes (โหลดรางวัลทั้งหมด) ---
app.get("/api/prizes", async (req, res) => {
  try {
    const prizes = await prizesModel.getAllPrizes();
    res.json({ prizes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- API: POST /api/prizes (เซฟทั้งชุด) ---
app.post("/api/prizes", async (req, res) => {
  const { prizes } = req.body;
  if (!Array.isArray(prizes)) {
    return res.status(400).json({ error: "prizes must be an array" });
  }

  try {
    await prizesModel.resetPrizes(prizes);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// (ออปชันเสริม) endpoint สำหรับหมุนแล้วลดจำนวนทีละช่อง
app.post("/api/prizes/:id/decrement", async (req, res) => {
  const id = req.params.id;
  try {
    const updatedPrize = await prizesModel.decrementPrizeQuantity(id);
    if (!updatedPrize) {
      // Could be not found or quantity was already 0
      // For now, let's check if it exists to give better error
      // But for simplicity/speed, if it returns null we can assume it failed to decrement
      // However, the original code returned 404 if not found.
      // Let's keep it simple: if null, we assume it didn't change (either not found or 0)
      // To be strict with original logic:
      const all = await prizesModel.getAllPrizes();
      const exists = all.find(p => String(p.id) === String(id));
      if (!exists) {
        return res.status(404).json({ error: "Prize not found" });
      }
      // If exists but didn't decrement, it means quantity was 0
      return res.json({ ok: true, prize: exists });
    }
    res.json({ ok: true, prize: updatedPrize });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
