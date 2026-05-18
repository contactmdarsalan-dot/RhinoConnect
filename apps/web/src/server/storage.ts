import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ServiceMedia } from '@/lib/types';
import { createSeedDatabase, type AppDatabase } from './seed';

const dataDir = process.env.RPC_DATA_DIR ?? path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'rhinopeak-connect.json');

let cachedDb: AppDatabase | null = null;
let writeQueue: Promise<void> = Promise.resolve();

const demoServiceGalleries: Record<string, ServiceMedia[]> = {
  svc_deluxe_room: [
    {
      id: 'media_deluxe_room_1',
      type: 'image',
      title: 'Mountain view room',
      url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      description: 'A quiet room base for travelers arriving in Kathmandu before heading into the hills.',
    },
    {
      id: 'media_deluxe_room_2',
      type: 'image',
      title: 'Morning valley light',
      url: 'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&w=1200&q=80',
      description: 'Showcase the atmosphere guests can expect around the lodge.',
    },
  ],
  svc_family_suite: [
    {
      id: 'media_family_suite_1',
      type: 'image',
      title: 'Family stay setup',
      url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      description: 'Comfortable private stay for families and small groups.',
    },
  ],
  svc_abc_trek: [
    {
      id: 'media_abc_trek_1',
      type: 'image',
      title: 'Annapurna trail',
      url: 'https://images.unsplash.com/photo-1605649461784-ddd8a0fd7a3b?auto=format&fit=crop&w=1200&q=80',
      description: 'Trail view for guests comparing trekking routes.',
    },
    {
      id: 'media_abc_trek_video',
      type: 'video',
      title: 'Route preview',
      url: 'https://www.youtube.com/embed/ysz5S6PUM-U',
      description: 'Short trip preview video for customer research.',
    },
  ],
  svc_ebc_trek: [
    {
      id: 'media_ebc_trek_1',
      type: 'image',
      title: 'Everest approach',
      url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
      description: 'A high-altitude visual for expedition-style bookings.',
    },
    {
      id: 'media_ebc_trek_video',
      type: 'video',
      title: 'Trek briefing',
      url: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
      description: 'Video slot for guide briefings, route explainers, or customer testimonials.',
    },
  ],
  svc_wellness_retreat: [
    {
      id: 'media_wellness_retreat_1',
      type: 'image',
      title: 'Retreat practice space',
      url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
      description: 'A calm wellness visual for guests choosing retreat packages.',
    },
  ],
  svc_sunrise_tour: [
    {
      id: 'media_sunrise_tour_1',
      type: 'image',
      title: 'Sunrise viewpoint',
      url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      description: 'Show the kind of early morning view customers are booking.',
    },
  ],
};

function normalizeDb(db: AppDatabase): AppDatabase {
  const shouldBackfillGallery = (db.version ?? 1) < 3;
  return {
    ...db,
    version: Math.max(db.version ?? 1, 3),
    services: db.services.map((service) => ({
      ...service,
      gallery:
        shouldBackfillGallery && (!service.gallery || service.gallery.length === 0)
          ? demoServiceGalleries[service.id] ?? []
          : service.gallery ?? [],
    })),
  };
}

function cloneDb(db: AppDatabase): AppDatabase {
  return structuredClone(db);
}

async function persistDb(db: AppDatabase) {
  await fs.mkdir(dataDir, { recursive: true });
  const tmpFile = `${dataFile}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmpFile, JSON.stringify(db, null, 2), 'utf8');
  await fs.rename(tmpFile, dataFile);
}

async function loadDb(): Promise<AppDatabase> {
  if (cachedDb) return cachedDb;

  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    cachedDb = normalizeDb(JSON.parse(raw) as AppDatabase);
    return cachedDb;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') throw error;

    cachedDb = normalizeDb(createSeedDatabase());
    await persistDb(cachedDb);
    return cachedDb;
  }
}

export async function readDb(): Promise<AppDatabase> {
  return cloneDb(await loadDb());
}

export async function writeDb<T>(mutator: (db: AppDatabase) => Promise<T> | T): Promise<T> {
  const run = writeQueue.then(async () => {
    const nextDb = cloneDb(await loadDb());
    const result = await mutator(nextDb);
    nextDb.updatedAt = new Date().toISOString();
    cachedDb = nextDb;
    await persistDb(nextDb);
    return result;
  });

  writeQueue = run.then(
    () => undefined,
    () => undefined
  );

  return run;
}

export function getDataFilePath() {
  return dataFile;
}
