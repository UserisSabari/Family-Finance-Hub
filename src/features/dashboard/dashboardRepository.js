import {
  getWorkspaceBudgets,
  getWorkspaceContributions,
  getWorkspaceGoals,
  getWorkspaceTransactions,
} from '../../lib/workspaces/workspaceRepository';

export async function getDashboardRecords(workspaceId) {
  if (!workspaceId) {
    return { transactions: [], contributions: [], budgets: [], goals: [] };
  }
  const [transactions, contributions, budgets, goals] = await Promise.all([
    getWorkspaceTransactions(workspaceId),
    getWorkspaceContributions(workspaceId),
    getWorkspaceBudgets(workspaceId),
    getWorkspaceGoals(workspaceId),
  ]);
  return { transactions, contributions, budgets, goals };
}
