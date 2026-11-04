/* ============ Product detail page ============ */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("productRoot");
  const params = new URLSearchParams(location.search);
  const product = findProduct(params.get("id"));

  if (!product) {
    root.innerHTML = `
      <div class="empty-state">
        <div class="big">😕</div>
        <h3>Piece not found</h3>
        <p>That jewellery item may have been sold out or the link is incorrect.</p>
        <a class="btn btn-gold" href="shop.html">Back to Shop</a>
      </div>`;
    return;
  }

  document.title = `${product.name} — Aliya Jewellery`;

  const off = discountPercent(product);
  const rateLine =
    product.category === "gold"
      ? `Priced from today's ${product.purity.split(" ")[0]} rate of ${formatINR(
          (RATES.gold.find((g) => product.purity.includes(g.purity.split(" ")[0])) || RATES.gold[1]).perGram
        )}/g + making charges`
      : `Includes ${product.stones} at today's certified diamond rate`;

  root.innerHTML = `
    <div class="crumbs" style="margin-bottom:18px">
      <a href="index.html">Home</a> / <a href="shop.html">Shop</a> /
      <a href="shop.html?cat=${product.category}">${product.category === "gold" ? "Gold" : "Diamond"}</a> / ${product.name}
    </div>
    <div class="detail-wrap">
      <div class="detail-gallery" style="background:linear-gradient(145deg, ${product.c1}, ${product.c2})">
        <span>${product.emoji}</span>
      </div>
      <div class="detail-info">
        <span class="p-cat">${product.category} · ${product.type}</span>
        <h1>${product.name}</h1>
        <div class="detail-price">
          <span class="now">${formatINR(product.price)}</span>
          ${product.oldPrice ? `<span class="was">${formatINR(product.oldPrice)}</span>` : ""}
          ${off ? `<span class="off">${off}% OFF</span>` : ""}
        </div>
        <p>${product.desc}</p>
        <p class="p-meta">${rateLine}</p>

        <ul class="spec-list">
          <li><span>Metal</span><span>${product.purity}</span></li>
          <li><span>Weight</span><span>${product.weight}</span></li>
          <li><span>Stones</span><span>${product.stones}</span></li>
          <li><span>Category</span><span>${product.type}</span></li>
          <li><span>Certification</span><span>${product.category === "diamond" ? "IGI Certified" : "BIS Hallmark"}</span></li>
        </ul>

        <div class="buy-row">
          <div class="qty-box">
            <button type="button" id="qtyMinus" aria-label="Decrease quantity">−</button>
            <input type="text" id="qtyInput" value="1" readonly aria-label="Quantity" />
            <button type="button" id="qtyPlus" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn btn-gold" id="addBtn">Add to Bag</button>
          <button class="btn btn-dark" id="buyBtn">Buy Now</button>
        </div>

        <div class="trust-row">
          <span>Free insured shipping over ₹5,000</span>
          <span>30-day exchange</span>
          <span>100% buyback value*</span>
        </div>
      </div>
    </div>`;

  let qty = 1;
  const input = document.getElementById("qtyInput");
  document.getElementById("qtyMinus").onclick = () => {
    qty = Math.max(1, qty - 1);
    input.value = qty;
  };
  document.getElementById("qtyPlus").onclick = () => {
    qty = Math.min(10, qty + 1);
    input.value = qty;
  };
  document.getElementById("addBtn").onclick = () => addToCart(product.id, qty);
  document.getElementById("buyBtn").onclick = () => {
    addToCart(product.id, qty);
    location.href = "checkout.html";
  };

  const related = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  const grid = document.getElementById("relatedGrid");
  grid.innerHTML = related.map(productCard).join("");
  bindAddButtons(grid);
});
