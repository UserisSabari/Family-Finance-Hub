import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import {
  register,
  resetPassword,
  signIn,
  signInWithGoogle,
  signOutUser,
  subscribeToAuthState,
} from '../../lib/auth/authRepository';

const AuthContext = createContext({ user: null, loading: true, error: null });

export function AuthProvider({ children, value }) {
  const [state, setState] = useState({ user: null, loading: true, error: null });

  useEffect(() => {
    if (value) return undefined;
    return subscribeToAuthState(
      (user) => setState({ user, loading: false, error: null }),
      (error) => setState({ user: null, loading: false, error }),
    );
  }, [value]);

  const authValue = useMemo(() => {
    if (value) return value;
    return {
      ...state,
      signIn,
      register,
      signInWithGoogle,
      resetPassword,
      signOut: signOutUser,
    };
  }, [state, value]);

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
