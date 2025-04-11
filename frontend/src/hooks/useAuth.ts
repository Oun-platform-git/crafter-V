import { useState, useEffect } from 'react';

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

interface User {
  id: string;
  username: string;
  roles?: UserRole[];
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated user data
    setUser({
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      username: 'Demo User',
      roles: [{
        id: 'role_mod',
        name: 'moderator',
        permissions: ['moderate_chat']
      }]
    });
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user
  };
};
