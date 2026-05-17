import { MongoClient, type Db } from "mongodb";

declare global {

  var __mongoClientPromise: Promise<MongoClient> | undefined;

  var __mongoIndexesBootstrapped: boolean | undefined;
}

function buildClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined. Set it in .env.local before using the leaderboard API.",
    );
  }
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
  });
  return client.connect();
}

export function getMongoClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!globalThis.__mongoClientPromise) {
      globalThis.__mongoClientPromise = buildClientPromise();
    }
    return globalThis.__mongoClientPromise;
  }
  if (!globalThis.__mongoClientPromise) {
    globalThis.__mongoClientPromise = buildClientPromise();
  }
  return globalThis.__mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB ?? "portfolio";
  const client = await getMongoClient();
  const db = client.db(dbName);
  if (!globalThis.__mongoIndexesBootstrapped) {
    await bootstrapIndexes(db);
    globalThis.__mongoIndexesBootstrapped = true;
  }
  return db;
}

async function bootstrapIndexes(db: Db): Promise<void> {
  try {
    await Promise.all([
      db
        .collection("scores")
        .createIndex(
          { simulationSlug: 1, score: -1, createdAt: -1 },
          { name: "rank_by_slug" },
        ),
      db
        .collection("scores")
        .createIndex({ createdAt: 1 }, { name: "by_created" }),
      db
        .collection("rate_limits")
        .createIndex(
          { expiresAt: 1 },
          { name: "ttl_expires", expireAfterSeconds: 0 },
        ),
    ]);
  } catch (err) {
    // Index creation is idempotent on success; on failure (offline, perms)
    // we don't block reads/writes from continuing — Mongo will surface
    // any real query problems clearly downstream.
    console.warn("[mongo] index bootstrap warning:", err);
  }
}
