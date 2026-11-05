// ==========================================
// 1. 全域商品資料 (含圖片路徑、動態單位與庫存)
// ==========================================
const shopProducts = [
  {
    id: 1,
    tag: "特價",
    titleCN: "沉思之水",
    titleEN: "The Water of Thinker",
    price: 676767,
    description: "只要滴兩滴在身上並模仿沉思者的動作，所有難題都能想出解答。（據說瓶身的手是使用與沉思者的原始雕像同一批開採的青銅所製作。）",
    sideEffect: "腰痠背痛、解離狀態",
    stock: 10,
    unit: "瓶",
    imageSrc: "images/shop item/The Thinker Water.png"
  },
  {
    id: 2,
    tag: "最熱銷",
    titleCN: "梵谷名畫三件套",
    titleEN: "The Series of Van Gogh Postcards",
    price: 330,
    description: "在其他地方買不到，絕無僅有的梵谷名畫明信片！<br>內容物有(從上到下)：<br>露出右耳的梵谷自畫像明信片*1<br>蜜蜂造訪的向日葵*1<br>全都是星星的星夜*1<br><strong>全都是獨家名畫設計！要買要快！</strong>",
    sideEffect: "無",
    stock: 50,
    unit: "套",
    imageSrc: "images/shop item/Van Gogh Postcards.png"
  },
  {
    id: 3,
    tag: "",
    titleCN: "博物館吉祥物鑰匙圈",
    titleEN: "The Museum Keychain",
    price: 518,
    description: "<span class=\"strikethrough-desc\">(似乎是館方人員匆匆製作沒有設定好畫布尺寸，導致吉祥物模糊得像晚上會抓人的怪物。)</span><br>此商品沒有相關敘述",
    sideEffect: "無",
    stock: 20,
    unit: "個",
    imageSrc: "images/shop item/Museum keychain.png"
  }
];

let currentProduct = null;

// ==========================================
// 2. 導覽列購物車小紅點 Badge 更新
// ==========================================
function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;

  const cart = JSON.parse(localStorage.getItem("userCart")) || [];
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQty > 0) {
    badge.textContent = totalQty;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

// ==========================================
// 3. shop.html 渲染與 Modal 操作
// ==========================================

// 動態渲染商品卡片列表 
function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  let html = shopProducts.map(p => `
    <div class="product-card" onclick="openProductModal(${p.id})">
      ${p.tag ? `<span class="card-tag">${p.tag}</span>` : ''}
      <div class="card-img-placeholder">
        <img src="${p.imageSrc}" alt="${p.titleCN}">
      </div>
      <h3>
        ${p.titleCN}<br>
        <span class="en-title">${p.titleEN}</span>
      </h3>
      <p class="price">$ ${p.price.toLocaleString()}</p>
    </div>
  `).join('');

  // 補上灰色預告卡片
  html += `
    <div class="product-card disabled">
      <div class="card-img-placeholder">? ? ?</div>
      <h3>? ? ?</h3>
      <p class="desc">商品研發中！歡迎持續關注</p>
    </div>
  `;

  grid.innerHTML = html;
}

// 開啟商品 Modal
function openProductModal(productId) {
  const shopModal = document.getElementById("shopModal");
  const modalImg = document.getElementById("modalImg");
  const modalTitleCN = document.getElementById("modalTitleCN");
  const modalTitleEN = document.getElementById("modalTitleEN");
  const modalDesc = document.getElementById("modalDesc");
  const modalSideEffect = document.getElementById("modalSideEffect");
  const modalStock = document.getElementById("modalStock");
  const itemQuantity = document.getElementById("itemQuantity");

  if (!shopModal) return;

  currentProduct = shopProducts.find(p => p.id === productId);
  if (!currentProduct) return;

  if (modalTitleCN) modalTitleCN.textContent = currentProduct.titleCN;
  if (modalTitleEN) modalTitleEN.textContent = currentProduct.titleEN;
  if (modalDesc) modalDesc.innerHTML = currentProduct.description;
  if (modalSideEffect) modalSideEffect.textContent = `副作用：${currentProduct.sideEffect}`;
  if (modalStock) modalStock.textContent = `現庫存只剩下 ${currentProduct.stock} ${currentProduct.unit}`;
  if (modalImg) modalImg.src = currentProduct.imageSrc;
  if (itemQuantity) itemQuantity.value = 1;

  shopModal.classList.remove("hidden");
}

// 初始化 shop.html 事件綁定
function initShopEvents() {
  const shopModal = document.getElementById("shopModal");
  const closeShopModal = document.getElementById("closeShopModal");
  const itemQuantity = document.getElementById("itemQuantity");
  const btnMinus = document.getElementById("btnMinus");
  const btnPlus = document.getElementById("btnPlus");
  const addToCartBtn = document.getElementById("addToCartBtn");

  // 關閉 Modal
  if (closeShopModal && shopModal) {
    closeShopModal.addEventListener("click", () => shopModal.classList.add("hidden"));
  }
  if (shopModal) {
    shopModal.addEventListener("click", (e) => {
      if (e.target === shopModal) shopModal.classList.add("hidden");
    });
  }

  // 數量按鈕 -
  if (btnMinus && itemQuantity) {
    btnMinus.addEventListener("click", () => {
      let val = parseInt(itemQuantity.value) || 1;
      if (val > 1) itemQuantity.value = val - 1;
    });
  }

  // 數量按鈕 + (不超過單一庫存)
  if (btnPlus && itemQuantity) {
    btnPlus.addEventListener("click", () => {
      let val = parseInt(itemQuantity.value) || 1;
      if (currentProduct && val < currentProduct.stock) {
        itemQuantity.value = val + 1;
      }
    });
  }

  // 加入購物車邏輯 (寫入 localStorage + 防呆 + Badge 更新)
  if (addToCartBtn && itemQuantity && shopModal) {
    addToCartBtn.addEventListener("click", () => {
      if (!currentProduct) return;

      let cart = JSON.parse(localStorage.getItem("userCart")) || [];
      const buyQty = parseInt(itemQuantity.value) || 1;
      const unitText = currentProduct.unit || "個";

      const existingItem = cart.find(item => item.id === currentProduct.id);
      const currentInCartQty = existingItem ? existingItem.quantity : 0;

      // 庫存上限攔截
      if (currentInCartQty + buyQty > currentProduct.stock) {
        const remainingAllowed = currentProduct.stock - currentInCartQty;

        if (remainingAllowed <= 0) {
          alert(`【${currentProduct.titleCN}】已達庫存上限（最高 ${currentProduct.stock} ${unitText}），購物車內已有 ${currentInCartQty} ${unitText}，無法再加入！`);
        } else {
          alert(`【${currentProduct.titleCN}】庫存不足！您購物車已有 ${currentInCartQty} ${unitText}，最多只能再加入 ${remainingAllowed} ${unitText}。`);
        }
        return;
      }

      // 寫入/更新購物車
      if (existingItem) {
        existingItem.quantity += buyQty;
      } else {
        cart.push({
          id: currentProduct.id,
          titleCN: currentProduct.titleCN,
          titleEN: currentProduct.titleEN,
          price: currentProduct.price,
          imageSrc: currentProduct.imageSrc,
          unit: unitText,
          quantity: buyQty
        });
      }

      localStorage.setItem("userCart", JSON.stringify(cart));
      updateCartBadge(); // 即時刷新小紅點數量
      alert(`成功將 ${buyQty} ${unitText}【${currentProduct.titleCN}】加入購物車！`);
      shopModal.classList.add("hidden");

      // 若在 cart.html 頁面加購，自動重新渲染列表與結帳金額
      renderCart();
    });
  }
}

// ==========================================
// 4. cart.html 購物車卡片、熱門加購與結帳金額
// ==========================================

// 渲染「熱門加購」列表 (改為獨立直加模式)
function renderAddOnProducts() {
  const addOnGrid = document.getElementById("addOnGrid");
  if (!addOnGrid) return; // 若非 cart.html 頁面則跳過

  addOnGrid.innerHTML = shopProducts.map(p => `
    <div class="add-on-card" onclick="addAddOnToCart(${p.id})">
      <div class="add-on-card-img">
        <img src="${p.imageSrc}" alt="${p.titleCN}">
      </div>
      <h4>
        ${p.titleCN}
        <span class="en-title">${p.titleEN}</span>
      </h4>
      <p class="price">$ ${p.price.toLocaleString()}</p>
      <button type="button" class="btn-direct-add">+ 加購</button>
    </div>
  `).join('');
}

// 獨立熱門加購邏輯：點擊直接加 1 件並刷新畫面 (不跳 Modal)
function addAddOnToCart(productId) {
  const product = shopProducts.find(p => p.id === productId);
  if (!product) return;

  let cart = JSON.parse(localStorage.getItem("userCart")) || [];
  const existingItem = cart.find(item => item.id === productId);

  // 檢查庫存上限
  const currentQty = existingItem ? existingItem.quantity : 0;
  if (currentQty + 1 > product.stock) {
    alert(`【${product.titleCN}】已達庫存上限（最高 ${product.stock} ${product.unit || '個'}）！`);
    return;
  }

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      titleCN: product.titleCN,
      titleEN: product.titleEN,
      price: product.price,
      imageSrc: product.imageSrc,
      unit: product.unit || "個",
      quantity: 1
    });
  }

  // 寫回 LocalStorage 並刷新購物車與紅點
  localStorage.setItem("userCart", JSON.stringify(cart));
  renderCart();
  updateCartBadge();
}

// 渲染購物車主體與計算金額 (含運費 $70)
function renderCart() {
  const cartList = document.getElementById("cartList");
  const cartContent = document.getElementById("cartContent");
  const emptyCartMsg = document.getElementById("emptyCartMsg");
  const cartSummarySection = document.getElementById("cartSummarySection");
  const subtotalVal = document.getElementById("subtotalVal");
  const grandTotalVal = document.getElementById("grandTotalVal");

  if (!cartList) return;

  const cart = JSON.parse(localStorage.getItem("userCart")) || [];
  const shippingFee = 70; // 運費固定 $70

  if (cart.length === 0) {
    if (cartContent) cartContent.classList.add("hidden");
    if (emptyCartMsg) emptyCartMsg.classList.remove("hidden");
    if (cartSummarySection) cartSummarySection.classList.add("hidden");
    return;
  }

  if (cartContent) cartContent.classList.remove("hidden");
  if (emptyCartMsg) emptyCartMsg.classList.add("hidden");
  if (cartSummarySection) cartSummarySection.classList.remove("hidden");

  let subtotal = 0;

  cartList.innerHTML = cart.map(item => {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    return `
      <div class="cart-card">
        <div class="cart-card-img">
          <img src="${item.imageSrc}" alt="${item.titleCN}">
        </div>
        <div class="cart-card-info">
          <h3 class="cart-card-title">
            ${item.titleCN} <span class="en-title">${item.titleEN}</span>
          </h3>
          <div class="cart-qty-group">
            <button type="button" onclick="updateCartQuantity(${item.id}, -1)">-</button>
            <input type="text" value="${item.quantity}" readonly>
            <button type="button" onclick="updateCartQuantity(${item.id}, 1)">+</button>
          </div>
        </div>
        <div class="cart-card-price">$ ${itemSubtotal.toLocaleString()}</div>
      </div>
    `;
  }).join('');

  // 靜態計算：小計與總計 (小計 + 運費 70)
  const grandTotal = subtotal + shippingFee;

  if (subtotalVal) subtotalVal.textContent = `$${subtotal.toLocaleString()}`;
  if (grandTotalVal) grandTotalVal.textContent = `$${grandTotal.toLocaleString()}`;
}

// 購物車數量加減
function updateCartQuantity(productId, change) {
  let cart = JSON.parse(localStorage.getItem("userCart")) || [];
  const item = cart.find(i => i.id === productId);
  const productInfo = shopProducts.find(p => p.id === productId);

  if (!item) return;

  const newQty = item.quantity + change;

  if (newQty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  } 
  else {
    if (productInfo && newQty > productInfo.stock) {
      alert(`【${item.titleCN}】已達庫存上限（最高 ${productInfo.stock} ${productInfo.unit || '個'}）！`);
      return;
    }
    item.quantity = newQty;
  }

  localStorage.setItem("userCart", JSON.stringify(cart));
  renderCart();
  updateCartBadge();
}

// 初始化 cart.html 按鈕事件
function initCartEvents() {
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      alert("感謝您的購買！訂單已順利成立！");
      localStorage.removeItem("userCart");
      renderCart();
      updateCartBadge();
    });
  }
}

// ==========================================
// 5. 頁面載入完成後執行
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  try { renderProducts(); } catch (e) {}
  try { initShopEvents(); } catch (e) {}
  try { renderCart(); } catch (e) {}
  try { renderAddOnProducts(); } catch (e) {}
  try { initCartEvents(); } catch (e) {}
  try { updateCartBadge(); } catch (e) {}
});