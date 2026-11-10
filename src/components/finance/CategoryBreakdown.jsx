import { formatInr } from '../../lib/format/currency';

export function CategoryBreakdown({ items = [] }) {
  if (!items.length) return <p className="muted">No category data for this period.</p>;
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return <div className="category-breakdown" aria-label="Spending by category">
    {items.map((item) => <div className="breakdown-row" key={item.category}>
      <div className="breakdown-label"><span>{item.category}</span><strong>{formatInr(item.amount)}</strong></div>
      <div className="breakdown-track"><span style={{ width: `${total ? (item.amount / total) * 100 : 0}%` }} /></div>
    </div>)}
  </div>;
}
