import { getDb } from "@/lib/db/mongo";

const windowMs = 15 * 60 * 1000;
const maxAttempts = 5;

export async function checkRateLimit(email: string, request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip =
    forwardedFor ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";
  const key = `${email || "unknown"}:${ip}`;
  const db = await getDb();
  const now = new Date();
  const expiresAt = new Date(Date.now() + windowMs);
  const current = await db.collection("login_attempts").findOne({ key });

  if (!current || current.expiresAt <= now) {
    await db.collection("login_attempts").updateOne(
      { key },
      { $set: { attempts: 1, expiresAt } },
      { upsert: true },
    );
    return true;
  }

  const incremented = await db.collection("login_attempts").findOneAndUpdate(
    { key },
    { $inc: { attempts: 1 }, $set: { expiresAt } },
    { returnDocument: "after" },
  );

  return Number(incremented?.attempts ?? 1) <= maxAttempts;
}

export async function clearRateLimit(email: string, request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip =
    forwardedFor ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";
  const db = await getDb();

  await db.collection("login_attempts").deleteOne({ key: `${email || "unknown"}:${ip}` });
}
