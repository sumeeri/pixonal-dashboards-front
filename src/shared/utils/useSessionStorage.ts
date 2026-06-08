import { useEffect, useState } from 'react';

function getSessionStorageOrDefault<T>(key: string, defaultValue: T): T {
  const stored = sessionStorage.getItem(key);
  if (!stored) {
    return defaultValue;
  }
  return JSON.parse(stored) as T;
}

// https://typeofnan.dev/using-session-storage-in-react-with-hooks/
export function useSessionStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(getSessionStorageOrDefault(key, defaultValue));

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
