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

function describeTotal(summary) {
  const parts = [];
  if (summary.transactionCount === 0) {
    parts.push("Chưa có giao dịch thành công nào.");
  } else if (Number.isInteger(summary.transactionCount)) {
    parts.push(`Ước tính từ ${summary.transactionCount} giao dịch thành công.`);
  }
  if (summary.label) parts.push(`${summary.label}.`);
  return parts.join(" ") || "Kết quả được cung cấp bởi module tính toán của hệ thống.";
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
  if (wasteNote) wasteNote.textContent = describeTotal(summary);
}

async function refreshHomeData() {
  await Promise.all([refreshProducts(), refreshWasteTotal()]);
}

// AI 2 / AI 3 (or the shared data layer) dispatch these events after updates.
window.addEventListener(CEE_EVENTS.productsUpdated, refreshProducts);
window.addEventListener(CEE_EVENTS.wasteUpdated, refreshWasteTotal);

// Nút đặt lại dữ liệu để tập dượt demo (chỉ xóa tin tự đăng và giao dịch trên trình duyệt này).
const resetButton = document.querySelector("#reset-demo");
if (resetButton && window.CEETransactions && typeof window.CEETransactions.reset === "function") {
  resetButton.hidden = false;
  resetButton.addEventListener("click", () => {
    const ok = window.confirm(
      "Xóa các tin bạn đã đăng và các giao dịch đã xác nhận trên trình duyệt này? Tin demo vẫn được giữ.",
    );
    if (ok) window.CEETransactions.reset();
  });
}

refreshHomeData();
