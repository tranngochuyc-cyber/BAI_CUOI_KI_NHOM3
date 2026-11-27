/*
 * Trang Danh mục (AI 2): nối ô tìm kiếm/lọc với dữ liệu chung và Product Grid dùng chung của AI 1.
 * Không dựng card riêng, không tạo dữ liệu mẫu. Logic lọc nằm ở category-filter.js.
 */
import { renderProductGrid, isValidProduct } from "./product-grid.js";
import { CEE_EVENTS, readProducts } from "./cee-integration.js";

const form = document.getElementById("filter-form");
const search = document.getElementById("search-input");
const category = document.getElementById("category-select");
const distance = document.getElementById("distance-input");
const distanceLabel = document.getElementById("distance-label");
const status = document.getElementById("result-status");
const grid = document.getElementById("product-grid");

// Đơn vị lấy từ cấu hình chung; chưa chốt thì nói rõ trên giao diện.
const unit = (window.CEEConfig && window.CEEConfig.distanceUnit) || "";
distanceLabel.textContent = unit
  ? `Khoảng cách tối đa (${unit})`
  : "Khoảng cách tối đa (chưa chốt đơn vị)";

form.addEventListener("submit", (event) => event.preventDefault());

let products = [];

function fillCategories() {
  const selected = category.value;
  category.replaceChildren(new Option("Tất cả danh mục", ""));
  window.CEE.filter.getCategories(products).forEach((name) => category.add(new Option(name, name)));
  // Giữ lựa chọn hiện tại nếu danh mục vẫn còn trong dữ liệu.
  category.value = [...category.options].some((o) => o.value === selected) ? selected : "";
}

function update() {
  const result = window.CEE.filter.filterProducts(products, {
    keyword: search.value,
    category: category.value,
    maxDistance: distance.value,
  });

  renderProductGrid(grid, result, {
    emptyMessage: products.length === 0
      ? "Chưa có sản phẩm nào được đăng."
      : "Không có sản phẩm phù hợp với điều kiện lọc.",
  });
  status.textContent = result.length ? `Tìm thấy ${result.length} sản phẩm.` : "Không có sản phẩm phù hợp.";
}

async function loadProducts() {
  const source = await readProducts();
  if (!source.available) {
    products = [];
    status.textContent = "Chưa có dữ liệu sản phẩm từ nguồn dữ liệu chung.";
    [search, category, distance].forEach((el) => { el.disabled = true; });
    renderProductGrid(grid, [], { emptyMessage: "Chưa có dữ liệu sản phẩm." });
    return;
  }

  [search, category, distance].forEach((el) => { el.disabled = false; });
  products = source.products.filter(isValidProduct);
  fillCategories();
  update();
}

search.addEventListener("input", update);
category.addEventListener("change", update);
distance.addEventListener("input", update);
window.addEventListener(CEE_EVENTS.productsUpdated, loadProducts);

loadProducts();
