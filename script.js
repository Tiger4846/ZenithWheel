// Global variables
let prizes = [];
let isSpinning = false;
let currentRotation = 0;
let lastWinner = null;
let currentLanguage = "en";
let useGoogleSheets = false; // เปิดใช้งาน Google Sheets หรือไม่

// Language translations
const translations = {
  th: {
    wheelTitle: "🎡 วงล้อสุ่มรางวัล",
    manageTitle: "⚙️ จัดการรางวัล",
    spinButton: "🎯 หมุนวงล้อ",
    spinButtonSpinning: "🎡 กำลังหมุน...",
    spinButtonSelecting: "🎯 เลือกรางวัลเดียวที่เหลือ...",
    spinButtonNoMore: "❌ รางวัลหมดแล้ว",
    spinButtonFinal: "🎯 เลือกรางวัลสุดท้าย",
    clickToStart: 'คลิกปุ่ม "หมุนวงล้อ" เพื่อเริ่มเล่น!',
    addPrizeTitle: "เพิ่มรางวัลใหม่",
    prizeName: "ชื่อรางวัล:",
    prizeNamePlaceholder: "กรุณาใส่ชื่อรางวัล",
    quantity: "จำนวน:",
    quantityPlaceholder: "จำนวน",
    addButton: "➕ เพิ่มรางวัล",
    prizeListTitle: "📋 รายการรางวัลทั้งหมด",
    noPrives: "ยังไม่มีรางวัล",
    addPrizeToStart: "เพิ่มรางวัลใหม่เพื่อเริ่มใช้งานวงล้อ",
    congrats: "🎉 ยินดีด้วย! 🎉",
    congratsText: "รางวัลของคุณ",
    congratsSubtext: "คุณได้รับรางวัลแล้ว!",
    closeButton: "✨ ปิด",
    deleteButton: "🗑️ ลบ",
    noRewards: "ไม่มีรางวัล",
    noRewardsAvailable: "รางวัลหมดแล้ว",
    addQuantity: "เพิ่มจำนวนรางวัล",
    spinAgain: "🎯 หมุนวงล้อเพื่อรับรางวัลใหม่! 🎉",
    selectReward: "🎯 ได้รับ",
    remaining: "คงเหลือ:",
    outOf: "จาก",
    outOfStock: "(หมด)",
    backButton: "← กลับ",
    noPrizesWheel: "ไม่มีรางวัล",
    allPrizesGone: "รางวัลหมดแล้ว",
    onePrizeLeft: "🎯 เหลือรางวัลเดียว! การหมุนจะได้รางวัลนี้อัตโนมัติ",
    allPrizesGoneWarning: "⚠️ รางวัลทั้งหมดหมดแล้ว! กรุณาเพิ่มจำนวนรางวัล",
  },
  en: {
    wheelTitle: "🎡 Spin Wheel",
    manageTitle: "⚙️ Manage Prizes",
    spinButton: "🎯 Spin Wheel",
    spinButtonSpinning: "🎡 Spinning...",
    spinButtonSelecting: "🎯 Selecting Last Prize...",
    spinButtonNoMore: "❌ No Prizes Left",
    spinButtonFinal: "🎯 Select Last Prize",
    clickToStart: 'Click "Spin Wheel" button to start playing!',
    addPrizeTitle: "Add New Prize",
    prizeName: "Prize Name:",
    prizeNamePlaceholder: "Enter prize name",
    quantity: "Quantity:",
    quantityPlaceholder: "Quantity",
    addButton: "➕ Add Prize",
    prizeListTitle: "📋 All Prizes",
    noPrives: "No Prizes",
    addPrizeToStart: "Add a new prize to start using the wheel",
    congrats: "🎉 Congratulations! 🎉",
    congratsText: "Your Prize",
    congratsSubtext: "You won!",
    closeButton: "✨ Close",
    deleteButton: "🗑️ Delete",
    noRewards: "No Rewards",
    noRewardsAvailable: "All prizes are gone",
    addQuantity: "Add prize quantity",
    spinAgain: "🎯 Spin the wheel to get a new prize! 🎉",
    selectReward: "🎯 You Got",
    remaining: "Remaining:",
    outOf: "of",
    outOfStock: "(Out)",
    backButton: "← Back",
    noPrizesWheel: "No Prizes",
    allPrizesGone: "All prizes are gone",
    onePrizeLeft: "🎯 Only one prize left! Spin will select it automatically",
    allPrizesGoneWarning: "⚠️ All prizes are gone! Please add more quantities",
  },
};

function t(key) {
  return translations[currentLanguage][key] || key;
}

function toggleLanguage() {
  currentLanguage = currentLanguage === "th" ? "en" : "th";
  const btn = document.getElementById("lang-toggle");
  btn.textContent = currentLanguage === "th" ? "TH" : "EN";
  updatePageLanguage();
}

function updatePageLanguage() {
  // Update navigation buttons
  const navBtns = document.querySelectorAll(".nav-btn");
  if (navBtns[0]) navBtns[0].textContent = t("manageTitle");

  // Update spin button
  const spinBtn = document.getElementById("spin-btn");
  if (spinBtn) {
    if (spinBtn.disabled) {
      if (spinBtn.textContent.includes("ปิด") || spinBtn.textContent.includes("No Prizes")) {
        spinBtn.textContent = t("spinButtonNoMore");
      }
    } else if (spinBtn.textContent.includes("เลือก") || spinBtn.textContent.includes("Select")) {
      spinBtn.textContent = t("spinButtonFinal");
    } else {
      spinBtn.textContent = t("spinButton");
    }
  }

  // Update management page titles
  const addPrizeTitle = document.querySelector(".add-prize");
  if (addPrizeTitle) addPrizeTitle.textContent = t("addPrizeTitle");

  const prizeLabels = document.querySelectorAll(".form-group label");
  if (prizeLabels[0]) prizeLabels[0].textContent = t("prizeName");
  if (prizeLabels[1]) prizeLabels[1].textContent = t("quantity");

  const addBtn = document.querySelector(".add-btn");
  if (addBtn) addBtn.textContent = t("addButton");

  const prizeHeader = document.querySelector(".prizes-header");
  if (prizeHeader) prizeHeader.textContent = t("prizeListTitle");

  // Update empty state
  const emptyState = document.querySelector(".empty-state");
  if (emptyState) {
    const h3 = emptyState.querySelector("h3");
    const p = emptyState.querySelector("p");
    if (h3) h3.textContent = t("noPrives");
    if (p) p.textContent = t("addPrizeToStart");
  }

  // Update modal header
  const modalHeader = document.querySelector(".modal-header h2");
  if (modalHeader) modalHeader.textContent = t("congrats");

  const closeBtn = document.querySelector(".modal-close-btn");
  if (closeBtn) closeBtn.textContent = t("closeButton");

  // Update back button
  const backBtn = document.getElementById("back-btn");
  if (backBtn) backBtn.textContent = t("backButton");

  // Update input placeholders
  const prizeNameInput = document.getElementById("prize-name");
  const quantityInput = document.getElementById("prize-quantity");
  if (prizeNameInput) prizeNameInput.placeholder = t("prizeNamePlaceholder");
  if (quantityInput) quantityInput.placeholder = t("quantityPlaceholder");

  // Update wheel
  updateWheel();
  updatePrizesList();
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", async function () {
  // ตรวจสอบว่า Google Sheets ถูกตั้งค่าแล้วหรือยัง
  if (typeof GoogleSheetsAPI !== 'undefined' && isGoogleSheetsConfigured()) {
    useGoogleSheets = true;
    console.log('Google Sheets integration enabled');
    
    // ลองโหลดข้อมูลจาก Google Sheets
    const sheetPrizes = await GoogleSheetsAPI.loadPrizesFromSheet();
    if (sheetPrizes && sheetPrizes.length > 0) {
      prizes = sheetPrizes;
      console.log('Prizes loaded from Google Sheets:', prizes);
    } else {
      // ถ้าโหลดไม่ได้ ให้ใช้ localStorage
      loadPrizesFromLocalStorage();
    }
  } else {
    // ใช้ localStorage เป็นหลัก
    useGoogleSheets = false;
    console.log('Using LocalStorage (Google Sheets not configured)');
    loadPrizesFromLocalStorage();
  }
  
  updateWheel();
  updatePrizesList();
  randomColor();
});

// Page navigation
function showPage(pageName) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.getElementById(pageName + "-page").classList.add("active");
  
  if (event && event.target) {
    event.target.classList.add("active");
  }
}

// Prize management functions
async function addPrize() {
  const nameInput = document.getElementById("prize-name");
  const colorInput = document.getElementById("prize-color");
  const quantityInput = document.getElementById("prize-quantity");

  const name = nameInput.value.trim();
  let color = colorInput.value;
  const quantity = parseInt(quantityInput.value) || 1;

  if (name === "") {
    alert(
      currentLanguage === "th"
        ? "กรุณาใส่ชื่อรางวัล!"
        : "Please enter a prize name!"
    );
    nameInput.focus();
    return;
  }

  if (color === "") {
    color = generateRandomColor();
    colorInput.value = color;
  }

  if (quantity < 1 || quantity > 999) {
    alert(
      currentLanguage === "th"
        ? "จำนวนรางวัลต้องอยู่ระหว่าง 1-999!"
        : "Quantity must be between 1-999!"
    );
    quantityInput.focus();
    return;
  }

  if (prizes.length >= 12) {
    alert(
      currentLanguage === "th"
        ? "สามารถเพิ่มรางวัลได้สูงสุด 12 รายการ!"
        : "You can add a maximum of 12 prizes!"
    );
    return;
  }

  if (prizes.some((prize) => prize.name.toLowerCase() === name.toLowerCase())) {
    alert(
      currentLanguage === "th"
        ? "มีรางวัลชื่อนี้อยู่แล้ว!"
        : "A prize with this name already exists!"
    );
    return;
  }

  const newPrize = {
    id: Date.now(),
    name: name,
    color: color,
    quantity: quantity,
    originalQuantity: quantity,
  };

  prizes.push(newPrize);
  
  // บันทึกลง Google Sheets ถ้าเปิดใช้งาน
  if (useGoogleSheets) {
    await GoogleSheetsAPI.createPrize(newPrize);
  }
  
  savePrizes();
  updateWheel();
  updatePrizesList();

  nameInput.value = "";
  colorInput.value = "";
  quantityInput.value = "1";

  setTimeout(() => {
    randomColor();
  }, 100);

  const successMsg =
    currentLanguage === "th"
      ? `เพิ่มรางวัล "${name}" จำนวน ${quantity} รายการเรียบร้อยแล้ว!`
      : `Added prize "${name}" with quantity ${quantity}!`;
  showNotification(successMsg, "success");
}

async function deletePrize(prizeId) {
  const confirmMsg =
    currentLanguage === "th"
      ? "คุณแน่ใจหรือไม่ที่จะลบรางวัลนี้?"
      : "Are you sure you want to delete this prize?";
      
  if (confirm(confirmMsg)) {
    const prizeIndex = prizes.findIndex((prize) => prize.id === prizeId);
    if (prizeIndex > -1) {
      const deletedPrize = prizes.splice(prizeIndex, 1)[0];
      
      // ลบจาก Google Sheets ถ้าเปิดใช้งาน
      if (useGoogleSheets) {
        await GoogleSheetsAPI.deletePrize(prizeId);
      }
      
      savePrizes();
      updateWheel();
      updatePrizesList();
      
      const deleteMsg =
        currentLanguage === "th"
          ? `ลบรางวัล "${deletedPrize.name}" เรียบร้อยแล้ว!`
          : `Deleted prize "${deletedPrize.name}"!`;
      showNotification(deleteMsg, "error");
    }
  }
}

function updatePrizesList() {
  const container = document.getElementById("prizes-container");

  if (prizes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>${t("noPrives")}</h3>
        <p>${t("addPrizeToStart")}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = prizes
    .map(
      (prize) => `
      <div class="prize-item ${prize.quantity === 0 ? "out-of-stock" : ""}">
        <div class="prize-info">
          <div style="display: flex; align-items: center;">
            <div class="prize-color" style="background-color: ${prize.color}"></div>
            <div>
              <div class="prize-name">${prize.name}</div>
              <div class="prize-quantity ${prize.quantity === 0 ? "out-of-stock" : ""}">
                ${t("remaining")} ${prize.quantity} ${t("outOf")} ${prize.originalQuantity}
                ${prize.quantity === 0 ? t("outOfStock") : ""}
              </div>
            </div>
          </div>
        </div>
        <div class="prize-actions">
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="changeQuantity(${prize.id}, -1)" ${
        prize.quantity === 0 ? "disabled" : ""
      }>−</button>
            <div class="quantity-display">${prize.quantity}</div>
            <button class="quantity-btn" onclick="changeQuantity(${prize.id}, 1)" ${
        prize.quantity >= 999 ? "disabled" : ""
      }>+</button>
          </div>
          <button class="delete-btn" onclick="deletePrize(${prize.id})">${t("deleteButton")}</button>
        </div>
      </div>
    `
    )
    .join("");
}

async function changeQuantity(prizeId, change) {
  const prize = prizes.find((p) => p.id === prizeId);
  if (prize) {
    const newQuantity = prize.quantity + change;
    if (newQuantity >= 0 && newQuantity <= 999) {
      prize.quantity = newQuantity;
      
      // อัพเดทใน Google Sheets ถ้าเปิดใช้งาน
      if (useGoogleSheets) {
        await GoogleSheetsAPI.updatePrize(prizeId, { quantity: newQuantity });
      }
      
      savePrizes();
      updateWheel();
      updatePrizesList();

      const action =
        change > 0
          ? currentLanguage === "th" ? "เพิ่ม" : "Increased"
          : currentLanguage === "th" ? "ลด" : "Decreased";
      const msg =
        currentLanguage === "th"
          ? `${action}จำนวนรางวัล "${prize.name}" เรียบร้อยแล้ว (คงเหลือ: ${prize.quantity})`
          : `${action} quantity of "${prize.name}" (Remaining: ${prize.quantity})`;
      showNotification(msg, "success");
    }
  }
}

// Wheel functions
function updateWheel() {
  const wheel = document.getElementById("wheel");
  const noticeDiv = document.getElementById("wheel-notice");
  wheel.innerHTML = "";
  noticeDiv.innerHTML = "";

  wheel.style.transform = `rotate(${currentRotation}deg)`;

  const availablePrizes = prizes.filter((prize) => prize.quantity > 0);

  if (prizes.length === 0) {
    wheel.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 18px;">${t("noPrizesWheel")}</div>`;
    return;
  }

  if (availablePrizes.length === 0) {
    wheel.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ff6b6b; font-size: 18px;">${t("allPrizesGone")}</div>`;
    noticeDiv.innerHTML = `<div class="no-prizes-notice">${t("allPrizesGoneWarning")}</div>`;
    return;
  }

  if (availablePrizes.length === 1) {
    noticeDiv.innerHTML = `<div class="auto-select-notice">${t("onePrizeLeft")}</div>`;
  }

  const svgHTML = createWheelSVG(availablePrizes);
  wheel.innerHTML = svgHTML;
}

function createWheelSVG(availablePrizes) {
  const centerX = 200;
  const centerY = 200;
  const radius = 180;

  let svgContent = `<svg width="100%" height="100%" viewBox="0 0 400 400" style="border-radius: 50%;">`;

  if (availablePrizes.length === 1) {
    const prize = availablePrizes[0];
    svgContent += `
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" 
        fill="${prize.color}" stroke="#fff" stroke-width="2"/>
      <text x="${centerX}" y="${centerY}" 
        fill="white" 
        font-family="Arial, sans-serif" 
        font-size="18" 
        font-weight="bold" 
        text-anchor="middle" 
        dominant-baseline="middle"
        style="text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">
        ${prize.name} (${prize.quantity})
      </text>
    `;
  } else {
    const segmentAngle = 360 / availablePrizes.length;

    availablePrizes.forEach((prize, index) => {
      const startAngle = index * segmentAngle * (Math.PI / 180);
      const endAngle = (index + 1) * segmentAngle * (Math.PI / 180);

      const x1 = centerX + radius * Math.sin(startAngle);
      const y1 = centerY - radius * Math.cos(startAngle);
      const x2 = centerX + radius * Math.sin(endAngle);
      const y2 = centerY - radius * Math.cos(endAngle);

      const largeArcFlag = segmentAngle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      const textAngle = (index * segmentAngle + segmentAngle / 2) * (Math.PI / 180);
      const textRadius = radius * 0.7;
      const textX = centerX + textRadius * Math.sin(textAngle);
      const textY = centerY - textRadius * Math.cos(textAngle);
      const textRotation = index * segmentAngle + segmentAngle / 2;

      svgContent += `
        <path d="${pathData}" fill="${prize.color}" stroke="#fff" stroke-width="2"/>
        <text x="${textX}" y="${textY}" 
          fill="white" 
          font-family="Arial, sans-serif" 
          font-size="14" 
          font-weight="bold" 
          text-anchor="middle" 
          dominant-baseline="middle"
          transform="rotate(${textRotation}, ${textX}, ${textY})"
          style="text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">
          ${prize.name} (${prize.quantity})
        </text>
      `;
    });
  }

  svgContent += "</svg>";
  return svgContent;
}

async function spinWheel() {
  const availablePrizes = prizes.filter((prize) => prize.quantity > 0);

  if (prizes.length === 0) {
    const msg =
      currentLanguage === "th"
        ? "กรุณาเพิ่มรางวัลก่อนหมุนวงล้อ!"
        : "Please add prizes before spinning!";
    alert(msg);
    return;
  }

  if (availablePrizes.length === 0) {
    const msg =
      currentLanguage === "th"
        ? "รางวัลหมดแล้ว! กรุณาเพิ่มจำนวนรางวัลก่อนหมุน"
        : "All prizes are gone! Please add more quantities!";
    alert(msg);
    return;
  }

  if (isSpinning) return;

  isSpinning = true;
  const spinBtn = document.getElementById("spin-btn");
  const wheel = document.getElementById("wheel");

  spinBtn.disabled = true;

  let winner;

  if (availablePrizes.length === 1) {
    winner = availablePrizes[0];
    spinBtn.textContent = t("spinButtonSelecting");

    setTimeout(() => {
      showWinnerResult(winner);
    }, 1500);
  } else {
    spinBtn.textContent = t("spinButtonSpinning");

    const minRotation = 1800;
    const randomRotation = Math.random() * 360;
    const newRotation = minRotation + randomRotation;
    const totalRotation = currentRotation + newRotation;

    wheel.style.transform = `rotate(${totalRotation}deg)`;

    setTimeout(() => {
      currentRotation = totalRotation % 360;

      const segmentAngle = 360 / availablePrizes.length;
      const pointerAngle = (360 - currentRotation) % 360;
      const winnerIndex = Math.floor(pointerAngle / segmentAngle) % availablePrizes.length;
      winner = availablePrizes[winnerIndex];

      showWinnerResult(winner);
    }, 4000);
  }
}

async function showWinnerResult(winner) {
  const spinBtn = document.getElementById("spin-btn");

  winner.quantity--;
  
  // อัพเดทใน Google Sheets และบันทึกประวัติการหมุน
  if (useGoogleSheets) {
    await GoogleSheetsAPI.updatePrize(winner.id, { quantity: winner.quantity });
    await GoogleSheetsAPI.logWinner(winner);
  }
  
  savePrizes();
  updateWheel();
  updatePrizesList();

  lastWinner = winner;
  showPrizeModal(winner);

  isSpinning = false;

  const availablePrizes = prizes.filter((prize) => prize.quantity > 0);
  if (availablePrizes.length === 0) {
    spinBtn.disabled = true;
    spinBtn.textContent = t("spinButtonNoMore");
  } else if (availablePrizes.length === 1) {
    spinBtn.disabled = false;
    spinBtn.textContent = t("spinButtonFinal");
  } else {
    spinBtn.disabled = false;
    spinBtn.textContent = t("spinButton");
  }

  createConfetti();

  setTimeout(() => {
    createSparkleExplosion();
  }, 600);
}

// Modal functions
function showPrizeModal(winner) {
  const modal = document.getElementById("prize-modal");
  const modalIcon = document.getElementById("modal-prize-icon");
  const modalText = document.getElementById("modal-prize-text");
  const modalSubtext = document.getElementById("modal-prize-subtext");

  modalIcon.style.backgroundColor = winner.color;
  modalText.textContent = winner.name;
  modalSubtext.textContent = 
    currentLanguage === "th"
      ? `คงเหลือ: ${winner.quantity} รางวัล`
      : `Remaining: ${winner.quantity} prizes`;

  modal.classList.add("show");

  setTimeout(() => {
    if (modal.classList.contains("show")) {
      closeModal();
    }
  }, 5000);
}

function closeModal() {
  const modal = document.getElementById("prize-modal");
  modal.classList.remove("show");
}

// Storage functions
function savePrizes() {
  localStorage.setItem("zenithwheel-prizes", JSON.stringify(prizes));
  
  // Sync กับ Google Sheets ถ้าเปิดใช้งาน
  if (useGoogleSheets) {
    GoogleSheetsAPI.syncAllPrizes(prizes).catch(err => {
      console.error('Failed to sync with Google Sheets:', err);
    });
  }
}

function loadPrizesFromLocalStorage() {
  const saved = localStorage.getItem("zenithwheel-prizes");
  if (saved) {
    prizes = JSON.parse(saved);
    prizes = prizes.map((prize) => ({
      ...prize,
      quantity: prize.quantity !== undefined ? prize.quantity : 3,
      originalQuantity: prize.originalQuantity !== undefined ? prize.originalQuantity : 3,
    }));
    savePrizes();
  } else {
    prizes = [
      { id: 1, name: "รางวัลที่ 1", color: "#ff6b6b", quantity: 3, originalQuantity: 3 },
      { id: 2, name: "รางวัลที่ 2", color: "#4ecdc4", quantity: 3, originalQuantity: 3 },
      { id: 3, name: "รางวัลที่ 3", color: "#45b7d1", quantity: 2, originalQuantity: 2 },
      { id: 4, name: "รางวัลที่ 4", color: "#96ceb4", quantity: 2, originalQuantity: 2 },
      { id: 5, name: "รางวัลที่ 5", color: "#ffeaa7", quantity: 1, originalQuantity: 1 },
      { id: 6, name: "รางวัลที่ 6", color: "#dda0dd", quantity: 1, originalQuantity: 1 },
    ];
    savePrizes();
  }
}

// Notification system
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${
      type === "success"
        ? "linear-gradient(45deg, #2ed573, #1e90ff)"
        : "linear-gradient(45deg, #ff6b6b, #ee5a24)"
    };
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 1000;
    font-weight: bold;
    max-width: 300px;
    word-wrap: break-word;
    animation: slideInRight 0.5s ease;
  `;

  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.5s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}

// Confetti animation
function createConfetti() {
  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dda0dd"];

  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        top: -10px;
        z-index: 1000;
        border-radius: 50%;
        pointer-events: none;
        animation: confettiFall 3s linear forwards;
      `;

      document.body.appendChild(confetti);

      setTimeout(() => {
        if (document.body.contains(confetti)) {
          document.body.removeChild(confetti);
        }
      }, 3000);
    }, i * 50);
  }
}

// Sparkle explosion animation
function createSparkleExplosion() {
  const sparkleEmojis = ["✨", "⭐", "🌟", "💫", "🎊", "🎁", "🏆"];
  const resultContainer = document.querySelector(".result-container");

  if (!resultContainer) return;

  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const sparkle = document.createElement("div");
      const emoji = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];

      sparkle.style.cssText = `
        position: absolute;
        font-size: 32px;
        left: 50%;
        top: 50%;
        z-index: 2000;
        pointer-events: none;
        animation: sparkleExplode 2.5s ease-out forwards;
        transform: translate(-50%, -50%);
        filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.8));
      `;
      sparkle.textContent = emoji;

      const angle = (Math.PI * 2 * i) / 20;
      const distance = 100 + Math.random() * 60;
      sparkle.style.setProperty("--end-x", Math.cos(angle) * distance + "px");
      sparkle.style.setProperty("--end-y", Math.sin(angle) * distance + "px");

      resultContainer.appendChild(sparkle);

      setTimeout(() => {
        if (resultContainer.contains(sparkle)) {
          resultContainer.removeChild(sparkle);
        }
      }, 2500);
    }, i * 80);
  }
}

// Color generation functions
function generateRandomColor() {
  const colors = [
    "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dda0dd",
    "#ff7675", "#74b9ff", "#a29bfe", "#6c5ce7", "#fd79a8", "#fdcb6e",
    "#e17055", "#81ecec", "#55a3ff", "#00b894", "#e84393", "#f39c12",
    "#8e44ad", "#3498db", "#e74c3c", "#2ecc71", "#f1c40f", "#9b59b6",
    "#1abc9c", "#34495e", "#16a085", "#27ae60", "#2980b9", "#8e44ad",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function randomColor() {
  const colorInput = document.getElementById("prize-color");
  if (colorInput) {
    const newColor = generateRandomColor();
    colorInput.value = newColor;
  }
}

// Handle Enter key press in prize name input
document.addEventListener("DOMContentLoaded", function() {
  const prizeNameInput = document.getElementById("prize-name");
  if (prizeNameInput) {
    prizeNameInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        addPrize();
      }
    });
  }
});
