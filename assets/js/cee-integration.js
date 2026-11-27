/**
 * Integration boundary for the three project parts.
 * AI 1 reads data only; it does not own the product repository or waste formula.
 */

export const CEE_EVENTS = Object.freeze({
  productsUpdated: "cee:products-updated",
  wasteUpdated: "cee:waste-updated",
});

/**
 * Expected provider from the shared application/data layer:
 * window.CEEProductRepository.getAll() -> Product[] | Promise<Product[]>
 */
export async function readProducts() {
  const repository = window.CEEProductRepository;
  if (!repository || typeof repository.getAll !== "function") {
    return { available: false, products: [] };
  }

  try {
    const products = await repository.getAll();
    if (!Array.isArray(products)) {
      return { available: false, products: [] };
    }
    return { available: true, products };
  } catch (error) {
    console.error("Không thể đọc dữ liệu sản phẩm từ CEEProductRepository.", error);
    return { available: false, products: [] };
  }
}

/**
 * Expected provider from AI 3:
 * window.CEEWasteCalculator.getCommunityTotal()
 *   -> { value: number, unit: string } | null | Promise<...>
 * AI 1 validates and displays the result; it performs no waste calculation.
 */
export async function readCommunityWasteTotal() {
  const calculator = window.CEEWasteCalculator;
  if (!calculator || typeof calculator.getCommunityTotal !== "function") {
    return null;
  }

  try {
    const result = await calculator.getCommunityTotal();
    if (
      !result ||
      typeof result !== "object" ||
      !Number.isFinite(result.value) ||
      result.value < 0 ||
      typeof result.unit !== "string" ||
      result.unit.trim().length === 0
    ) {
      return null;
    }

    return { value: result.value, unit: result.unit.trim() };
  } catch (error) {
    console.error("Không thể đọc tổng lượng rác thải từ CEEWasteCalculator.", error);
    return null;
  }
}
