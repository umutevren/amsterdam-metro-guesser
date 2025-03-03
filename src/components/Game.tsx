'use client';

import { useState, useEffect, FormEvent } from 'react';
import { TileLayer, Marker, useMap } from 'react-leaflet';
import dynamic from 'next/dynamic';
import { metroStations, INITIAL_ZOOM, ZOOM_DECREASE, MIN_ZOOM } from '../data/stations';
import type { GameState, ViewState } from '../types/game';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Dynamically import ReactConfetti with SSR disabled
const ReactConfetti = dynamic(() => import('react-confetti'), {
  ssr: false,
});

// Fix for default marker icons
interface IconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}

const iconDefault = L.Icon.Default.prototype as IconDefault;
delete iconDefault._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'marker-icon-2x.png',
  iconUrl: 'marker-icon.png',
  shadowUrl: 'marker-shadow.png',
});

// Custom marker icon
const icon = L.divIcon({
  className: 'w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg',
  iconSize: [24, 24],
});

// Also make the Map component client-side only
const Map = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), {
  ssr: false,
});

// Component to handle map view updates
const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
};

const Game = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentStation: null,
    attempts: 0,
    maxAttempts: 3,
    isCorrect: false,
    gameOver: false,
    zoomLevel: INITIAL_ZOOM,
  });

  const [viewState, setViewState] = useState<ViewState>({
    longitude: 4.9,
    latitude: 52.37,
    zoom: INITIAL_ZOOM,
  });

  const [showConfetti, setShowConfetti] = useState(false);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const randomStation = metroStations[Math.floor(Math.random() * metroStations.length)];
    setGameState({
      currentStation: randomStation,
      attempts: 0,
      maxAttempts: 3,
      isCorrect: false,
      gameOver: false,
      zoomLevel: INITIAL_ZOOM,
    });
    setViewState({
      longitude: randomStation.coordinates[0],
      latitude: randomStation.coordinates[1],
      zoom: INITIAL_ZOOM,
    });
    setShowConfetti(false);
    setGuess('');
    setFeedback('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!gameState.currentStation || gameState.gameOver) return;

    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedAnswer = gameState.currentStation.name.toLowerCase();
    const isCorrect = normalizedGuess === normalizedAnswer;
    const newAttempts = gameState.attempts + 1;

    if (isCorrect) {
      setGameState(prev => ({ ...prev, isCorrect: true, gameOver: true }));
      setShowConfetti(true);
      setFeedback('🎉 Correct! Well done!');
      setTimeout(() => setShowConfetti(false), 5000);
    } else if (newAttempts >= gameState.maxAttempts) {
      setGameState(prev => ({ ...prev, gameOver: true }));
      setFeedback(`❌ Game Over! The correct answer was ${gameState.currentStation.name}`);
    } else {
      const newZoomLevel = Math.max(gameState.zoomLevel - ZOOM_DECREASE, MIN_ZOOM);
      setGameState(prev => ({
        ...prev,
        attempts: newAttempts,
        zoomLevel: newZoomLevel,
      }));
      setViewState(prev => ({ ...prev, zoom: newZoomLevel }));
      setFeedback(`❌ Wrong guess! ${gameState.maxAttempts - newAttempts} attempts remaining`);
    }
    setGuess('');
  };

  return (
    <div className="h-screen flex flex-col">
      {showConfetti && <ReactConfetti />}
      
      <div className="flex-1 relative">
        <Map
          key={`${viewState.latitude}-${viewState.longitude}-${viewState.zoom}`}
          center={[viewState.latitude, viewState.longitude] as [number, number]}
          zoom={viewState.zoom}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          dragging={false}
          touchZoom={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapController 
            center={[viewState.latitude, viewState.longitude] as [number, number]}
            zoom={viewState.zoom}
          />
          {gameState.currentStation && (
            <Marker
              position={[
                gameState.currentStation.coordinates[1],
                gameState.currentStation.coordinates[0]
              ] as [number, number]}
              icon={icon}
            />
          )}
        </Map>
      </div>

      <div className="p-4 bg-white shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter station name..."
              disabled={gameState.gameOver}
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={gameState.gameOver || !guess.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
            >
              Guess
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Attempts: {gameState.attempts}/{gameState.maxAttempts}
              </span>
              {feedback && (
                <span className={gameState.isCorrect ? "text-green-500" : "text-red-500"}>
                  {feedback}
                </span>
              )}
            </div>
            {gameState.gameOver && (
              <button
                onClick={startNewGame}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Play Again
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Game; 