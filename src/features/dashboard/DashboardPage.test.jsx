import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DashboardPage } from './DashboardPage';

const workspaceState = { workspace: { id: 'personal-user-1' }, loading: false, error: null };
vi.mock('../../hooks/useWorkspace', () => ({ useWorkspace: () => workspaceState }));
vi.mock('./dashboardRepository', () => ({
  getDashboardRecords: vi.fn(),
}));

import { getDashboardRecords } from './dashboardRepository';

describe('DashboardPage', () => {
  it('renders an empty state when the workspace has no source records', async () => {
    getDashboardRecords.mockResolvedValueOnce({ transactions: [], contributions: [], budgets: [], goals: [] });

    render(<DashboardPage />);

    expect(await screen.findByText(/no activity yet/i)).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Income' })).toHaveTextContent('₹0.00');
  });

  it('renders INR summary metrics from source records', async () => {
    getDashboardRecords.mockResolvedValueOnce({
      transactions: [
        { id: 'income-1', type: 'income', amount: 50000, date: '2026-11-02', note: 'Salary' },
        { id: 'expense-1', type: 'expense', amount: 12500, date: '2026-11-03', note: 'Rent' },
      ],
      contributions: [{ id: 'saving-1', amount: 5000, date: '2026-11-04', note: 'Emergency fund' }],
      budgets: [{ id: 'budget-1', name: 'Monthly essentials', amount: 20000, spent: 12500 }],
      goals: [{ id: 'goal-1', name: 'Emergency fund', target: 10000, current: 5000 }],
    });

    render(<DashboardPage />);

    expect(await screen.findByRole('article', { name: 'Income' })).toHaveTextContent('₹50,000.00');
    expect(screen.getByRole('article', { name: 'Expenses' })).toHaveTextContent('₹12,500.00');
    expect(screen.getByText(/Salary/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /emergency fund/i })).toHaveAttribute('aria-valuenow', '50');
  });

  it('renders a read error instead of success-shaped content', async () => {
    getDashboardRecords.mockRejectedValueOnce(new Error('offline'));

    render(<DashboardPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load your overview/i);
  });
});
