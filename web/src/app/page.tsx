'use client';
import { useState } from 'react';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [status, setStatus] = useState<'idle' | 'booting' | 'warm'>('idle');

  const wakeUp = async () => {
    setStatus('booting');
    await fetch(process.env.NEXT_PUBLIC_WAKE_UP_URL!);
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
        if (res.ok) {
          setStatus('warm');
          clearInterval(interval);
        }
      } catch (e) {}
    }, 3000);
  };

  if (status === 'warm') return <Dashboard />;

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">System Status: {status}</h1>
        {status === 'idle' ? (
          <button onClick={wakeUp} className="bg-white px-6 py-2 text-black rounded">Wake Up Phantom</button>
        ) : (
          <div className="animate-pulse text-zinc-500">Lazy-loading SOCI index... (15s)</div>
        )}
      </div>
    </div>
  );
}