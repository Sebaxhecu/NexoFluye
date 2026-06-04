import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, loginUser, registerUser, logoutUser, User } from '../lib/storage';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await loginUser(email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const u = await registerUser(email, password, name);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  return { user, loading, login, register, logout };
}
