import { useState, useCallback } from 'react';
import * as storage from '../../utils/storage';

// Define types for API request options
interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
}

// Define types for API response
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  fetchData: (url: string, options?: ApiOptions) => Promise<T | null>;
}

/**
 * Custom hook for making API requests
 * @template T The expected response data type
 * @returns {ApiResponse<T>} Object containing data, error, loading state and fetch function
 */
function useApi<T>(): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // We don't need to use the user object from auth context here
  // const { user } = useAuth();

  // The fetchData function that will be returned by the hook
  const fetchData = useCallback(
    async (url: string, options: ApiOptions = {}): Promise<T | null> => {
      // Destructure options with defaults
      const {
        method = 'GET',
        headers = {},
        body,
        requiresAuth = false,
      } = options;

      // Reset state before making a new request
      setIsLoading(true);
      setError(null);

      try {
        // Add authorization header if required
        const authHeaders: Record<string, string> = {};
        if (requiresAuth) {
          const token = storage.getItem<string>('auth_token');
          if (!token) {
            throw new Error('Authentication required but no token found');
          }
          authHeaders.Authorization = `Bearer ${token}`;
        }

        // Prepare request options
        const requestOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
            ...authHeaders,
          },
        };

        // Add body if provided
        if (body) {
          requestOptions.body = JSON.stringify(body);
        }

        // Make the request
        const response = await fetch(url, requestOptions);

        // Check if response is ok
        if (!response.ok) {
          // Try to get error message from response
          let errorMessage: string;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`;
          } catch (e) {
            errorMessage = `Error: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        // Parse response data
        const responseData: T = await response.json();
        setData(responseData);
        return responseData;
      } catch (err) {
        // Handle errors
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [] // No dependencies needed as we don't use any external values in the callback
  );

  return { data, error, isLoading, fetchData };
}

export default useApi;
