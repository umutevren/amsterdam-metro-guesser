export interface MetroStation {
  id: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GameState {
  currentStation: MetroStation | null;
  attempts: number;
  maxAttempts: number;
  isCorrect: boolean;
  gameOver: boolean;
  zoomLevel: number;
}

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
} 