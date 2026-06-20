"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchEntityTypes, login, register, getToken, setToken, EntityType } from './api';

export default function Home() {
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [username, setUsername] = useState('tenant1');
  const [password, setPassword] = useState('password123');

  const loadEntityTypes = async () => {
    try {
      const types = await fetchEntityTypes();
      setEntityTypes(types);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        setIsLoggedIn(false);
      } else {
        setError("Failed to fetch entity types. Is the backend running?");
      }
    }
  };

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      if (getToken()) {
        setTimeout(() => setIsLoggedIn(true), 0);
        await loadEntityTypes();
      }
    };
    checkAuthAndLoad();
  }, []);

  const handleLogin = async () => {
    try {
      await login(username, password);
      setIsLoggedIn(true);
      loadEntityTypes();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  };

  const handleRegister = async () => {
    try {
      await register(username, password);
      await handleLogin();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  };

  const handleLogout = () => {
    setToken('');
    setIsLoggedIn(false);
    setEntityTypes([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="p-8 font-[family-name:var(--font-geist-sans)] max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Metadata Platform Login</h1>
        {error && <div className="mb-4 p-4 bg-red-50 text-red-800 rounded">{error}</div>}
        <div className="space-y-4 bg-white p-6 rounded shadow border">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tenant Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div className="flex gap-4">
            <button onClick={handleLogin} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Login</button>
            <button onClick={handleRegister} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Register</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Metadata Platform</h1>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:underline">Logout</button>
        </div>

        <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">Available Entity Types:</p>
            <Link href="/entity/create" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                + Create Entity Type
            </Link>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 text-red-800 rounded">{error}</div>}

        {entityTypes.length === 0 && !error ? (
          <div className="p-4 bg-yellow-50 text-yellow-800 rounded">
            No Entity Types found. Please create an Entity Type.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entityTypes.map((et: EntityType) => (
              <Link
                key={et.id}
                href={`/entity/${et.id}`}
                className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition-colors"
              >
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{et.name}</h5>
                <p className="font-normal text-gray-700">{et.description || 'No description provided.'}</p>
                <div className="mt-4 text-sm text-blue-600">View Records &rarr;</div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
