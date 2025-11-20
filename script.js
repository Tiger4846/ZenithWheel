// Global variables
let prizes = [];
let isSpinning = false;
let currentRotation = 0;
let lastWinner = null;
let colorIndex = 0;



// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // โหลดข้อมูลจาก LocalStorage
  console.log('Using LocalStorage');
  loadPrizesFromLocalStorage();
  
  updateWheel();
  updatePrizesList();
  sequentialColor(colorIndex);
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
/* Updated addPrize function to allow manual color selection or fallback to sequential color */
async function addPrize() {
  const nameInput = document.getElementById("prize-name");
  const colorInput = document.getElementById("prize-color");
  const quantityInput = document.getElementById("prize-quantity");

  const name = nameInput.value.trim();
  let color = colorInput.value;
  const quantity = parseInt(quantityInput.value) || 1;

  if (name === "") {
    alert("กรุณาใส่ชื่อรางวัล!");
    nameInput.focus();
    return;
  }

  if (color === "" || color === "#000000") {
    color = generateSequentialColor(colorIndex);
    colorInput.value = color;
  }

  if (quantity < 1 || quantity > 999) {
    alert("จำนวนรางวัลต้องอยู่ระหว่าง 1-999!");
    quantityInput.focus();
    return;
  }

  if (prizes.length >= 12) {
    alert("สามารถเพิ่มรางวัลได้สูงสุด 12 รายการ!");
    return;
  }

  if (prizes.some((prize) => prize.name.toLowerCase() === name.toLowerCase())) {
    alert("มีรางวัลชื่อนี้อยู่แล้ว!");
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
  
  savePrizes();
  updateWheel();
  updatePrizesList();

  nameInput.value = "";
  colorInput.value = "";
  quantityInput.value = "1";
  colorIndex++; // Increment color index for the next prize
  setTimeout(() => {
    sequentialColor(colorIndex);
  }, 100);

  colorIndex++; // Increment color index for the next prize

  setTimeout(() => {
    sequentialColor(colorIndex);
  }, 100);

  showNotification(`เพิ่มรางวัล "${name}" จำนวน ${quantity} รายการเรียบร้อยแล้ว!`, "success");
}

async function deletePrize(prizeId) {
  if (confirm("คุณแน่ใจหรือไม่ที่จะลบรางวัลนี้?")) {
    const prizeIndex = prizes.findIndex((prize) => prize.id === prizeId);
    if (prizeIndex > -1) {
      const deletedPrize = prizes.splice(prizeIndex, 1)[0];
      
      savePrizes();
      updateWheel();
      updatePrizesList();
      
      showNotification(`ลบรางวัล "${deletedPrize.name}" เรียบร้อยแล้ว!`, "error");
    }
  }
}

function updatePrizesList() {
  const container = document.getElementById("prizes-container");

  if (prizes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>ยังไม่มีรางวัล</h3>
        <p>เพิ่มรางวัลใหม่เพื่อเริ่มใช้งานวงล้อ</p>
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
                คงเหลือ: ${prize.quantity} จาก ${prize.originalQuantity}
                ${prize.quantity === 0 ? "(หมด)" : ""}
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
          <button class="delete-btn" onclick="deletePrize(${prize.id})">🗑️ ลบ</button>
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
      
      savePrizes();
      updateWheel();
      updatePrizesList();

      const action = change > 0 ? "เพิ่ม" : "ลด";
      const msg = `${action}จำนวนรางวัล "${prize.name}" เรียบร้อยแล้ว (คงเหลือ: ${prize.quantity})`;
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
    wheel.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 24px;">ไม่มีรางวัล</div>`;
    return;
  }

  if (availablePrizes.length === 0) {
    wheel.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ff6b6b; font-size: 24px;">รางวัลหมดแล้ว</div>`;
    noticeDiv.innerHTML = `<div class="no-prizes-notice">⚠️ รางวัลทั้งหมดหมดแล้ว! กรุณาเพิ่มจำนวนรางวัล</div>`;
    return;
  }

  if (availablePrizes.length === 1) {
    noticeDiv.innerHTML = `<div class="auto-select-notice">🎯 เหลือรางวัลเดียว! การหมุนจะได้รางวัลนี้อัตโนมัติ</div>`;
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
        font-family="'Kanit', sans-serif" 
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
          font-family="'Kanit', sans-serif" 
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
    alert("กรุณาเพิ่มรางวัลก่อนหมุนวงล้อ!");
    return;
  }

  if (availablePrizes.length === 0) {
    alert("รางวัลหมดแล้ว! กรุณาเพิ่มจำนวนรางวัลก่อนหมุน");
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
    spinBtn.textContent = "🎯 เลือกรางวัลเดียวที่เหลือ...";

    setTimeout(() => {
      showWinnerResult(winner);
    }, 1500);
  } else {
    spinBtn.textContent = "🎡 กำลังหมุน...";

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
  
  savePrizes();
  updateWheel();
  updatePrizesList();

  lastWinner = winner;
  showPrizeModal(winner);

  isSpinning = false;

  const availablePrizes = prizes.filter((prize) => prize.quantity > 0);
  if (availablePrizes.length === 0) {
    spinBtn.disabled = true;
    spinBtn.textContent = "❌ รางวัลหมดแล้ว";
  } else if (availablePrizes.length === 1) {
    spinBtn.disabled = false;
    spinBtn.textContent = "🎯 เลือกรางวัลสุดท้าย";
  } else {
    spinBtn.disabled = false;
    spinBtn.textContent = "🎯 หมุนวงล้อ";
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
  modalSubtext.textContent = `คงเหลือ: ${winner.quantity} รางวัล`;

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
/* Updated the color generation logic to use sequential selection */
function generateSequentialColor(index) {
  const colors = [
    "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", 
    "#74b9ff", "#a29bfe", "#fd79a8", "#fdcb6e",
    "#e17055", "#81ecec", "#55a3ff", "#00b894", "#f39c12",
    "#3498db", "#e74c3c", "#2ecc71", "#f1c40f", "#9b59b6",
    "#1abc9c", "#16a085", "#27ae60", "#2980b9", "#dda0dd",
  ];
  return colors[index % colors.length];
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
