// =============================================
//  PEAR — Checkout Page
// =============================================

// ---- Load cart from localStorage ----
const cart = JSON.parse(localStorage.getItem("pearCart") || "[]");

// ---- Render order summary ----
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
//  VALIDATION
// =============================================
const rules = {
  name: {
    validate: v => v.trim().length >= 3,
    message: "Introdu un nume complet (min. 3 caractere).",
  },
  address: {
    validate: v => v.trim().length >= 10,
    message: "Introdu o adresă completă (stradă, număr, oraș).",
  },
  phone: {
    validate: v => /^(\+4|0)[0-9]{9}$/.test(v.replace(/\s/g, "")),
    message: "Număr de telefon invalid. ex: 0740 123 456",
  },
  email: {
    validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    message: "Adresă de email invalidă.",
  },
};

function getField(name) {
  return document.getElementById(name);
}
function getError(name) {
  return document.getElementById(name + "Error");
}

function validateField(name) {
  const input = getField(name);
  const error = getError(name);
  const rule  = rules[name];
  if (!rule) return true;

  const valid = rule.validate(input.value);
  error.textContent  = valid ? "" : rule.message;
  input.classList.toggle("error", !valid);
  input.classList.toggle("valid",  valid);
  return valid;
}

// Live validation on blur
Object.keys(rules).forEach(name => {
  const input = getField(name);
  input.addEventListener("blur",  () => validateField(name));
  input.addEventListener("input", () => {
    if (input.classList.contains("error")) validateField(name);
  });
});

// =============================================
//  FORM SUBMIT
// =============================================
const form       = document.getElementById("checkoutForm");
const submitBtn  = document.getElementById("submitBtn");
const submitText = document.getElementById("submitText");
const submitIcon = document.getElementById("submitIcon");
const successBox = document.getElementById("checkoutSuccess");

form.addEventListener("submit", e => {
  e.preventDefault();

  // Validate all fields
  const allValid = Object.keys(rules).map(validateField).every(Boolean);
  if (!allValid) {
    // Scroll to first error
    const firstError = form.querySelector(".error");
    if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  // Loading state
  submitBtn.disabled = true;
  submitText.textContent = "Se procesează...";
  submitIcon.style.display = "none";

  // Simulate order processing (1.5s)
  setTimeout(() => {
    localStorage.removeItem("pearCart");
    form.style.display = "none";
    successBox.style.display = "block";
    successBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 1500);
});
