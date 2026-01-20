import { fetchUsers, createUser, updateUser, deleteUser } from '@/services/users';
import { UserRole } from '@/types/Role';

// Mock the api service
jest.mock('@/services/api', () => ({
  fetchEntities: jest.fn(),
  apiRequest: jest.fn()
}));

const mockFetchEntities = require('@/services/api').fetchEntities as jest.Mock;
const mockApiRequest = require('@/services/api').apiRequest as jest.Mock;

describe('Users Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUsers', () => {
    test('fetches users with correct parameters', async () => {
      const mockResponse = {
        'hydra:member': [
          {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: UserRole.USER,
            isActive: true
          }
        ],
        'hydra:totalItems': 1
      };

      mockFetchEntities.mockResolvedValue(mockResponse);

      const result = await fetchUsers();

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'users',
        page: 1,
        orderBy: 'username',
        partial: false,
        extraParams: {}
      });

      expect(result).toEqual(mockResponse);
    });

    test('fetches users with custom parameters', async () => {
      const mockResponse = {
        'hydra:member': [],
        'hydra:totalItems': 0
      };

      mockFetchEntities.mockResolvedValue(mockResponse);

      await fetchUsers({
        page: 2,
        filters: { isActive: 'true' },
        orderBy: 'email',
        partial: true
      });

      expect(mockFetchEntities).toHaveBeenCalledWith({
        entity: 'users',
        page: 2,
        orderBy: 'email',
        partial: true,
        extraParams: { isActive: 'true' }
      });
    });

    test('handles fetch users error', async () => {
      const error = new Error('Failed to fetch users');
      mockFetchEntities.mockRejectedValue(error);

      await expect(fetchUsers()).rejects.toThrow('Failed to fetch users');
    });
  });

  describe('createUser', () => {
    test('creates user with correct data', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'securepassword',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.USER,
        isActive: true
      };

      const mockResponse = {
        id: '123',
        ...userData
      };

      mockApiRequest.mockResolvedValue(mockResponse);

      const result = await createUser(userData);

      expect(mockApiRequest).toHaveBeenCalledWith('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      expect(result).toEqual(mockResponse);
    });

    test('handles create user error', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'securepassword',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.USER,
        isActive: true
      };

      const error = new Error('Failed to create user');
      mockApiRequest.mockRejectedValue(error);

      await expect(createUser(userData)).rejects.toThrow('Failed to create user');
    });

    test('validates required fields', async () => {
      const incompleteUserData = {
        username: 'testuser'
        // Missing required fields
      } as any;

      mockApiRequest.mockResolvedValue({});

      await createUser(incompleteUserData);

      expect(mockApiRequest).toHaveBeenCalledWith('/users', {
        method: 'POST',
        body: JSON.stringify(incompleteUserData)
      });
    });
  });

  describe('updateUser', () => {
    test('updates user with correct data', async () => {
      const userId = '123';
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com',
        isActive: false
      };

      const mockResponse = {
        id: userId,
        username: 'testuser',
        ...updateData,
        role: UserRole.USER
      };

      mockApiRequest.mockResolvedValue(mockResponse);

      const result = await updateUser(userId, updateData);

      expect(mockApiRequest).toHaveBeenCalledWith(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      expect(result).toEqual(mockResponse);
    });

    test('handles update user error', async () => {
      const userId = '123';
      const updateData = { firstName: 'Updated' };

      const error = new Error('Failed to update user');
      mockApiRequest.mockRejectedValue(error);

      await expect(updateUser(userId, updateData)).rejects.toThrow('Failed to update user');
    });

    test('updates user role', async () => {
      const userId = '123';
      const updateData = {
        role: UserRole.ADMIN
      };

      mockApiRequest.mockResolvedValue({ id: userId, ...updateData });

      await updateUser(userId, updateData);

      expect(mockApiRequest).toHaveBeenCalledWith(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
    });
  });

  describe('deleteUser', () => {
    test('deletes user with correct ID', async () => {
      const userId = '123';

      mockApiRequest.mockResolvedValue({});

      await deleteUser(userId);

      expect(mockApiRequest).toHaveBeenCalledWith(`/users/${userId}`, {
        method: 'DELETE'
      });
    });

    test('handles delete user error', async () => {
      const userId = '123';

      const error = new Error('Failed to delete user');
      mockApiRequest.mockRejectedValue(error);

      await expect(deleteUser(userId)).rejects.toThrow('Failed to delete user');
    });

    test('handles non-existent user deletion', async () => {
      const userId = 'non-existent';

      const error = new Error('User not found');
      mockApiRequest.mockRejectedValue(error);

      await expect(deleteUser(userId)).rejects.toThrow('User not found');
    });
  });

  describe('Error Handling', () => {
    test('handles network errors gracefully', async () => {
      const networkError = new Error('Network error');
      mockFetchEntities.mockRejectedValue(networkError);

      await expect(fetchUsers()).rejects.toThrow('Network error');
    });

    test('handles API errors with proper error messages', async () => {
      const apiError = new Error('Unauthorized');
      mockApiRequest.mockRejectedValue(apiError);

      await expect(createUser({
        username: 'test',
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.USER,
        isActive: true
      })).rejects.toThrow('Unauthorized');
    });
  });

  describe('Data Validation', () => {
    test('handles different user roles correctly', async () => {
      const roles = [UserRole.USER, UserRole.FITTER, UserRole.SUPPLIER, UserRole.ADMIN, UserRole.SUPERVISOR];

      for (const role of roles) {
        const userData = {
          username: `user_${role}`,
          email: `${role}@example.com`,
          password: 'password',
          firstName: 'Test',
          lastName: 'User',
          role,
          isActive: true
        };

        mockApiRequest.mockResolvedValue({ id: '123', ...userData });

        const result = await createUser(userData);

        expect(result.role).toBe(role);
        expect(mockApiRequest).toHaveBeenCalledWith('/users', {
          method: 'POST',
          body: JSON.stringify(userData)
        });
      }
    });

    test('handles user activation status changes', async () => {
      const userId = '123';
      
      // Test activating user
      mockApiRequest.mockResolvedValue({ id: userId, isActive: true });
      await updateUser(userId, { isActive: true });
      
      expect(mockApiRequest).toHaveBeenCalledWith(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: true })
      });

      // Test deactivating user
      mockApiRequest.mockResolvedValue({ id: userId, isActive: false });
      await updateUser(userId, { isActive: false });
      
      expect(mockApiRequest).toHaveBeenCalledWith(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: false })
      });
    });
  });
});