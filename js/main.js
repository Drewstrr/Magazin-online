// =============================================
//  PEAR — Kendama Shop — main.js
// =============================================

// ---- Product Data ----
const products = [
  {
    id: 1,
    name: "Kendama Classic Roșu",
    desc: "Roșu aprins. Minte focalizată.\nPrimul trick schimbă totul.",
    price: 89,
    tag: "Bestseller",
    tagColor: "#ff6b35",
    gradient: "linear-gradient(135deg, #ff6b35 0%, #c0392b 100%)",
    accent: "#ff6b35",
  },
  {
    id: 2,
    name: "Kendama Pro Negru",
    desc: "Fără culoare. Fără zgomot.\nDoar precizie pură.",
    price: 149,
    tag: "Pro",
    tagColor: "#00d9ff",
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
    accent: "#00d9ff",
  },
  {
    id: 3,
    name: "Kendama Junior Albastru",
    desc: "Mâini mici. Vise mari.\nPrima kendama contează.",
    price: 59,
    tag: "Junior",
    tagColor: "#c8ff00",
    gradient: "linear-gradient(135deg, #1e90ff 0%, #00b4db 100%)",
    accent: "#c8ff00",
  },
  {
    id: 4,
    name: "Kendama Premium Multicolor",
    desc: "Nu există două la fel.\nLa fel ca tine.",
    price: 199,
    tag: "Limited",
    tagColor: "#ff3cac",
    gradient: "linear-gradient(135deg, #ff3cac 0%, #a259ff 50%, #ff6b35 100%)",
    accent: "#ff3cac",
  },
  {
    id: 5,
    name: "Kendama Starter Kit",
    desc: "Ziua 1: confuz.\nZiua 7: obsedat. Ziua 30: legendă.",
    price: 109,
    tag: "Kit",
    tagColor: "#a259ff",
    gradient: "linear-gradient(135deg, #a259ff 0%, #6c3fc5 100%)",
    accent: "#a259ff",
  },
];

// ---- Cart State (persisted in localStorage) ----
let cart = JSON.parse(localStorage.getItem("pearCart") || "[]");

// ---- DOM References ----
const productsList = document.getElementById("productsList");
const cartBtn      = document.getElementById("cartBtn");
const cartBadge    = document.getElementById("cartBadge");
const cartPanel    = document.getElementById("cartPanel");
const cartOverlay  = document.getElementById("cartOverlay");
const cartClose    = document.getElementById("cartClose");
const cartItems    = document.getElementById("cartItems");
const cartFooter   = document.getElementById("cartFooter");
const cartTotal    = document.getElementById("cartTotal");

// =============================================
//  RENDER PRODUCTS
// =============================================
const kendamaSVG = (accent) => `
  <svg viewBox="0 0 80 160" xmlns="http://www.w3.org/2000/svg" style="width:56px;height:auto;filter:drop-shadow(0 4px 16px rgba(0,0,0,0.3))">
    <!-- Ball -->
    <circle cx="40" cy="22" r="20" fill="rgba(255,255,255,0.95)" />
    <circle cx="33" cy="15" r="5" fill="rgba(255,255,255,0.4)" />
    <!-- String -->
    <line x1="40" y1="42" x2="40" y2="70" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Sakazuki (big cup) -->
    <path d="M14 70 Q10 90 40 92 Q70 90 66 70 Z" fill="rgba(255,255,255,0.9)"/>
    <!-- Ken body -->
    <rect x="32" y="92" width="16" height="34" rx="5" fill="rgba(255,255,255,0.85)"/>
    <!-- Kengata (small cup) -->
    <path d="M26 92 Q24 100 40 101 Q56 100 54 92 Z" fill="rgba(255,255,255,0.6)"/>
    <!-- Spike -->
    <polygon points="40,126 34,144 46,144" fill="rgba(255,255,255,0.8)"/>
    <!-- Spike tip -->
    <circle cx="40" cy="148" r="3.5" fill="${accent}" />
  </svg>
`;

function renderProducts() {
  productsList.innerHTML = products.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-card__visual" style="background:${p.gradient};">
        <div class="product-card__glow" style="background:${p.accent};"></div>
        ${kendamaSVG(p.accent)}
      </div>
      <div class="product-card__info">
        <span class="product-card__tag" style="background:${p.tagColor}22;color:${p.tagColor}">${p.tag}</span>
        <h3 class="product-card__name">${p.name}</h3>
        <p class="product-card__desc">${p.desc.replace(/\n/g, '<br>')}</p>
      </div>
      <div class="product-card__action">
        <span class="product-card__price">${p.price} RON</span>
        <button class="btn btn--add" onclick="addToCart(${p.id}, this)">
          + Adaugă în coș
        </button>
      </div>
    </div>
  `).join("");
}

// =============================================
//  CART LOGIC
// =============================================
function addToCart(id, btn) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(i => i.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  // Button feedback
  btn.textContent = "Adăugat!";
  btn.classList.add("added");
  setTimeout(() => {
    btn.textContent = "+ Adaugă în coș";
    btn.classList.remove("added");
  }, 1200);

  saveCart();
  updateBadge();
  renderCartItems();
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateBadge();
  renderCartItems();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart();
  updateBadge();
  renderCartItems();
}

function saveCart() {
  localStorage.setItem("pearCart", JSON.stringify(cart));
}

function updateBadge() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  cartBadge.textContent = total;
  cartBadge.classList.add("pop");
  setTimeout(() => cartBadge.classList.remove("pop"), 300);
}

function renderCartItems() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Coșul tău este gol.</p>';
    cartFooter.style.display = "none";
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item__img" style="background:${item.gradient};display:flex;align-items:center;justify-content:center;border-radius:8px;overflow:hidden;">
        <svg viewBox="0 0 80 160" xmlns="http://www.w3.org/2000/svg" style="width:28px;height:auto;">
          <circle cx="40" cy="22" r="20" fill="rgba(255,255,255,0.95)"/>
          <line x1="40" y1="42" x2="40" y2="70" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M14 70 Q10 90 40 92 Q70 90 66 70 Z" fill="rgba(255,255,255,0.9)"/>
          <rect x="32" y="92" width="16" height="34" rx="5" fill="rgba(255,255,255,0.85)"/>
          <polygon points="40,126 34,144 46,144" fill="rgba(255,255,255,0.8)"/>
          <circle cx="40" cy="148" r="3.5" fill="${item.accent}"/>
        </svg>
      </div>
      <div>
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__price">${item.price} RON / buc</p>
        <div class="cart-item__qty">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="cart-item__remove" onclick="removeFromCart(${item.id})" title="Șterge">&times;</button>
    </div>
  `).join("");

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  cartTotal.textContent = `${total} RON`;
  cartFooter.style.display = "block";
}

// =============================================
//  CART PANEL OPEN / CLOSE
// =============================================
function openCart() {
  cartPanel.classList.add("open");
  cartOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

cartBtn.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// Close on Escape key
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeCart(); closeMenu(); }
});

// =============================================
//  HAMBURGER MENU
// =============================================
const hamburger  = document.getElementById("hamburger");
const nav        = document.getElementById("nav");
const navOverlay = document.getElementById("navOverlay");

function openMenu() {
  hamburger.classList.add("open");
  nav.classList.add("open");
  navOverlay.classList.add("active");
  hamburger.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  hamburger.classList.remove("open");
  nav.classList.remove("open");
  navOverlay.classList.remove("active");
  hamburger.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

hamburger.addEventListener("click", () => {
  hamburger.classList.contains("open") ? closeMenu() : openMenu();
});

// =============================================
//  STICKY HEADER — active nav link on scroll
// =============================================
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav__link");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute("id");
    }
  });
  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// =============================================
//  INIT
// =============================================
renderProducts();
