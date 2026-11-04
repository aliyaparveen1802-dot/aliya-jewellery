/* ============ Checkout page ============ */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkoutForm");
  const t = cartTotals();

  if (!t.items.length) {
    form.innerHTML = `
      <div class="empty-state card" style="grid-column:1/-1">
        <div class="big">🛍️</div>
        <h3>Nothing to check out</h3>
        <p>Your bag is empty — add a piece first.</p>
        <a class="btn btn-gold" href="shop.html">Browse Jewellery</a>
      </div>`;
    return;
  }

  document.getElementById("checkoutItems").innerHTML = t.items
    .map(
      ({ product: p, qty }) => `
      <div class="summary-row">
        <span>${p.emoji} ${p.name} <small style="color:var(--muted)">× ${qty}</small></span>
        <span>${formatINR(p.price * qty)}</span>
      </div>`
    )
    .join("");

  document.getElementById("checkoutSummary").innerHTML = `
    <div class="summary-row" style="border-top:1px solid var(--line);margin-top:8px;padding-top:12px">
      <span>Subtotal</span><span>${formatINR(t.subtotal)}</span>
    </div>
    ${
      t.discount
        ? `<div class="summary-row save"><span>Coupon ${t.code}</span><span>− ${formatINR(t.discount)}</span></div>`
        : ""
    }
    <div class="summary-row"><span>GST (3%)</span><span>${formatINR(t.gst)}</span></div>
    <div class="summary-row"><span>Shipping</span><span>${t.shipping ? formatINR(t.shipping) : "FREE"}</span></div>
    <div class="summary-row total"><span>Total</span><span>${formatINR(t.total)}</span></div>`;

  function setError(id, msg) {
    const el = document.getElementById(id);
    let err = el.parentElement.querySelector(".err-msg");
    if (!err) {
      err = document.createElement("div");
      err.className = "err-msg";
      err.style.cssText = "color:var(--danger);font-size:0.78rem;margin-top:4px";
      el.parentElement.appendChild(err);
    }
    err.textContent = msg || "";
    el.style.borderColor = msg ? "var(--danger)" : "";
    return !msg;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("fname").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const pin = document.getElementById("pin").value.trim();

    let ok = true;
    ok = setError("fname", name.length < 2 ? "Please enter your full name." : "") && ok;
    ok = setError("phone", /^[6-9]\d{9}$/.test(phone) ? "" : "Enter a valid 10-digit mobile number.") && ok;
    ok = setError("email", email && !/^\S+@\S+\.\S+$/.test(email) ? "Enter a valid email." : "") && ok;
    ok = setError("address", address.length < 6 ? "Please enter your full address." : "") && ok;
    ok = setError("city", city.length < 2 ? "Please enter your city." : "") && ok;
    ok = setError("pin", /^\d{6}$/.test(pin) ? "" : "Enter a valid 6-digit PIN code.") && ok;

    if (!ok) {
      showToast("Please fix the highlighted fields");
      return;
    }

    const orderId = "ALY" + Date.now().toString().slice(-8);
    const total = t.total;
    const items = t.items.length;

    document.getElementById("successMsg").textContent = `Namaste ${name.split(" ")[0]}, we've received your order for ${items} item${items > 1 ? "s" : ""}. Our stylist will call you on ${phone} within 2 hours to confirm.`;
    document.getElementById("orderId").textContent = "Order ID: " + orderId;
    document.getElementById("successSummary").textContent = `Total payable on confirmation: ${formatINR(total)} · Delivering to ${city} — ${pin}`;

    form.hidden = true;
    document.getElementById("orderSuccess").hidden = false;
    localStorage.removeItem("aliya_cart");
    localStorage.removeItem("aliya_coupon");
    updateCartCount();
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast("Order placed successfully ✓");
  });
});
