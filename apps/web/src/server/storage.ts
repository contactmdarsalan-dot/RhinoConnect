import { randomUUID } from 'node:crypto';
import { MongoClient, type Db } from 'mongodb';
import type { ServiceMedia } from '@/lib/types';
import { createSeedDatabase, type AppDatabase } from './seed';

const mongoUri =
  process.env.RPC_MONGODB_URI ?? process.env.MONGODB_URI ?? process.env.MONGO_URL ?? 'mongodb://127.0.0.1:27017';
const mongoDbName = process.env.RPC_MONGODB_DB ?? process.env.MONGODB_DB ?? databaseNameFromUri(mongoUri);
const storageLockId = 'rhinoconnect-web-storage';
const lockTtlMs = 30_000;

let mongoClient: MongoClient | null = null;
let mongoClientPromise: Promise<MongoClient> | null = null;
let indexesReady: Promise<void> | null = null;
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

type CollectionName =
  | 'rpc_services'
  | 'rpc_availability_blocks'
  | 'rpc_customers'
  | 'rpc_bookings'
  | 'rpc_payments'
  | 'rpc_notifications'
  | 'rpc_automations';
type DbRecord = { id: string };

type StoredRecord<T extends DbRecord> = {
  _id: string;
  data: T;
  createdAt: Date;
  updatedAt: Date;
};

type MetaDocument = {
  _id: string;
  data: unknown;
  updatedAt: Date;
};

type LockDocument = {
  _id: string;
  owner: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

function databaseNameFromUri(uri: string) {
  try {
    const parsed = new URL(uri);
    const pathName = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
    return pathName || 'rhinoconnect';
  } catch {
    return 'rhinoconnect';
  }
}

function storageDb(client: MongoClient) {
  return client.db(mongoDbName);
}

async function getMongoClient() {
  if (mongoClient) return mongoClient;

  mongoClientPromise ??= MongoClient.connect(mongoUri, {
    maxPoolSize: Number(process.env.RPC_MONGODB_POOL_SIZE ?? 10),
    minPoolSize: Number(process.env.RPC_MONGODB_MIN_POOL_SIZE ?? 0),
    serverSelectionTimeoutMS: 8_000,
  });

  mongoClient = await mongoClientPromise;
  return mongoClient;
}

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

function metaCollection(db: Db) {
  return db.collection<MetaDocument>('rpc_meta');
}

function lockCollection(db: Db) {
  return db.collection<LockDocument>('rpc_locks');
}

function recordsCollection<T extends DbRecord>(db: Db, collection: CollectionName) {
  return db.collection<StoredRecord<T>>(collection);
}

async function ensureIndexes() {
  indexesReady ??= (async () => {
    const db = storageDb(await getMongoClient());

    await metaCollection(db).createIndex({ updatedAt: -1 });
    await lockCollection(db).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 60 });

    await recordsCollection(db, 'rpc_services').createIndexes([
      { key: { 'data.active': 1 }, name: 'rpc_services_active_idx' },
      { key: { 'data.type': 1 }, name: 'rpc_services_type_idx' },
      { key: { 'data.name': 1 }, name: 'rpc_services_name_idx' },
    ]);
    await recordsCollection(db, 'rpc_bookings').createIndexes([
      { key: { 'data.bookingRef': 1 }, name: 'rpc_bookings_ref_idx' },
      { key: { 'data.customerId': 1 }, name: 'rpc_bookings_customer_id_idx' },
      { key: { 'data.serviceId': 1 }, name: 'rpc_bookings_service_id_idx' },
      { key: { 'data.checkIn': 1 }, name: 'rpc_bookings_check_in_idx' },
      { key: { 'data.checkOut': 1 }, name: 'rpc_bookings_check_out_idx' },
      { key: { 'data.status': 1 }, name: 'rpc_bookings_status_idx' },
      { key: { 'data.paymentStatus': 1 }, name: 'rpc_bookings_payment_status_idx' },
      { key: { 'data.createdAt': -1 }, name: 'rpc_bookings_created_at_idx' },
    ]);
    await recordsCollection(db, 'rpc_customers').createIndexes([
      { key: { 'data.email': 1 }, name: 'rpc_customers_email_idx' },
      { key: { 'data.createdAt': -1 }, name: 'rpc_customers_created_at_idx' },
    ]);
    await recordsCollection(db, 'rpc_payments').createIndexes([
      { key: { 'data.bookingRef': 1 }, name: 'rpc_payments_booking_ref_idx' },
      { key: { 'data.status': 1 }, name: 'rpc_payments_status_idx' },
      { key: { 'data.date': -1 }, name: 'rpc_payments_date_idx' },
    ]);
    await recordsCollection(db, 'rpc_availability_blocks').createIndexes([
      { key: { 'data.serviceId': 1 }, name: 'rpc_availability_service_idx' },
      { key: { 'data.startDate': 1, 'data.endDate': 1 }, name: 'rpc_availability_range_idx' },
    ]);
    await recordsCollection(db, 'rpc_notifications').createIndexes([
      { key: { 'data.read': 1 }, name: 'rpc_notifications_read_idx' },
      { key: { 'data.createdAt': -1 }, name: 'rpc_notifications_created_idx' },
    ]);
  })();

  return indexesReady;
}

async function readRows<T extends DbRecord>(db: Db, collection: CollectionName): Promise<T[]> {
  const rows = await recordsCollection<T>(db, collection).find({}, { projection: { data: 1 } }).toArray();
  return rows.map((row) => row.data);
}

async function readDbFromMongo(db: Db, seedIfMissing: boolean): Promise<AppDatabase> {
  const metaRows = await metaCollection(db)
    .find({ _id: { $in: ['version', 'business', 'updatedAt'] } })
    .toArray();
  const metaMap = new Map(metaRows.map((row) => [row._id, row.data]));

  if (!metaMap.has('business')) {
    if (!seedIfMissing) throw new Error('RhinoConnect MongoDB storage is not initialized.');
    const seed = normalizeDb(createSeedDatabase());
    await persistDbWithMongo(db, seed);
    return seed;
  }

  return normalizeDb({
    version: Number(metaMap.get('version') ?? 1),
    business: metaMap.get('business') as AppDatabase['business'],
    services: await readRows(db, 'rpc_services'),
    availabilityBlocks: await readRows(db, 'rpc_availability_blocks'),
    customers: await readRows(db, 'rpc_customers'),
    bookings: await readRows(db, 'rpc_bookings'),
    payments: await readRows(db, 'rpc_payments'),
    notifications: await readRows(db, 'rpc_notifications'),
    automations: await readRows(db, 'rpc_automations'),
    updatedAt: String(metaMap.get('updatedAt') ?? new Date().toISOString()),
  });
}

async function upsertMeta(db: Db, key: string, data: unknown) {
  await metaCollection(db).updateOne(
    { _id: key },
    {
      $set: {
        data,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

async function replaceCollection<T extends DbRecord>(db: Db, collection: CollectionName, items: T[]) {
  const now = new Date();
  const target = recordsCollection<T>(db, collection);
  const ids = items.map((item) => item.id);

  if (items.length > 0) {
    await target.bulkWrite(
      items.map((item) => ({
        updateOne: {
          filter: { _id: item.id },
          update: {
            $set: { data: item, updatedAt: now },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      })),
      { ordered: true }
    );
  }

  await target.deleteMany(ids.length > 0 ? { _id: { $nin: ids } } : {});
}

async function persistDbWithMongo(db: Db, appDb: AppDatabase) {
  await replaceCollection(db, 'rpc_services', appDb.services);
  await replaceCollection(db, 'rpc_availability_blocks', appDb.availabilityBlocks);
  await replaceCollection(db, 'rpc_customers', appDb.customers);
  await replaceCollection(db, 'rpc_bookings', appDb.bookings);
  await replaceCollection(db, 'rpc_payments', appDb.payments);
  await replaceCollection(db, 'rpc_notifications', appDb.notifications);
  await replaceCollection(db, 'rpc_automations', appDb.automations);
  await upsertMeta(db, 'version', appDb.version);
  await upsertMeta(db, 'business', appDb.business);
  await upsertMeta(db, 'updatedAt', appDb.updatedAt);
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function acquireStorageLock(db: Db) {
  const owner = `${process.pid}:${randomUUID()}`;
  const startedAt = Date.now();
  const locks = lockCollection(db);

  while (Date.now() - startedAt < 10_000) {
    const now = new Date();
    const expiresAt = new Date(Date.now() + lockTtlMs);

    try {
      const result = await locks.updateOne(
        {
          _id: storageLockId,
          $or: [{ expiresAt: { $lte: now } }, { owner }],
        },
        {
          $set: { owner, expiresAt, updatedAt: now },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
      );

      if (result.modifiedCount > 0 || result.upsertedCount > 0) {
        return async () => {
          await locks.deleteOne({ _id: storageLockId, owner });
        };
      }
    } catch (error) {
      if ((error as { code?: number }).code !== 11000) throw error;
    }

    await wait(125);
  }

  throw new Error('Timed out waiting for RhinoConnect MongoDB storage lock.');
}

export async function readDb(): Promise<AppDatabase> {
  await ensureIndexes();
  const db = storageDb(await getMongoClient());
  return cloneDb(await readDbFromMongo(db, true));
}

export async function writeDb<T>(mutator: (db: AppDatabase) => Promise<T> | T): Promise<T> {
  const run = writeQueue.then(async () => {
    await ensureIndexes();
    const db = storageDb(await getMongoClient());
    const releaseLock = await acquireStorageLock(db);

    try {
      const nextDb = cloneDb(await readDbFromMongo(db, true));
      const result = await mutator(nextDb);
      nextDb.updatedAt = new Date().toISOString();
      await persistDbWithMongo(db, nextDb);
      return result;
    } finally {
      await releaseLock();
    }
  });

  writeQueue = run.then(
    () => undefined,
    () => undefined
  );

  return run;
}

export function getDataFilePath() {
  try {
    const url = new URL(mongoUri);
    if (url.password) url.password = '***';
    return `${url.toString()}#db=${mongoDbName}`;
  } catch {
    return `mongodb://configured#db=${mongoDbName}`;
  }
}
