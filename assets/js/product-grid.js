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
  badge.setAttribute("aria-label", `Tình trạng: ${condition}`);
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

  return media;
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
  exchangeType.textContent = product.exchangeType;
  meta.append(exchangeType);

  const postedDate = formatPostedDate(product.createdAt);
  if (postedDate) {
    const time = document.createElement("time");
    time.className = "product-card__date";
    time.dateTime = product.createdAt;
    time.textContent = `Đăng ${postedDate}`;
    meta.append(time);
  }

  body.append(meta);
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
