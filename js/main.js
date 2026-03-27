// =============================================
//  PEAR — Kendama Shop — main.js
// =============================================

// ---- Product Data ----
const products = [
  {
    id: 1,
    name: "Kendama Classic Roșu",
    desc: "Kendama tradițională japoneză cu finisaj mat, perfectă pentru începători. Lemn de fag de calitate superioară, vopsea durabilă.",
    price: 89,
    tag: "Bestseller",
    tagColor: "#ff6b35",
    img: "https://images.unsplash.com/photo-1598030343246-eec71c26b5a6?w=300&q=80",
  },
  {
    id: 2,
    name: "Kendama Pro Negru",
    desc: "Pentru jucători avansați. Design ergonomic cu grip special, balanță optimă pentru trick-uri complexe și competiții.",
    price: 149,
    tag: "Pro",
    tagColor: "#00d9ff",
    img: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=300&q=80",
  },
  {
    id: 3,
    name: "Kendama Junior Albastru",
    desc: "Ideală pentru copii și adolescenți. Dimensiuni reduse, greutate mică, ușor de mânuit. Perfectă cadou pentru copii curioși.",
    price: 59,
    tag: "Junior",
    tagColor: "#c8ff00",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80",
  },
  {
    id: 4,
    name: "Kendama Premium Multicolor",
    desc: "Ediție limitată cu finisaj unic multicolor. Fiecare bucată este unică. Lemn de arțar importat, echilibrată manual.",
    price: 199,
    tag: "Limited",
    tagColor: "#ff3cac",
    img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&q=80",
  },
  {
    id: 5,
    name: "Kendama Starter Kit",
    desc: "Tot ce ai nevoie ca să începi: kendama + ghid de tricks pentru începători + șnur de rezervă. Ambalaj cadou inclus.",
    price: 109,
    tag: "Kit",
    tagColor: "#a259ff",
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80",
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
function renderProducts() {
  productsList.innerHTML = products.map(p => `
    <div class="product-card" data-id="${p.id}">
      <img
        class="product-card__img"
        src="${p.img}"
        alt="${p.name}"
        onerror="this.src='https://placehold.co/200x160/181818/888?text=Kendama'"
      />
      <div class="product-card__info">
        <span class="product-card__tag" style="background:${p.tagColor}22;color:${p.tagColor}">${p.tag}</span>
        <h3 class="product-card__name">${p.name}</h3>
        <p class="product-card__desc">${p.desc}</p>
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
      <img
        class="cart-item__img"
        src="${item.img}"
        alt="${item.name}"
        onerror="this.src='https://placehold.co/70x60/181818/888?text=K'"
      />
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
