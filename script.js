// ==========================================
// 1. 畫作資料庫 (JSON Array)
// ==========================================
const artworksData = [
  {
    id: 1,
    titleCN: "大衛像",
    titleEN: "David",
    artist: "米開朗基羅",
    year: "1501 年 – 1504 年",
    location: "義大利佛羅倫斯 學院美術館",
    description: "高度為 5.17 公尺，大理石雕刻的巔峰之作，展現了少年大衛迎戰巨人歌利亞前的專注與力量美感。",
    imageSrc: "images/masterpiece/David.png"
  },
  {
    id: 2,
    titleCN: "蒙娜麗莎",
    titleEN: "La Gioconda (Moona Lisa)",
    artist: "李奧納多·達文西",
    year: "1503 年 – 1506 年",
    location: "法國巴黎 羅浮宮",
    description: "以其神秘的微笑與高超的暈塗法（Sfumato）聞名於世，是文藝復興時期最具代表性的畫作。",
    imageSrc: "images/masterpiece/La Gioconda(Moona Lisa).png"
  },
  {
    id: 3,
    titleCN: "沉思者",
    titleEN: "Le Penseur (The Thinker)",
    artist: "奧古斯特·羅丹",
    year: "1904 年",
    location: "法國巴黎 羅丹美術館",
    description: "原本為《地獄之門》的一部分，該雕像表達了但丁對地獄中的種種罪惡以及目前眼下的人間悲劇進行思考。",
    imageSrc: "images/masterpiece/Le Penseur(The Thinker).png"
  },
  {
    id: 4,
    titleCN: "星夜",
    titleEN: "The Starry Night",
    artist: "文森·威廉·梵谷",
    year: "1889 年",
    location: "美國紐約 現代藝術博物館 (MoMA)",
    description: "梵谷於聖雷米療養院期間創作的作品，透過漩渦狀的筆觸與強烈的對比色調，展現豐富的情感層次。",
    imageSrc: "images/masterpiece/The Starry Night.jpg"
  }
];

// ==========================================
// 2. DOM 元素抓取
// ==========================================
const character = document.getElementById("character");
const charImg = document.getElementById("char-img");
const interactPrompt = document.getElementById("interact-prompt");
const guideText = document.getElementById("guide-text");

const artFrames = document.querySelectorAll(".art-frame");
const modal = document.getElementById("art-modal");
const closeBtn = document.getElementById("close-btn");

// Modal 欄位
const modalImg = document.getElementById("modal-img");
const modalTitleCN = document.getElementById("modal-title-cn");
const modalTitleEN = document.getElementById("modal-title-en");
const modalArtist = document.getElementById("modal-artist");
const modalYear = document.getElementById("modal-year");
const modalLocation = document.getElementById("modal-location");
const modalDesc = document.getElementById("modal-desc");

// ==========================================
// 3. 狀態變數與素材路徑
// ==========================================
let charPos = 50;           // 人物 X 軸初始位置
const moveSpeed = 4;       // 每次移動像素
let facingDirection = "right"; // 紀錄最後面向 ('right' 或 'left')
let isWalking = false;      // 狀態鎖：防止長按鍵盤時一直重複設定圖片 src
let activeArtId = null;     // 當前作品 ID
let idleTimer = null;       // 計時器

// 素材路徑
const imgStandRight = "images/charactor/stand.gif";
const imgWalkRight  = "images/charactor/walking_right.gif";
const imgWalkLeft   = "images/charactor/walking_left.gif";

// ==========================================
// 4. 移動與按鍵控制邏輯 (KeyDown)
// ==========================================
window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  //隱藏提示文字
  if (["a", "d", "arrowleft", "arrowright"].includes(key)) {
    if (guideText) guideText.classList.add("hidden");
    startIdleTimer();
  }
  // Modal 開啟時，只允許關閉操作
  if (modal && !modal.classList.contains("hidden")) {
    if (key === "w" || e.key === "Escape") {
      closeModal();
    }
    return;
  }
  //計算區域寬度，設定右邊界限制
  const gallerySection = document.querySelector(".gallery-section");
  const galleryWidth = gallerySection ? gallerySection.offsetWidth : window.innerWidth;
  const maxLeft = galleryWidth - 70;

  // 移動控制
  if (key === "a" || key === "d" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
    resetIdleTimer();
    if (guideText) guideText.classList.add("hidden");

    //往左走
    if (key === "a" || e.key === "ArrowLeft") {
      charPos = Math.max(10, charPos - moveSpeed);//左邊界
      facingDirection = "left";
      
      //只有在尚未處於走路狀態時，才切換圖片 src
      if (!isWalking) {
        charImg.src = imgWalkLeft;
        character.classList.remove("face-left");//移除翻轉
        isWalking = true;
      }
    } 
    // 往右走
    else if (key === "d" || e.key === "ArrowRight") {
      charPos = Math.min(maxLeft, charPos + moveSpeed);
      facingDirection = "right";
      
      
      if (!isWalking) {
        charImg.src = imgWalkRight;
        character.classList.remove("face-left");
        isWalking = true;
      }
    }
  } 
  //W鍵：轉為背面，開啟Modal(若有在感應範圍內)
  else if (key === "w") {
    resetIdleTimer();
    
    //切換為背面圖片
    charImg.src = typeof imgBack !== "undefined" ? imgBack : "images/charactor/back.gif";
    character.classList.remove("face-left");
    isWalking = false; // 停止走路動畫狀態

    //觸發打開畫作 Modal
    if (activeArtId !== null) {
      openModal(activeArtId);
    }
  }

  // 更新座標與感應畫框
  character.style.left = charPos + "px";
  checkArtOverlap();
});

// ==========================================
// 5. 放開按鍵邏輯 (KeyUp - 停下處理)
// ==========================================
window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  
  if (key === "a" || key === "d" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
    // 重置走路狀態鎖
    isWalking = false;
    
    // 換回站立圖
    charImg.src = imgStandRight;

    // 若最後面向左邊，加上翻轉 class
    if (facingDirection === "left") {
      character.classList.add("face-left");
    } else {
      character.classList.remove("face-left");
    }

    //靜止計時器
    startIdleTimer();
  }
});

// ==========================================
// 6. 碰撞感應、計時器與 Modal 開關
// ==========================================
function checkArtOverlap() {
  const charRect = character.getBoundingClientRect();
  const charCenter = charRect.left + charRect.width / 2;
  let found = false;

  artFrames.forEach((frame) => {
    const frameRect = frame.getBoundingClientRect();
    if (charCenter >= frameRect.left && charCenter <= frameRect.right) {
      activeArtId = parseInt(frame.getAttribute("data-id"));
      found = true;
    }
  });

  if (found) {
    interactPrompt.style.display = "block";
  } else {
    activeArtId = null;
    interactPrompt.style.display = "none";
  }
}

function startIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (guideText) guideText.classList.remove("hidden");
  }, 10000);
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
}

function openModal(id) {
  const data = artworksData.find((art) => art.id === id);
  if (!data) return;

  modalTitleCN.textContent = data.titleCN;
  modalTitleEN.textContent = data.titleEN;
  modalArtist.textContent = data.artist;
  modalYear.textContent = data.year;
  modalLocation.textContent = data.location;
  modalDesc.textContent = data.description;
  modalImg.src = data.imageSrc;

  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

closeBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', () => {
  startIdleTimer();
  if (typeof updateCartBadge === "function") updateCartBadge();
});