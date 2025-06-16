interface User {
  id: string;
  username: string;
  displayName: string;
  role: string;
  pageAccessRole: string;
}

export const login = async (username: string, password: string) => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    // First try to parse the response
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error('Server returned an invalid response');
    }

    // Check if the response was not ok
    if (!response.ok) {
      throw new Error(data?.message || 'Login failed');
    }

    // Validate the response format
    if (!data.success || !data.data) {
      throw new Error('Invalid response format');
    }

    // Store auth data
    localStorage.setItem('auth_token', Math.random().toString(36).slice(2));
    localStorage.setItem('user', JSON.stringify(data.data));
    
    return data.data as User;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
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