import { paginateItems } from "./pagination.js";

const DEFAULT_TRANSACTION_CARD_PAGE_SIZE = 5;

export function buildTransactionListView(items = [], options = {}) {
  const {
    search = "",
    payeeTypeFilter = "all",
    dormantFilter = "all",
    currentPage = 1,
    pageSize = DEFAULT_TRANSACTION_CARD_PAGE_SIZE,
  } = options;

  const filteredItems = items.filter((item) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch =
      !keyword ||
      [item.transactionNo, item.memberUnitName, item.payeeName, item.businessScenario, item.batchNo]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword));
    const matchesPayeeType = payeeTypeFilter === "all" || item.payeeType === payeeTypeFilter;
    const matchesDormant =
      dormantFilter === "all" ||
      (dormantFilter === "yes" ? item.isDormantAccount : !item.isDormantAccount);

    return matchesSearch && matchesPayeeType && matchesDormant;
  });

  const pagination = paginateItems(filteredItems, { currentPage, pageSize });

  return {
    filteredItems,
    pagination,
    visibleItems: pagination.items,
  };
}
