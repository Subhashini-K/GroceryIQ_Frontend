import { useState, useEffect, useCallback } from 'react';

export function useFetch(serviceFn, params) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const stringifiedParams = JSON.stringify(params);

  const executeFetch = useCallback(async (overrideParams) => {
    setLoading(true);
    setError(null);
    try {
      const finalParams = overrideParams !== undefined ? overrideParams : params;
      const result = await serviceFn(finalParams);
      setData(result.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceFn, stringifiedParams]);

  useEffect(() => {
    executeFetch();
  }, [executeFetch]);

  return { data, loading, error, refetch: executeFetch };
}
