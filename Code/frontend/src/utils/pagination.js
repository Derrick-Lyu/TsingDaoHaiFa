const DEFAULT_PAGE_SIZE = 10;

export function paginateItems(items = [], options = {}) {
  const totalItems = Array.isArray(items) ? items.length : 0;
  const pageSize = normalizePageSize(options.pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = clampPage(options.currentPage, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    items: items.slice(startIndex, endIndex),
    pageSize,
    currentPage,
    totalItems,
    totalPages,
  };
}

function normalizePageSize(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PAGE_SIZE;
}

function clampPage(value, totalPages) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.min(parsed, totalPages);
}
