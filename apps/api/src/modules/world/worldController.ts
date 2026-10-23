import { Request, Response } from 'express';
import { PlanetId, PLANET_CATALOG } from '@lucid/shared';
import { worldStore } from '../../storage/worldStore.js';

export const getWorlds = (_req: Request, res: Response) => {
  return res.json({
    worlds: Object.values(PLANET_CATALOG),
  });
};

export const getWorld = (req: Request, res: Response) => {
  const worldId = req.params.worldId as PlanetId;
  const world = PLANET_CATALOG[worldId];
  if (!world) {
    return res.status(404).json({ error: `World '${worldId}' not found` });
  }

  const objects = worldStore.getObjects(worldId);
  const environment = worldStore.getEnvironment(worldId);

  return res.json({
    world,
    objects,
    environment,
  });
};

export const getWorldObjects = (req: Request, res: Response) => {
  const worldId = req.params.worldId as PlanetId;
  if (!PLANET_CATALOG[worldId]) {
    return res.status(404).json({ error: `World '${worldId}' not found` });
  }

  const objects = worldStore.getObjects(worldId);
  return res.json({ objects });
};

export const createWorldObject = (req: Request, res: Response) => {
  const worldId = req.params.worldId as PlanetId;
  if (!PLANET_CATALOG[worldId]) {
    return res.status(404).json({ error: `World '${worldId}' not found` });
  }

  const { type, transform, appearance, permissions, creatorId, creatorName } = req.body;

  if (!type || !transform || !transform.position) {
    return res.status(400).json({ error: 'Missing required object parameters (type, transform.position)' });
  }

  try {
    const newObject = worldStore.createObject(worldId, {
      locationId: worldId,
      creatorId: creatorId || 'dreamer-anon',
      creatorName: creatorName || 'Wandering Dreamer',
      type,
      transform,
      appearance: appearance || { color: '#ffffff' },
      permissions: permissions || 'public',
    });

    return res.status(201).json({ object: newObject });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const updateWorldObject = (req: Request, res: Response) => {
  const worldId = req.params.worldId as PlanetId;
  const objectId = req.params.objectId;

  if (!PLANET_CATALOG[worldId]) {
    return res.status(404).json({ error: `World '${worldId}' not found` });
  }

  try {
    const updated = worldStore.updateObject(worldId, objectId, req.body);
    return res.json({ object: updated });
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
};

export const deleteWorldObject = (req: Request, res: Response) => {
  const worldId = req.params.worldId as PlanetId;
  const objectId = req.params.objectId;

  if (!PLANET_CATALOG[worldId]) {
    return res.status(404).json({ error: `World '${worldId}' not found` });
  }

  const success = worldStore.deleteObject(worldId, objectId);
  if (!success) {
    return res.status(404).json({ error: `Object '${objectId}' not found` });
  }

  return res.json({ success: true, objectId });
};
