import { useState, useEffect } from 'react';
import ajax from './ajax';

export default function useRequest<T>(url, method: 'get' | 'post') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = async (options): Promise<T | null> => {
    let result = (null as unknown) as T;
    try {
      setLoading(true);
      result = await ajax[method](url, options);
      setLoading(false);
      return result;
    } catch (reason) {
      setError(true);
    } finally {
      setLoading(false);
    }
    return result;
  };

  return {
    loading,
    fetchData,
    error
  };
}

function useFetch<T>(url, method: 'get' | 'post', params) {
  const [result, updateResult] = useState<T | null>(null);

  const { loading, fetchData, error } = useRequest<T>(url, method);

  useEffect(() => {
    fetchData(params).then((data) => {
      return updateResult(data);
    });
  }, []);

  return {
    fetchData,
    loading,
    result,
    error,
    updateResult
  };
}

export { useFetch, useRequest };
