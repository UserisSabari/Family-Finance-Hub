import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReportsPage } from './ReportsPage';

const mocks = vi.hoisted(() => ({
  listReportTransactions: vi.fn(),
  workspaceState: {
    workspace: { id: 'workspace-1' },
    loading: false,
    error: null,
  },
}));

vi.mock('../../hooks/useWorkspace', () => ({
  useWorkspace: () => mocks.workspaceState,
}));

vi.mock('./reportRepository', () => ({
  listReportTransactions: mocks.listReportTransactions,
}));

const mockTransactions = [
  {
    id: 'tx-1',
    type: 'expense',
    amount: 1500,
    category: 'Food',
    account: 'bank',
    date: '2026-11-05',
    note: 'Groceries',
  },
  {
    id: 'tx-2',
    type: 'expense',
    amount: 500,
    category: 'Travel',
    account: 'cash',
    date: '2026-11-10',
    note: 'Auto rickshaw',
  },
];

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading, error, and empty states', async () => {
    mocks.listReportTransactions.mockReturnValue(new Promise(() => {}));
    render(<ReportsPage />);
    expect(screen.getByRole('status')).toHaveTextContent(/loading reports/i);

    mocks.listReportTransactions.mockResolvedValue([]);
    render(<ReportsPage />);
    expect(await screen.findByText(/no transaction data yet/i)).toBeInTheDocument();
  });

  it('renders metrics, spend distribution, category breakdown, and payment modes', async () => {
    mocks.listReportTransactions.mockResolvedValue(mockTransactions);
    render(<ReportsPage />);

    // Metric cards
    const totalOutflowElements = await screen.findAllByText(/total outflow/i);
    expect(totalOutflowElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Daily Average')).toBeInTheDocument();
    expect(screen.getByText('Top Category')).toBeInTheDocument();

    // Spend distribution & Category breakdown
    expect(screen.getByRole('heading', { name: /spend distribution/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/spending by category/i)).toBeInTheDocument();
    expect(screen.getAllByText('Food').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Travel').length).toBeGreaterThanOrEqual(1);

    // Payment mode breakdown
    expect(screen.getByRole('heading', { name: /payment mode/i })).toBeInTheDocument();
    expect(screen.getByText(/bank \/ upi \/ card/i)).toBeInTheDocument();
    expect(screen.getByText(/liquid cash in hand/i)).toBeInTheDocument();

    // Period switcher
    const monthBtn = screen.getByRole('button', { name: /this month/i });
    fireEvent.click(monthBtn);
    expect(monthBtn).toHaveClass('active');
  });
});
