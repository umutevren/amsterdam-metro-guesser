import { MetroStation } from '../types/game';

export const metroStations: MetroStation[] = [
  {
    id: '1',
    name: 'Amsterdam Centraal',
    coordinates: [4.900272, 52.379189],
  },
  {
    id: '2',
    name: 'Weesperplein',
    coordinates: [4.907678, 52.362907],
  },
  {
    id: '3',
    name: 'Amsterdam Zuid',
    coordinates: [4.871722, 52.338958],
  },
  {
    id: '4',
    name: 'Amsterdam Bijlmer ArenA',
    coordinates: [4.947221, 52.312222],
  },
  {
    id: '5',
    name: 'Amsterdam Amstel',
    coordinates: [4.917778, 52.346944],
  },
  {
    id: '6',
    name: 'Waterlooplein',
    coordinates: [4.903333, 52.367778],
  },
  {
    id: '7',
    name: 'Nieuwmarkt',
    coordinates: [4.900278, 52.371944],
  },
  {
    id: '8',
    name: 'Van der Madeweg',
    coordinates: [4.933889, 52.326944],
  },
];

export const INITIAL_ZOOM = 16;
export const ZOOM_DECREASE = 1;
export const MIN_ZOOM = 13; 