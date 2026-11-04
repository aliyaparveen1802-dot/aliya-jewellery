/* ============ Aliya — shared scripts (nav, cart, home) ============ */

const SITE = {
  name: "ALIYA",
  tagline: "Fine Gold & Diamond Jewellery",
  phone: "+91 98765 43210",
  email: "care@aliyajewellery.in",
  address: "12 Heritage Plaza, MG Road, Bengaluru 560001",
  hours: "Mon – Sat: 10:30 AM – 8:30 PM",
};

/* ---------- Cart (localStorage) ---------- */

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("aliya_cart")) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("aliya_cart", JSON.stringify(cart));
  updateCartCount();
}

function addToCart(id, qty = 1) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (item) item.qty += qty;
  else cart.push({ id, qty });
  saveCart(cart);
  showToast("Added to bag ✓");
}

function setQty(id, qty) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  if (qty <= 0) removeFromCart(id);
  else {
    item.qty = qty;
    saveCart(cart);
  }
}

function removeFromCart(id) {
  saveCart(getCart().filter((i) => i.id !== id));
  showToast("Removed from bag");
}

function cartCount() {
  return getCart().reduce((n, i) => n + i.qty, 0);
}

function cartTotals() {
  const cart = getCart();
  let subtotal = 0;
  let mrpTotal = 0;
  const items = cart
    .map((i) => {
      const p = findProduct(i.id);
      if (!p) return null;
      subtotal += p.price * i.qty;
      mrpTotal += (p.oldPrice || p.price) * i.qty;
      return { ...i, product: p };
    })
    .filter(Boolean);

  let discount = 0;
  const code = localStorage.getItem("aliya_coupon") || "";
  const c = COUPONS[code];
  if (c) {
    if (c.category) {
      const catSub = items
        .filter((i) => i.product.category === c.category)
        .reduce((s, i) => s + i.product.price * i.qty, 0);
      discount = c.type === "percent" ? (catSub * c.value) / 100 : 0;
    } else {
      if (subtotal >= c.min) {
        discount = c.type === "percent" ? (subtotal * c.value) / 100 : c.value;
      }
    }
  }

  const gst = Math.round((subtotal - discount) * 0.03);
  const shipping = subtotal - discount >= 5000 || subtotal === 0 ? 0 : 250;
  const total = Math.max(0, subtotal - discount) + gst + shipping;

  return { items, subtotal, mrpTotal, discount, gst, shipping, total, code, coupon: c };
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (el) {
    const n = cartCount();
    el.textContent = n;
    el.style.display = n ? "grid" : "none";
  }
}

/* ---------- Coupon ---------- */

function applyCoupon(raw) {
  const code = (raw || "").trim().toUpperCase();
  if (!code) return { ok: false, msg: "Enter a coupon code." };
  const c = COUPONS[code];
  if (!c) return { ok: false, msg: "Invalid coupon code." };
  const { subtotal } = cartTotals();
  if (subtotal < c.min)
    return {
      ok: false,
      msg: `This code needs a minimum order of ${formatINR(c.min)}.`,
    };
  localStorage.setItem("aliya_coupon", code);
  return { ok: true, msg: `Applied: ${c.label}` };
}

function clearCoupon() {
  localStorage.removeItem("aliya_coupon");
}

/* ---------- Toast ---------- */

let toastTimer;
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Header / footer ---------- */

const NAV_LINKS = [
  { href: "index.html", label: "Home", page: "home" },
  { href: "shop.html", label: "Shop", page: "shop" },
  { href: "rates.html", label: "Rates & Offers", page: "rates" },
  { href: "about.html", label: "About", page: "about" },
  { href: "contact.html", label: "Contact", page: "contact" },
];

function renderHeader() {
  const page = document.body.dataset.page || "";
  const tickerItems = [
    ...RATES.gold.map((g) => `${g.purity} Gold <b>${formatINR(g.perGram)}/g</b>`),
    ...RATES.diamond.map((d) => `${d.purity} <b>${formatINR(d.perCarat)}/ct</b>`),
    `Festive Offer <b>10% OFF with ALIYA10</b>`,
    `Free insured shipping above <b>${formatINR(5000)}</b>`,
  ];
  const tickerHTML = tickerItems
    .map((t) => `<span>${t}</span>`)
    .join("");

  document.getElementById("header").innerHTML = `
    <div class="ticker" aria-label="Today's gold and diamond rates">
      <div class="ticker-track">${tickerHTML}${tickerHTML}</div>
    </div>
    <header class="site-header">
      <div class="container header-inner">
        <a class="logo" href="index.html" aria-label="Aliya home">
          <span class="logo-mark">A</span>
          <span class="logo-text">${SITE.name}<small>${SITE.tagline}</small></span>
        </a>
        <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
        <nav class="main-nav" id="mainNav" aria-label="Main navigation">
          <ul>
            ${NAV_LINKS.map(
              (l) =>
                `<li><a href="${l.href}" class="${l.page === page ? "active" : ""}">${l.label}</a></li>`
            ).join("")}
            <li>
              <a href="cart.html" class="nav-cart" aria-label="Shopping bag">
                🛍 Bag <span class="cart-count" id="cartCount">0</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>`;

  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });

  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  updateCartCount();
}

function renderFooter() {
  document.getElementById("footer").innerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <a class="logo" href="index.html">
            <span class="logo-mark">A</span>
            <span class="logo-text" style="color:#faf6ee">${SITE.name}<small>${SITE.tagline}</small></span>
          </a>
          <p style="margin-top:14px">Hallmarked gold and certified diamonds, crafted for the moments you'll never forget.</p>
          <div class="socials">
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="WhatsApp">WA</a>
          </div>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul class="footer-links">
            ${NAV_LINKS.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join("")}
            <li><a href="cart.html">Shopping Bag</a></li>
          </ul>
        </div>
        <div>
          <h4>Shop</h4>
          <ul class="footer-links">
            <li><a href="shop.html?cat=gold">Gold Jewellery</a></li>
            <li><a href="shop.html?cat=diamond">Diamond Jewellery</a></li>
            <li><a href="shop.html?sort=new">New Arrivals</a></li>
            <li><a href="shop.html?sort=discount">On Sale</a></li>
            <li><a href="rates.html">Today's Rates</a></li>
          </ul>
        </div>
        <div>
          <h4>Visit Us</h4>
          <ul class="footer-links">
            <li>${SITE.address}</li>
            <li>${SITE.phone}</li>
            <li>${SITE.email}</li>
            <li>${SITE.hours}</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container">© <span id="year"></span> ${SITE.name} Jewellery. All rights reserved. · BIS Hallmarked · IGI Certified Diamonds</div>
      </div>
    </footer>`;

  document.getElementById("year").textContent = new Date().getFullYear();
}

/* ---------- Reusable card renderer ---------- */

function productCard(p) {
  const off = discountPercent(p);
  return `
    <article class="product-card">
      ${p.badge ? `<span class="p-badge ${p.badge === "Sale" ? "" : "dark"}">${p.badge}</span>` : ""}
      <a class="p-img" href="product.html?id=${p.id}" style="background:linear-gradient(145deg, ${p.c1}, ${p.c2})" aria-label="${p.name}">
        <span>${p.emoji}</span>
      </a>
      <div class="p-body">
        <span class="p-cat">${p.category} · ${p.type}</span>
        <h3 class="p-title"><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <span class="p-meta">${p.purity} · ${p.weight}</span>
        <div class="p-price">
          <span class="now">${formatINR(p.price)}</span>
          ${p.oldPrice ? `<span class="was">${formatINR(p.oldPrice)}</span>` : ""}
          ${off ? `<span class="off">${off}% off</span>` : ""}
        </div>
        <div class="p-actions">
          <button class="btn btn-gold btn-sm" data-add="${p.id}">Add to Bag</button>
          <a class="btn btn-outline btn-sm" href="product.html?id=${p.id}">View</a>
        </div>
      </div>
    </article>`;
}

function bindAddButtons(scope = document) {
  scope.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add, 1));
  });
}

/* ---------- Home page ---------- */

function renderHome() {
  const rateWrap = document.getElementById("homeRates");
  if (rateWrap) {
    const gold = RATES.gold.map(
      (g) => `
      <div class="rate-card">
        <div class="r-icon">${g.icon}</div>
        <h3>${g.purity} Gold</h3>
        <div class="price">${formatINR(g.perGram)}</div>
        <div class="per">per gram</div>
      </div>`
    );
    const dia = RATES.diamond[0];
    gold.push(`
      <div class="rate-card diamond">
        <div class="r-icon">${dia.icon}</div>
        <h3>${dia.purity}</h3>
        <div class="price">${formatINR(dia.perCarat)}</div>
        <div class="per">per carat</div>
      </div>`);
    rateWrap.innerHTML = gold.join("");
  }

  const offerWrap = document.getElementById("homeOffers");
  if (offerWrap) {
    offerWrap.innerHTML = OFFERS.map(
      (o) => `
      <div class="offer-card">
        <span class="offer-tag">${o.tag}</span>
        <h3>${o.title}</h3>
        <p>${o.text}</p>
        <div class="code-box">
          <code>${o.code}</code>
          <button class="btn btn-dark btn-sm" data-copy="${o.code}">Copy</button>
        </div>
      </div>`
    ).join("");
    offerWrap.querySelectorAll("[data-copy]").forEach((b) =>
      b.addEventListener("click", () => {
        navigator.clipboard?.writeText(b.dataset.copy);
        showToast(`Code ${b.dataset.copy} copied`);
      })
    );
  }

  const feat = document.getElementById("homeFeatured");
  if (feat) {
    feat.innerHTML = PRODUCTS.filter((p) => p.featured)
      .slice(0, 8)
      .map(productCard)
      .join("");
    bindAddButtons(feat);
    initFeaturedCarousel();
  }

  initHeroCarousel();
}

/* ---------- Hero carousel ---------- */

function initHeroCarousel() {
  const root = document.getElementById("heroCarousel");
  if (!root) return;

  const slides = Array.from(root.querySelectorAll(".slide"));
  const dotsWrap = document.getElementById("heroDots");
  const reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let idx = 0;
  let timer = null;

  dotsWrap.innerHTML = slides
    .map(
      (_, i) =>
        `<button aria-label="Go to slide ${i + 1}" class="${i === 0 ? "active" : ""}"></button>`
    )
    .join("");
  const dots = Array.from(dotsWrap.children);

  function go(n) {
    idx = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle("active", i === idx));
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === idx);
      d.setAttribute("aria-selected", i === idx);
    });
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  function start() {
    if (reduced) return;
    stop();
    timer = setInterval(() => go(idx + 1), 6000);
  }

  root.querySelector(".next").addEventListener("click", () => {
    go(idx + 1);
    start();
  });
  root.querySelector(".prev").addEventListener("click", () => {
    go(idx - 1);
    start();
  });
  dots.forEach((d, i) =>
    d.addEventListener("click", () => {
      go(i);
      start();
    })
  );

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);

  let touchX = null;
  root.addEventListener(
    "touchstart",
    (e) => {
      touchX = e.touches[0].clientX;
      stop();
    },
    { passive: true }
  );
  root.addEventListener(
    "touchend",
    (e) => {
      if (touchX == null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 45) go(idx + (dx < 0 ? 1 : -1));
      touchX = null;
      start();
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : start()
  );

  start();
}

/* ---------- Featured product carousel ---------- */

function initFeaturedCarousel() {
  const track = document.getElementById("homeFeatured");
  if (!track) return;
  const wrap = track.closest(".product-carousel");
  if (!wrap) return;

  const prev = wrap.querySelector(".prev");
  const next = wrap.querySelector(".next");

  const step = () => {
    const card = track.querySelector(".product-card");
    return card ? card.offsetWidth + 22 : 284;
  };

  prev.addEventListener("click", () =>
    track.scrollBy({ left: -step() * 2, behavior: "smooth" })
  );
  next.addEventListener("click", () =>
    track.scrollBy({ left: step() * 2, behavior: "smooth" })
  );

  const sync = () => {
    const scrollable = track.scrollWidth > track.clientWidth + 10;
    prev.style.display = scrollable ? "" : "none";
    next.style.display = scrollable ? "" : "none";
  };
  sync();
  window.addEventListener("resize", sync);
}

/* ---------- Boot ---------- */

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  renderHome();
});
