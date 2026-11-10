import { getWorkspaceTransactions } from '../../lib/workspaces/workspaceRepository';

export async function listReportTransactions(workspaceId) {
  return getWorkspaceTransactions(workspaceId);
}
