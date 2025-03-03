'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import ReactConfetti from 'react-confetti';
import { metroStations, INITIAL_ZOOM, ZOOM_DECREASE, MIN_ZOOM } from '../data/stations';
import type { GameState, ViewState } from '../types/game';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
interface IconDefault extends L.Icon.Default {
  _getIconUrl?: string;
}

delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;
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
  };

  const handleGuess = (stationName: string) => {
    if (!gameState.currentStation || gameState.gameOver) return;

    const isCorrect = stationName.toLowerCase() === gameState.currentStation.name.toLowerCase();
    const newAttempts = gameState.attempts + 1;

    if (isCorrect) {
      setGameState(prev => ({ ...prev, isCorrect: true, gameOver: true }));
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } else if (newAttempts >= gameState.maxAttempts) {
      setGameState(prev => ({ ...prev, gameOver: true }));
    } else {
      const newZoomLevel = Math.max(gameState.zoomLevel - ZOOM_DECREASE, MIN_ZOOM);
      setGameState(prev => ({
        ...prev,
        attempts: newAttempts,
        zoomLevel: newZoomLevel,
      }));
      setViewState(prev => ({ ...prev, zoom: newZoomLevel }));
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {showConfetti && <ReactConfetti />}
      
      <div className="flex-1 relative">
        <MapContainer
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
        </MapContainer>
      </div>

      <div className="p-4 bg-white shadow-lg">
        <div className="flex flex-wrap gap-2 mb-4">
          {metroStations.map(station => (
            <button
              key={station.id}
              onClick={() => handleGuess(station.name)}
              disabled={gameState.gameOver}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              {station.name}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div>
            Attempts: {gameState.attempts}/{gameState.maxAttempts}
          </div>
          {gameState.gameOver && (
            <div className="flex items-center gap-4">
              <p className={gameState.isCorrect ? "text-green-500" : "text-red-500"}>
                {gameState.isCorrect 
                  ? "Congratulations! You found it!" 
                  : `The correct station was ${gameState.currentStation?.name}`}
              </p>
              <button
                onClick={startNewGame}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game; 