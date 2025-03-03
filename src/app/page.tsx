'use client';

import dynamic from 'next/dynamic';
import LoadingScreen from '../components/LoadingScreen';

const Game = dynamic(() => import('../components/Game'), {
  loading: () => <LoadingScreen />,
  ssr: false,
});

export default function Home() {
  return (
    <main>
      <Game />
    </main>
  );
}
