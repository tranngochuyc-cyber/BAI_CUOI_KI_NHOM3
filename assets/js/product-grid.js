/**
 * Shared Product Grid component owned by AI 1.
 * AI 2 should import renderProductGrid() instead of creating another grid.
 */

export const PRODUCT_CONDITIONS = Object.freeze([
  "Like new",
  "Good",
  "Fair",
]);

export const EXCHANGE_TYPES = Object.freeze([
  "Give",
  "Sell",
  "Exchange",
]);

// Nghĩa tiếng Việt chỉ để hiển thị; giá trị dữ liệu giữ nguyên theo README.
const CONDITION_VI = Object.freeze({
  "Like new": "Như mới",
  Good: "Tốt",
  Fair: "Còn dùng được",
});

const EXCHANGE_VI = Object.freeze({
  Give: "Tặng",
  Sell: "Bán",
  Exchange: "Đổi",
});

const numberFormat = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });

const CONDITION_CLASS = Object.freeze({
  "Like new": "condition-badge--like-new",
  Good: "condition-badge--good",
  Fair: "condition-badge--fair",
});

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDate(value) {
  return isNonEmptyString(value) && Number.isFinite(Date.parse(value));
}

/**
 * The shared product contract is intentionally strict for fields required by
 * the Home feed and category/search page. Optional display fields are checked
 * separately so a missing image or description does not break the card.
 */
export function isValidProduct(product) {
  if (!product || typeof product !== "object" || Array.isArray(product)) {
    return false;
  }

  return (
    isNonEmptyString(product.id) &&
    isNonEmptyString(product.title) &&
    PRODUCT_CONDITIONS.includes(product.condition) &&
    isNonEmptyString(product.category) &&
    EXCHANGE_TYPES.includes(product.exchangeType) &&
    isValidDate(product.createdAt)
  );
}

function safeImageUrl(value) {
  if (!isNonEmptyString(value)) return null;

  try {
    const parsed = new URL(value, document.baseURI);
    if (["http:", "https:", "blob:"].includes(parsed.protocol)) {
      return parsed.href;
    }
  } catch {
    // Invalid URL: render the local fallback illustration.
  }

  return null;
}

function makeFallbackImage() {
  const wrapper = document.createElement("div");
  wrapper.className = "product-card__image product-card__image--fallback";
  wrapper.setAttribute("aria-label", "Sản phẩm chưa có hình ảnh");
  wrapper.setAttribute("role", "img");
  wrapper.innerHTML = `
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path d="M18 45.5h28a7.5 7.5 0 0 0 .8-15 14.8 14.8 0 0 0-28.6-2.2A9 9 0 0 0 18 45.5Z"
        fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="m25 34 5 5 10-12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`;
  return wrapper;
}

export function renderConditionBadge(condition) {
  if (!PRODUCT_CONDITIONS.includes(condition)) return null;

  const badge = document.createElement("span");
  badge.className = `condition-badge ${CONDITION_CLASS[condition]}`;
  badge.textContent = condition;
  badge.title = `Tình trạng: ${CONDITION_VI[condition]}`;
  badge.setAttribute("aria-label", `Tình trạng: ${condition} (${CONDITION_VI[condition]})`);
  return badge;
}

function createProductImage(product) {
  const media = document.createElement("div");
  media.className = "product-card__media";

  const imageUrl = safeImageUrl(product.imageUrl);
  if (imageUrl) {
    const image = document.createElement("img");
    image.className = "product-card__image";
    image.src = imageUrl;
    image.alt = isNonEmptyString(product.title)
      ? product.title.trim()
      : "Hình ảnh sản phẩm";
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      image.replaceWith(makeFallbackImage());
    }, { once: true });
    media.append(image);
  } else {
    media.append(makeFallbackImage());
  }

  const badge = renderConditionBadge(product.condition);
  if (badge) {
    const badgeSlot = document.createElement("div");
    badgeSlot.className = "product-card__condition";
    badgeSlot.append(badge);
    media.append(badgeSlot);
  }

  if (product.isDemo === true) {
    const demo = document.createElement("span");
    demo.className = "product-card__demo";
    demo.textContent = "Tin demo";
    demo.title = "Dữ liệu minh họa để trình bày, không phải tin đăng thật";
    media.append(demo);
  }

  return media;
}

function formatDistance(distance) {
  if (!distance || typeof distance !== "object" || !Number.isFinite(distance.value)) return null;
  const unit = isNonEmptyString(distance.unit) ? ` ${distance.unit}` : "";
  return `Cách ${numberFormat.format(distance.value)}${unit}`;
}

function markCompleted(container, estimate) {
  const done = document.createElement("p");
  done.className = "product-card__done";
  done.setAttribute("role", "status");
  done.textContent = estimate
    ? `✓ Đã giao dịch thành công · giảm ~${numberFormat.format(estimate.value)} ${estimate.unit} rác (ước tính)`
    : "✓ Đã giao dịch thành công";
  container.replaceChildren(done);
}

/**
 * Nút "Xác nhận giao dịch thành công": chỉ gọi window.CEETransactions (lớp nối dùng chung),
 * việc ghi nhận và tính toán do module của AI 3 thực hiện. Không có provider thì không hiện nút.
 */
function createTransactionAction(product) {
  const transactions = window.CEETransactions;
  if (!transactions || typeof transactions.confirm !== "function") return null;

  const action = document.createElement("div");
  action.className = "product-card__action";
  const estimate = typeof transactions.estimateFor === "function" ? transactions.estimateFor(product) : null;

  if (transactions.isCompleted(product.id)) {
    markCompleted(action, estimate);
    return action;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "product-card__confirm";
  button.textContent = "Xác nhận giao dịch thành công";
  button.setAttribute("aria-label", `Xác nhận giao dịch thành công: ${product.title}`);
  button.addEventListener("click", () => {
    const result = transactions.confirm(product);
    if (result && (result.status === "RECORDED" || result.status === "DUPLICATE")) {
      markCompleted(action, estimate);
    }
  });
  action.append(button);
  return action;
}

function formatPostedDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function createProductCard(product) {
  if (!isValidProduct(product)) return null;

  const card = document.createElement("article");
  card.className = "product-card";
  card.setAttribute("role", "listitem");
  card.dataset.productId = product.id;

  const body = document.createElement("div");
  body.className = "product-card__body";

  const category = document.createElement("p");
  category.className = "product-card__category";
  category.textContent = product.category;

  const title = document.createElement("h3");
  title.className = "product-card__title";
  title.textContent = product.title;

  body.append(category, title);

  if (isNonEmptyString(product.description)) {
    const description = document.createElement("p");
    description.className = "product-card__description";
    description.textContent = product.description;
    body.append(description);
  }

  const meta = document.createElement("div");
  meta.className = "product-card__meta";

  const exchangeType = document.createElement("span");
  exchangeType.className = "product-card__exchange";
  exchangeType.textContent = `${product.exchangeType} · ${EXCHANGE_VI[product.exchangeType]}`;
  meta.append(exchangeType);

  const distanceText = formatDistance(product.distance);
  if (distanceText) {
    const distance = document.createElement("span");
    distance.className = "product-card__distance";
    distance.textContent = distanceText;
    meta.append(distance);
  }

  const postedDate = formatPostedDate(product.createdAt);
  if (postedDate) {
    const time = document.createElement("time");
    time.className = "product-card__date";
    time.dateTime = product.createdAt;
    time.textContent = `Đăng ${postedDate}`;
    meta.append(time);
  }

  body.append(meta);

  const action = createTransactionAction(product);
  if (action) body.append(action);
  card.append(createProductImage(product), body);
  return card;
}

/**
 * Render only. This function deliberately contains no search, filtering,
 * sorting, pagination, or listing-form behavior.
 *
 * @param {HTMLElement} container - Destination element.
 * @param {Array<object>} products - Products already selected by the caller.
 * @param {{ emptyMessage?: string }} options - Optional empty-state message.
 * @returns {{ rendered: number, skipped: number }} Render result.
 */
export function renderProductGrid(container, products, options = {}) {
  if (!(container instanceof HTMLElement)) {
    throw new TypeError("renderProductGrid: container phải là một HTMLElement.");
  }
  if (!Array.isArray(products)) {
    throw new TypeError("renderProductGrid: products phải là một mảng.");
  }

  const fragment = document.createDocumentFragment();
  let rendered = 0;
  let skipped = 0;

  for (const product of products) {
    const card = createProductCard(product);
    if (card) {
      fragment.append(card);
      rendered += 1;
    } else {
      skipped += 1;
    }
  }

  container.replaceChildren();
  container.setAttribute("aria-busy", "false");

  if (rendered === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "grid-state";
    emptyState.setAttribute("role", "status");
    emptyState.textContent = options.emptyMessage || "Chưa có sản phẩm phù hợp để hiển thị.";
    container.append(emptyState);
  } else {
    container.append(fragment);
  }

  return { rendered, skipped };
}

/** Show a product-data state without inventing placeholder product records. */
export function renderProductGridState(container, message) {
  if (!(container instanceof HTMLElement)) {
    throw new TypeError("renderProductGridState: container phải là một HTMLElement.");
  }

  const state = document.createElement("p");
  state.className = "grid-state";
  state.setAttribute("role", "status");
  state.textContent = message;
  container.replaceChildren(state);
  container.setAttribute("aria-busy", "false");
}
