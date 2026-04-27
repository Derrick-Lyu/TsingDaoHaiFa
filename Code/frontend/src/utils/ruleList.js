import { paginateItems } from "./pagination.js";

const DEFAULT_RULE_PAGE_SIZE = 5;

export function buildRuleListView(items = [], options = {}) {
  const { currentPage = 1, pageSize = DEFAULT_RULE_PAGE_SIZE } = options;
  const pagination = paginateItems(items, { currentPage, pageSize });

  return {
    pagination,
    visibleItems: pagination.items,
  };
}
