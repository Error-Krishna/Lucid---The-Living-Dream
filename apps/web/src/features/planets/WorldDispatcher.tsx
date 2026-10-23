import React from 'react';
import { PlanetId } from '@lucid/shared';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { OriginWorld } from './OriginWorld.js';
import { CandyverseWorld } from './CandyverseWorld.js';
import { PixelWorld } from './PixelWorld.js';
import { NaturePrimeWorld } from './NaturePrimeWorld.js';
import { GlassiaWorld } from './GlassiaWorld.js';
import { AbyssWorld } from './AbyssWorld.js';

interface WorldDispatcherProps {
  activePlanet: PlanetId;
  playerPosition: [number, number, number];
}

export function WorldDispatcher({ activePlanet, playerPosition }: WorldDispatcherProps) {
  const isNearRocket = useUniverseStore((s) => s.isNearRocket);

  switch (activePlanet) {
    case 'candyverse':
      return (
        <CandyverseWorld
          playerPosition={playerPosition}
          isNearRocket={isNearRocket}
        />
      );
    case 'pixel':
      return (
        <PixelWorld
          playerPosition={playerPosition}
          isNearRocket={isNearRocket}
        />
      );
    case 'nature':
      return (
        <NaturePrimeWorld
          playerPosition={playerPosition}
          isNearRocket={isNearRocket}
        />
      );
    case 'glassia':
      return (
        <GlassiaWorld
          playerPosition={playerPosition}
          isNearRocket={isNearRocket}
        />
      );
    case 'abyss':
      return (
        <AbyssWorld
          playerPosition={playerPosition}
          isNearRocket={isNearRocket}
        />
      );
    case 'zephyr':
    case 'ignis':
    case 'astraea':
    case 'chronos':
    case 'origin':
    default:
      return (
        <OriginWorld
          planetId={activePlanet}
          playerPosition={playerPosition}
          isNearRocket={isNearRocket}
        />
      );
  }
}
