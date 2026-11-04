/* ============ Shopping bag page ============ */

function renderCart() {
  const t = cartTotals();
  const layout = document.getElementById("cartLayout");
  const empty = document.getElementById("cartEmpty");

  if (!t.items.length) {
    layout.hidden = true;
    empty.hidden = false;
    return;
  }
  layout.hidden = false;
  empty.hidden = true;

  document.getElementById("cartItems").innerHTML = t.items
    .map(
      ({ product: p, qty }) => `
      <div class="cart-item">
        <a class="cart-thumb" href="product.html?id=${p.id}" style="background:linear-gradient(145deg, ${p.c1}, ${p.c2})">${p.emoji}</a>
        <div>
          <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
          <div class="ci-meta">${p.purity} · ${p.weight} · ${formatINR(p.price)} each</div>
          <button class="ci-remove" data-remove="${p.id}">Remove</button>
        </div>
        <div class="qty-box">
          <button type="button" data-dec="${p.id}" aria-label="Decrease">−</button>
          <input type="text" value="${qty}" readonly aria-label="Quantity" />
          <button type="button" data-inc="${p.id}" aria-label="Increase">+</button>
        </div>
        <div class="ci-price">${formatINR(p.price * qty)}</div>
      </div>`
    )
    .join("");

  const saved = t.mrpTotal - t.subtotal + t.discount;
  document.getElementById("summaryRows").innerHTML = `
    <div class="summary-row"><span>Subtotal</span><span>${formatINR(t.subtotal)}</span></div>
    ${
      t.mrpTotal > t.subtotal
        ? `<div class="summary-row save"><span>Sale savings</span><span>− ${formatINR(t.mrpTotal - t.subtotal)}</span></div>`
        : ""
    }
    ${
      t.discount
        ? `<div class="summary-row save"><span>Coupon (${t.code})</span><span>− ${formatINR(t.discount)}</span></div>`
        : ""
    }
    <div class="summary-row"><span>GST (3%)</span><span>${formatINR(t.gst)}</span></div>
    <div class="summary-row"><span>Shipping</span><span>${t.shipping ? formatINR(t.shipping) : "FREE"}</span></div>
    <div class="summary-row total"><span>Total</span><span>${formatINR(t.total)}</span></div>
    ${saved > 0 ? `<div class="summary-row save"><span>You save in total</span><span>${formatINR(saved)}</span></div>` : ""}`;

  if (t.code) document.getElementById("couponInput").value = t.code;

  document.querySelectorAll("[data-remove]").forEach((b) =>
    b.addEventListener("click", () => {
      removeFromCart(b.dataset.remove);
      renderCart();
    })
  );
  document.querySelectorAll("[data-inc]").forEach((b) =>
    b.addEventListener("click", () => {
      const item = getCart().find((i) => i.id === b.dataset.inc);
      setQty(b.dataset.inc, (item?.qty || 0) + 1);
      renderCart();
    })
  );
  document.querySelectorAll("[data-dec]").forEach((b) =>
    b.addEventListener("click", () => {
      const item = getCart().find((i) => i.id === b.dataset.dec);
      setQty(b.dataset.dec, (item?.qty || 0) - 1);
      renderCart();
    })
  );
}

document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  document.getElementById("applyCoupon").addEventListener("click", () => {
    const res = applyCoupon(document.getElementById("couponInput").value);
    const msg = document.getElementById("couponMsg");
    msg.textContent = res.msg;
    msg.style.color = res.ok ? "var(--success)" : "var(--danger)";
    if (!res.ok) clearCoupon();
    renderCart();
  });
});
