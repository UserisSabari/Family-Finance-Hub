export function TransactionFilters({ filters, onChange }) {
  return (
    <div className="transaction-filters" aria-label="Transaction filters">
      <label>Search
        <input aria-label="Search transactions" value={filters.search} onChange={(event) => onChange({ search: event.target.value })} placeholder="Search category or note" />
      </label>
      <label>Type
        <select aria-label="Filter by type" value={filters.type} onChange={(event) => onChange({ type: event.target.value })}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="refund">Refund</option>
          <option value="transfer">Transfer</option>
        </select>
      </label>
      <label>Category
        <input aria-label="Filter by category" value={filters.category} onChange={(event) => onChange({ category: event.target.value })} placeholder="Any category" />
      </label>
    </div>
  );
}
