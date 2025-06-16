interface User {
  id: string;
  username: string;
  displayName: string;
  role: string;
  pageAccessRole: string;
}

export const login = async (username: string, password: string) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  if (data.success && data.data) {
    localStorage.setItem('auth_token', Math.random().toString(36).slice(2));
    localStorage.setItem('user', JSON.stringify(data.data));
    return data.data as User;
  }

  throw new Error('Invalid response format');
};

export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token') && !!getUser();
}; 