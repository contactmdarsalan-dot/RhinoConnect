import { Pool, type PoolClient } from 'pg';
import type { ServiceMedia } from '@/lib/types';
import { createSeedDatabase, type AppDatabase } from './seed';

const databaseUrl = process.env.RPC_DATABASE_URL ?? process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
const sslEnabled = process.env.PGSSLMODE === 'require' || process.env.POSTGRES_SSL === 'true';
const schemaLockKey = 'rhinoconnect:web-storage';

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;
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

const collectionTables = [
  'rpc_services',
  'rpc_availability_blocks',
  'rpc_customers',
  'rpc_bookings',
  'rpc_payments',
  'rpc_notifications',
  'rpc_automations',
] as const;

type CollectionTable = (typeof collectionTables)[number];

type DbRecord = { id: string };

function getPool() {
  if (!databaseUrl) {
    throw new Error(
      'PostgreSQL storage is required. Set RPC_DATABASE_URL, DATABASE_URL, or POSTGRES_URL before starting RhinoConnect web.'
    );
  }

  pool ??= new Pool({
    connectionString: databaseUrl,
    max: Number(process.env.RPC_DB_POOL_SIZE ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 8_000,
    ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
  });

  return pool;
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

function requireJson<T>(value: unknown): T {
  return value as T;
}

async function ensureSchema() {
  schemaReady ??= (async () => {
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [schemaLockKey]);
      await client.query(`
        CREATE TABLE IF NOT EXISTS rpc_meta (
          key TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);

      for (const table of collectionTables) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS ${table} (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
          );
        `);
      }

      await client.query("CREATE INDEX IF NOT EXISTS rpc_services_active_idx ON rpc_services ((data->>'active'));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_services_type_idx ON rpc_services ((data->>'type'));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_services_name_idx ON rpc_services ((lower(data->>'name')));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_bookings_ref_idx ON rpc_bookings ((data->>'bookingRef'));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_bookings_customer_id_idx ON rpc_bookings ((data->>'customerId'));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_bookings_service_id_idx ON rpc_bookings ((data->>'serviceId'));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_bookings_check_in_idx ON rpc_bookings ((data->>'checkIn'));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_bookings_check_out_idx ON rpc_bookings ((data->>'checkOut'));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_bookings_status_idx ON rpc_bookings ((data->>'status'));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_bookings_created_at_idx ON rpc_bookings ((data->>'createdAt'));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_customers_email_idx ON rpc_customers ((lower(data->>'email')));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_customers_created_at_idx ON rpc_customers ((data->>'createdAt'));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_payments_booking_ref_idx ON rpc_payments ((data->>'bookingRef'));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_payments_status_idx ON rpc_payments ((data->>'status'));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_payments_date_idx ON rpc_payments ((data->>'date'));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_availability_service_idx ON rpc_availability_blocks ((data->>'serviceId'));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_availability_start_idx ON rpc_availability_blocks ((data->>'startDate'));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_notifications_read_idx ON rpc_notifications ((data->>'read'));");
      await client.query("CREATE INDEX IF NOT EXISTS rpc_notifications_created_idx ON rpc_notifications ((data->>'createdAt'));");

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      schemaReady = null;
      throw error;
    } finally {
      client.release();
    }
  })();

  return schemaReady;
}

async function readJsonRows<T>(client: PoolClient, table: CollectionTable): Promise<T[]> {
  const result = await client.query<{ data: T }>(`SELECT data FROM ${table}`);
  return result.rows.map((row) => requireJson<T>(row.data));
}

async function readDbFromClient(client: PoolClient, seedIfMissing: boolean): Promise<AppDatabase> {
  const meta = await client.query<{ key: string; data: unknown }>("SELECT key, data FROM rpc_meta WHERE key IN ('version', 'business', 'updatedAt')");
  const metaMap = new Map(meta.rows.map((row) => [row.key, row.data]));

  if (!metaMap.has('business')) {
    if (!seedIfMissing) throw new Error('RhinoConnect PostgreSQL storage is not initialized.');
    const seed = normalizeDb(createSeedDatabase());
    await persistDbWithClient(client, seed);
    return seed;
  }

  return normalizeDb({
    version: Number(metaMap.get('version') ?? 1),
    business: requireJson<AppDatabase['business']>(metaMap.get('business')),
    services: await readJsonRows(client, 'rpc_services'),
    availabilityBlocks: await readJsonRows(client, 'rpc_availability_blocks'),
    customers: await readJsonRows(client, 'rpc_customers'),
    bookings: await readJsonRows(client, 'rpc_bookings'),
    payments: await readJsonRows(client, 'rpc_payments'),
    notifications: await readJsonRows(client, 'rpc_notifications'),
    automations: await readJsonRows(client, 'rpc_automations'),
    updatedAt: String(metaMap.get('updatedAt') ?? new Date().toISOString()),
  });
}

async function upsertMeta(client: PoolClient, key: string, data: unknown) {
  await client.query(
    `
      INSERT INTO rpc_meta (key, data, updated_at)
      VALUES ($1, $2::jsonb, now())
      ON CONFLICT (key)
      DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    `,
    [key, JSON.stringify(data)]
  );
}

async function replaceCollection<T extends DbRecord>(client: PoolClient, table: CollectionTable, items: T[]) {
  await client.query(`TRUNCATE TABLE ${table}`);
  for (const item of items) {
    await client.query(
      `
        INSERT INTO ${table} (id, data, updated_at)
        VALUES ($1, $2::jsonb, now())
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = now()
      `,
      [item.id, JSON.stringify(item)]
    );
  }
}

async function persistDbWithClient(client: PoolClient, db: AppDatabase) {
  await upsertMeta(client, 'version', db.version);
  await upsertMeta(client, 'business', db.business);
  await upsertMeta(client, 'updatedAt', db.updatedAt);
  await replaceCollection(client, 'rpc_services', db.services);
  await replaceCollection(client, 'rpc_availability_blocks', db.availabilityBlocks);
  await replaceCollection(client, 'rpc_customers', db.customers);
  await replaceCollection(client, 'rpc_bookings', db.bookings);
  await replaceCollection(client, 'rpc_payments', db.payments);
  await replaceCollection(client, 'rpc_notifications', db.notifications);
  await replaceCollection(client, 'rpc_automations', db.automations);
}

export async function readDb(): Promise<AppDatabase> {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    return cloneDb(await readDbFromClient(client, true));
  } finally {
    client.release();
  }
}

export async function writeDb<T>(mutator: (db: AppDatabase) => Promise<T> | T): Promise<T> {
  const run = writeQueue.then(async () => {
    await ensureSchema();
    const client = await getPool().connect();

    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [schemaLockKey]);
      const nextDb = cloneDb(await readDbFromClient(client, true));
      const result = await mutator(nextDb);
      nextDb.updatedAt = new Date().toISOString();
      await persistDbWithClient(client, nextDb);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  });

  writeQueue = run.then(
    () => undefined,
    () => undefined
  );

  return run;
}

export function getDataFilePath() {
  if (!databaseUrl) return 'postgresql://not-configured';

  try {
    const url = new URL(databaseUrl);
    if (url.password) url.password = '***';
    if (url.username) url.username = url.username ? `${url.username}` : '';
    return url.toString();
  } catch {
    return 'postgresql://configured';
  }
}
