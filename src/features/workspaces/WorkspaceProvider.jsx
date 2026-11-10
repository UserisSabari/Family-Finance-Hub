import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { useAuth } from '../auth/AuthProvider';
import { getUserProfile } from '../../lib/users/userRepository';
import * as workspaceRepository from '../../lib/workspaces/workspaceRepository';

const WorkspaceContext = createContext({
  profile: null,
  workspace: null,
  loading: true,
  error: null,
  workspaces: [],
  selectWorkspace: () => {},
});

export function WorkspaceProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState({
    profile: null,
    workspace: null,
    loading: true,
    error: null,
    workspaces: [],
  });

  const refresh = useCallback(async () => {
    if (!user?.uid) return;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const [profile, personal, available] = await Promise.all([
        getUserProfile(user.uid).catch((err) => {
          console.warn('Could not load profile:', err);
          return null;
        }),
        workspaceRepository.ensurePersonalWorkspace(user.uid),
        workspaceRepository.listUserWorkspaces(user.uid).catch((err) => {
          console.warn('Could not list family workspaces:', err);
          return [];
        }),
      ]);
      const availableList = Array.isArray(available) ? available : [];
      const all = availableList.some((item) => item.id === personal.id)
        ? availableList
        : [personal, ...availableList];
      const stored = localStorage.getItem('ffh-workspace');
      const workspace =
        all.find((item) => item.id === stored) ||
        all.find((item) => item.kind === 'personal') ||
        all[0] ||
        personal;
      setState({ profile, workspace, workspaces: all, loading: false, error: null });
    } catch (error) {
      console.error('WorkspaceProvider error:', error);
      setState({ profile: null, workspace: null, workspaces: [], loading: false, error });
    }
  }, [user?.uid]);

  useEffect(() => {
    let active = true;
    if (authLoading) return () => { active = false; };
    if (!user) {
      setState({ profile: null, workspace: null, loading: false, error: null });
      return () => { active = false; };
    }

    refresh();

    return () => { active = false; };
  }, [authLoading, user?.uid, refresh]);

  const selectWorkspace = (workspaceId) => {
    const workspace = state.workspaces.find((item) => item.id === workspaceId);
    if (!workspace) return;
    localStorage.setItem('ffh-workspace', workspaceId);
    setState((current) => ({ ...current, workspace }));
  };

  return <WorkspaceContext.Provider value={{ ...state, selectWorkspace, refresh }}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
