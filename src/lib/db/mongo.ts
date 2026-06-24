import { Db, MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "devlingo";

let client: MongoClient | null = null;
let db: Db | null = null;
let indexesReady: Promise<void> | null = null;

export async function getDb(): Promise<Db> {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!client) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
      },
    });
    await client.connect();
    db = client.db(dbName);
  }

  if (!db) {
    db = client.db(dbName);
  }

  indexesReady ??= ensureIndexes(db);
  await indexesReady;

  return db;
}

async function ensureIndexes(database: Db) {
  await Promise.all([
    database.collection("users").createIndex({ email: 1 }, { unique: true }),
    database.collection("sessions").createIndex({ token: 1 }, { unique: true }),
    database.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database.collection("password_reset_tokens").createIndex({ token: 1 }, { unique: true }),
    database
      .collection("password_reset_tokens")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database.collection("progress").createIndex({ userId: 1 }, { unique: true }),
    database.collection("leagues").createIndex({ tier: 1, weekStartDate: 1, status: 1 }),
    database.collection("leagues").createIndex({ "members.userId": 1, weekStartDate: 1 }),
    database.collection("login_attempts").createIndex({ key: 1 }, { unique: true }),
    database.collection("login_attempts").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
}
