import { User, CreateUserInput, UpdateUserInput } from '@/types/user';
import { BASE_API_URL } from '@/config/api';

export const userService = {
  createUser: async (userData: CreateUserInput): Promise<User> => {
    const response = await fetch(`${BASE_API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }

    const data = await response.json();
    return data.data;
  },

  updateUser: async (userData: UpdateUserInput): Promise<User> => {
    const response = await fetch(`${BASE_API_URL}/users/${userData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }

    const data = await response.json();
    return data.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    const response = await fetch(`${BASE_API_URL}/users/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }
  },

  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${BASE_API_URL}/users`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }

    const data = await response.json();
    return data.data;
  }
}; 