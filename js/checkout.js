// =============================================
//  PEAR — Checkout (Livrare + Plată cu Card)
// =============================================

const cart = JSON.parse(localStorage.getItem("pearCart") || "[]");

// ---- Order summary ----
const summaryItems  = document.getElementById("summaryItems");
const summaryTotal  = document.getElementById("summaryTotal");
const summaryTotalV = document.getElementById("summaryTotalValue");

if (cart.length === 0) {
  summaryItems.innerHTML = '<p class="cart-empty">Coșul tău este gol. <a href="index.html">Înapoi la produse →</a></p>';
} else {
  summaryItems.innerHTML = cart.map(item => `
    <div class="summary__item">
      <span class="summary__item-name">${item.name}</span>
      <span class="summary__item-qty">x${item.qty}</span>
      <span class="summary__item-price">${item.price * item.qty} RON</span>
    </div>
  `).join("");
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  summaryTotalV.textContent = `${total} RON`;
  summaryTotal.style.display = "flex";
}

// =============================================
//  STEP 1 — DELIVERY VALIDATION
// =============================================
const deliveryRules = {
  name:    { validate: v => v.trim().length >= 3,                             message: "Introdu un nume complet (min. 3 caractere)." },
  address: { validate: v => v.trim().length >= 10,                            message: "Introdu o adresă completă (stradă, număr, oraș)." },
  phone:   { validate: v => /^(\+4|0)[0-9]{9}$/.test(v.replace(/\s/g,"")),   message: "Număr invalid. ex: 0740 123 456" },
  email:   { validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),     message: "Adresă de email invalidă." },
};

function validateDeliveryField(name) {
  const input = document.getElementById(name);
  const error = document.getElementById(name + "Error");
  const rule  = deliveryRules[name];
  const valid = rule.validate(input.value);
  error.textContent = valid ? "" : rule.message;
  input.classList.toggle("error", !valid);
  input.classList.toggle("valid", valid);
  return valid;
}

Object.keys(deliveryRules).forEach(name => {
  const input = document.getElementById(name);
  input.addEventListener("blur",  () => validateDeliveryField(name));
  input.addEventListener("input", () => { if (input.classList.contains("error")) validateDeliveryField(name); });
});

// Step 1 submit → go to step 2
document.getElementById("deliveryForm").addEventListener("submit", e => {
  e.preventDefault();
  const allValid = Object.keys(deliveryRules).map(validateDeliveryField).every(Boolean);
  if (!allValid) {
    document.querySelector(".error")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  goToStep(2);
});

// Back button
document.getElementById("backToDelivery").addEventListener("click", () => goToStep(1));

function goToStep(n) {
  const delivery = document.getElementById("deliveryForm");
  const payment  = document.getElementById("paymentForm");
  const s1 = document.getElementById("step1Ind");
  const s2 = document.getElementById("step2Ind");

  if (n === 1) {
    payment.style.display  = "none";
    delivery.style.display = "flex";
    s1.classList.add("active");    s1.classList.remove("done");
    s2.classList.remove("active"); s2.classList.remove("done");
  } else {
    delivery.style.display = "none";
    payment.style.display  = "flex";
    s1.classList.remove("active"); s1.classList.add("done");
    s1.querySelector(".step__circle").textContent = "✓";
    s2.classList.add("active");
    payment.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// =============================================
//  CARD FORMATTING & PREVIEW
// =============================================
const cardNumberInput = document.getElementById("cardNumber");
const cardNameInput   = document.getElementById("cardName");
const cardExpiryInput = document.getElementById("cardExpiry");
const previewNumber   = document.getElementById("previewNumber");
const previewName     = document.getElementById("previewName");
const previewExpiry   = document.getElementById("previewExpiry");
const cardTypeVisa    = document.getElementById("cardTypeVisa");
const cardTypeMC      = document.getElementById("cardTypeMC");

// Format card number: add space every 4 digits
cardNumberInput.addEventListener("input", e => {
  let val = e.target.value.replace(/\D/g, "").substring(0, 16);
  e.target.value = val.replace(/(.{4})/g, "$1 ").trim();

  // Update preview
  const padded = val.padEnd(16, "•");
  previewNumber.textContent = padded.replace(/(.{4})/g, "$1 ").trim();

  // Card type detection
  const first = val[0];
  cardTypeVisa.style.display = first === "4" ? "block" : "none";
  cardTypeMC.style.display   = first === "5" ? "block" : "none";

  if (cardNumberInput.classList.contains("error")) validateCardField("cardNumber");
});

// Cardholder name preview
cardNameInput.addEventListener("input", e => {
  const val = e.target.value.toUpperCase();
  e.target.value = val;
  previewName.textContent = val || "NUMELE TĂU";
  if (cardNameInput.classList.contains("error")) validateCardField("cardName");
});

// Expiry format: MM/YY
cardExpiryInput.addEventListener("input", e => {
  let val = e.target.value.replace(/\D/g, "").substring(0, 4);
  if (val.length >= 3) val = val.slice(0, 2) + "/" + val.slice(2);
  e.target.value = val;
  previewExpiry.textContent = val || "MM/YY";
  if (cardExpiryInput.classList.contains("error")) validateCardField("cardExpiry");
});

// =============================================
//  STEP 2 — CARD VALIDATION
// =============================================
const cardRules = {
  cardNumber: {
    validate: v => v.replace(/\s/g, "").length === 16,
    message: "Introdu un număr de card valid (16 cifre).",
  },
  cardName: {
    validate: v => v.trim().length >= 3,
    message: "Introdu numele titularului (min. 3 caractere).",
  },
  cardExpiry: {
    validate: v => {
      const match = v.match(/^(\d{2})\/(\d{2})$/);
      if (!match) return false;
      const [, mm, yy] = match;
      if (+mm < 1 || +mm > 12) return false;
      const now   = new Date();
      const cardY = 2000 + +yy;
      const cardM = +mm - 1;
      return new Date(cardY, cardM + 1, 0) >= now;
    },
    message: "Data expirării invalidă sau cardul a expirat.",
  },
  cardCvv: {
    validate: v => /^\d{3,4}$/.test(v),
    message: "CVV trebuie să fie 3–4 cifre.",
  },
};

function validateCardField(name) {
  const input = document.getElementById(name);
  const error = document.getElementById(name + "Error");
  const rule  = cardRules[name];
  const valid = rule.validate(input.value);
  error.textContent = valid ? "" : rule.message;
  input.classList.toggle("error", !valid);
  input.classList.toggle("valid", valid);
  return valid;
}

Object.keys(cardRules).forEach(name => {
  const input = document.getElementById(name);
  input.addEventListener("blur",  () => validateCardField(name));
  input.addEventListener("input", () => { if (input.classList.contains("error")) validateCardField(name); });
});

// =============================================
//  STEP 2 SUBMIT — Simulate payment
// =============================================
document.getElementById("paymentForm").addEventListener("submit", e => {
  e.preventDefault();
  const allValid = Object.keys(cardRules).map(validateCardField).every(Boolean);
  if (!allValid) {
    document.querySelector("#paymentForm .error")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  // Loading state
  const payBtn  = document.getElementById("payBtn");
  const payText = document.getElementById("payText");
  const payIcon = document.getElementById("payIcon");
  payBtn.disabled = true;
  payText.textContent = "Se procesează...";
  payIcon.style.display = "none";

  // Simulate 2s payment processing
  setTimeout(() => {
    localStorage.removeItem("pearCart");

    // Generate order number
    const orderNum = "PEAR-" + Math.floor(100000 + Math.random() * 900000);
    document.getElementById("orderNumber").textContent = "#" + orderNum;

    // Show success
    document.getElementById("paymentForm").style.display  = "none";
    document.getElementById("deliveryForm").style.display = "none";
    document.getElementById("checkoutSuccess").style.display = "block";
    document.getElementById("checkoutSuccess").scrollIntoView({ behavior: "smooth", block: "center" });

    // Mark step 2 done
    const s2 = document.getElementById("step2Ind");
    s2.classList.add("done");
    s2.querySelector(".step__circle").textContent = "✓";
  }, 2000);
});
