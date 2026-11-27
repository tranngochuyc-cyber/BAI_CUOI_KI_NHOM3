import {
  renderProductGrid,
  renderProductGridState,
  isValidProduct,
} from "./product-grid.js";
import {
  CEE_EVENTS,
  readProducts,
  readCommunityWasteTotal,
} from "./cee-integration.js";

// Số mặt hàng mới nhất hiển thị trên Trang chủ; toàn bộ danh sách xem ở trang Danh mục.
const LATEST_LIMIT = 6;

const productContainer = document.querySelector("#latest-products");
const wasteValue = document.querySelector("#community-waste-value");
const wasteNote = document.querySelector("#community-waste-note");

function newestFirst(products) {
  return products
    .filter(isValidProduct)
    .slice()
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt));
}

async function refreshProducts() {
  if (!productContainer) return;
  productContainer.setAttribute("aria-busy", "true");

  const source = await readProducts();
  if (!source.available) {
    renderProductGridState(
      productContainer,
      "Chưa có dữ liệu sản phẩm từ nguồn dữ liệu chung.",
    );
    return;
  }

  const latest = newestFirst(source.products);
  if (latest.length === 0) {
    const hasUnusableRecords = source.products.length > 0;
    renderProductGridState(
      productContainer,
      hasUnusableRecords
        ? "Dữ liệu sản phẩm chưa đúng quy ước tích hợp."
        : "Chưa có sản phẩm mới.",
    );
    return;
  }

  renderProductGrid(productContainer, latest.slice(0, LATEST_LIMIT));
}

function formatCommunityTotal(summary) {
  const formattedValue = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(summary.value);
  return `${formattedValue} ${summary.unit}`;
}

async function refreshWasteTotal() {
  if (!wasteValue) return;

  const summary = await readCommunityWasteTotal();
  if (!summary) {
    wasteValue.textContent = "Chưa có dữ liệu";
    wasteValue.dataset.state = "unavailable";
    if (wasteNote) {
      wasteNote.textContent = "Chưa nhận được kết quả hợp lệ từ module tính toán.";
    }
    return;
  }

  wasteValue.textContent = formatCommunityTotal(summary);
  wasteValue.dataset.state = "available";
  if (wasteNote) {
    wasteNote.textContent = "Kết quả được cung cấp trực tiếp bởi module tính toán của hệ thống.";
  }
}

async function refreshHomeData() {
  await Promise.all([refreshProducts(), refreshWasteTotal()]);
}

// AI 2 / AI 3 (or the shared data layer) dispatch these events after updates.
window.addEventListener(CEE_EVENTS.productsUpdated, refreshProducts);
window.addEventListener(CEE_EVENTS.wasteUpdated, refreshWasteTotal);

refreshHomeData();
