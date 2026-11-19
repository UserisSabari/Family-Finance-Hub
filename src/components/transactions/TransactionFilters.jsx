export function TransactionFilters({ filters, onChange }) {
  const currentScope = filters.scope || (filters.limit === 30 ? 'last30' : (filters.fromDate || filters.toDate ? 'custom' : 'all'));

  const handleScopeChange = (nextScope) => {
    if (nextScope === 'all') {
      onChange({ scope: 'all', limit: null, fromDate: '', toDate: '' });
    } else if (nextScope === 'last30') {
      onChange({ scope: 'last30', limit: 30, fromDate: '', toDate: '' });
    } else if (nextScope === 'thisMonth') {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      onChange({
        scope: 'thisMonth',
        limit: null,
        fromDate: `${year}-${month}-01`,
        toDate: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
      });
    } else if (nextScope === 'custom') {
      onChange({ scope: 'custom', limit: null });
    }
  };

  return (
    <div className="transaction-filters" aria-label="Transaction filters">
      <div className="filter-scope-group" role="group" aria-label="Time period preset">
        <span className="filter-scope-label">Period:</span>
        <div className="filter-scope-pills">
          <button
            type="button"
            className={`scope-pill ${currentScope === 'all' ? 'active' : ''}`}
            onClick={() => handleScopeChange('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`scope-pill ${currentScope === 'last30' ? 'active' : ''}`}
            onClick={() => handleScopeChange('last30')}
          >
            Last 30
          </button>
          <button
            type="button"
            className={`scope-pill ${currentScope === 'thisMonth' ? 'active' : ''}`}
            onClick={() => handleScopeChange('thisMonth')}
          >
            This Month
          </button>
          <button
            type="button"
            className={`scope-pill ${currentScope === 'custom' ? 'active' : ''}`}
            onClick={() => handleScopeChange('custom')}
          >
            Custom Range
          </button>
        </div>
      </div>

      <div className="filter-controls-row">
        <label>Search
          <input
            aria-label="Search transactions"
            value={filters.search || ''}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Search category or note"
          />
        </label>
        <label>Type
          <select
            aria-label="Filter by type"
            value={filters.type || ''}
            onChange={(event) => onChange({ type: event.target.value })}
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="refund">Refund</option>
            <option value="pass_through">Pass-through</option>
            <option value="transfer">Transfer</option>
          </select>
        </label>
        <label>Category
          <input
            aria-label="Filter by category"
            value={filters.category || ''}
            onChange={(event) => onChange({ category: event.target.value })}
            placeholder="Any category"
          />
        </label>

        {currentScope === 'custom' && (
          <>
            <label>From Date
              <input
                type="date"
                aria-label="From date"
                value={filters.fromDate || ''}
                onChange={(event) => onChange({ fromDate: event.target.value })}
              />
            </label>
            <label>To Date
              <input
                type="date"
                aria-label="To date"
                value={filters.toDate || ''}
                onChange={(event) => onChange({ toDate: event.target.value })}
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
}
