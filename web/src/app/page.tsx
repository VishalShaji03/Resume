'use client';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  // In unified container mode, the backend is always available on same origin
  // No wake-up polling needed - just render the dashboard directly
  return <Dashboard apiUrl="" />;
}