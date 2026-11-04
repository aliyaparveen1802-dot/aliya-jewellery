/* ============ Shop listing: filters, sort ============ */

(function () {
  let state = { cat: "all", price: "all", sort: "featured" };

  const params = new URLSearchParams(location.search);
  if (params.get("cat")) state.cat = params.get("cat");
  if (params.get("sort") === "new") state.sort = "featured";
  if (params.get("sort") === "discount") state.sort = "discount";

  const grid = document.getElementById("shopGrid");
  const empty = document.getElementById("shopEmpty");
  const count = document.getElementById("resultCount");

  function filtered() {
    let list = PRODUCTS.slice();

    if (state.cat !== "all") {
      list = list.filter(
        (p) => p.category === state.cat || p.type === state.cat
      );
    }

    if (state.price !== "all") {
      const [min, max] = state.price.split("-").map(Number);
      list = list.filter((p) => p.price >= min && p.price <= max);
    }

    if (state.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (state.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (state.sort === "discount")
      list.sort((a, b) => discountPercent(b) - discountPercent(a));
    else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    return list;
  }

  function render() {
    const list = filtered();
    count.textContent = `${list.length} piece${list.length !== 1 ? "s" : ""} found`;
    grid.innerHTML = list.map(productCard).join("");
    empty.hidden = list.length > 0;
    grid.hidden = list.length === 0;
    bindAddButtons(grid);

    document.querySelectorAll("#catChips .chip").forEach((c) =>
      c.classList.toggle("active", c.dataset.cat === state.cat)
    );
  }

  document.querySelectorAll("#catChips .chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      state.cat = chip.dataset.cat;
      render();
    })
  );

  document.getElementById("priceFilter").addEventListener("change", (e) => {
    state.price = e.target.value;
    render();
  });

  document.getElementById("sortBy").addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });

  document.getElementById("resetFilters").addEventListener("click", () => {
    state = { cat: "all", price: "all", sort: "featured" };
    document.getElementById("priceFilter").value = "all";
    document.getElementById("sortBy").value = "featured";
    render();
  });

  render();
})();
