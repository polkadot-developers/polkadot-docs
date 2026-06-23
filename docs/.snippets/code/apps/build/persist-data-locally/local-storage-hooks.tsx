'use client';

import {
  useLocalStorage,
  useLocalStorageString,
} from '@parity/product-sdk/react';

interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
}

function StorageDemo() {
  const [network, setNetwork, { loading: networkLoading }] =
    useLocalStorageString('network');

  const [
    preferences,
    setPreferences,
    { loading: prefsLoading, error: prefsError },
  ] = useLocalStorage<UserPreferences>('preferences');

  return (
    <div>
      <p>Network: {networkLoading ? 'loading…' : (network ?? 'not set')}</p>
      <button onClick={() => setNetwork('paseo')}>Set network</button>

      <p>
        Theme: {prefsLoading ? 'loading…' : (preferences?.theme ?? 'not set')}
      </p>
      <button onClick={() => setPreferences({ theme: 'dark', language: 'en' })}>
        Set preferences
      </button>

      {prefsError && <p>Error: {prefsError.message}</p>}
    </div>
  );
}
