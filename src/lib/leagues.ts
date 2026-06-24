import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongo";

export const leagueTiers = [
  "bronze",
  "silver",
  "gold",
  "sapphire",
  "ruby",
  "emerald",
  "amethyst",
  "pearl",
  "obsidian",
  "diamond",
] as const;

export type LeagueTier = (typeof leagueTiers)[number];

type LeagueMember = {
  userId: ObjectId;
  displayName: string;
  avatarSeed: string;
  weeklyXp: number;
};

type LeagueDocument = {
  _id?: ObjectId;
  tier: LeagueTier;
  weekStartDate: string;
  weekEndDate: string;
  members: LeagueMember[];
  status: "active" | "completed";
  completedAt?: Date;
};

export function getWeekBounds(date = new Date()) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  const monday = new Date(utc);
  monday.setUTCDate(utc.getUTCDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return {
    weekStartDate: monday.toISOString().slice(0, 10),
    weekEndDate: sunday.toISOString().slice(0, 10),
  };
}

export function getNextTier(tier: string) {
  const index = leagueTiers.indexOf(tier as LeagueTier);
  return leagueTiers[Math.min(leagueTiers.length - 1, Math.max(0, index) + 1)];
}

export function getPreviousTier(tier: string) {
  const index = leagueTiers.indexOf(tier as LeagueTier);
  return leagueTiers[Math.max(0, index - 1)];
}

async function joinLeague(user: {
  _id: ObjectId;
  displayName: string;
  avatarSeed: string;
}, tier: LeagueTier, xp = 0) {
  const db = await getDb();
  const leagues = db.collection<LeagueDocument>("leagues");
  const { weekStartDate, weekEndDate } = getWeekBounds();
  const existingLeague = await leagues.findOne({
    tier,
    weekStartDate,
    status: "active",
    "members.29": { $exists: false },
  });
  const member = {
    userId: user._id,
    displayName: user.displayName,
    avatarSeed: user.avatarSeed,
    weeklyXp: xp,
  };

  if (existingLeague) {
    await leagues.updateOne(
      { _id: existingLeague._id, "members.userId": { $ne: user._id } },
      { $push: { members: member } },
    );
    return existingLeague._id;
  }

  const created = await leagues.insertOne({
    tier,
    weekStartDate,
    weekEndDate,
    members: [member],
    status: "active",
  });

  return created.insertedId;
}

export async function ensureUserLeague(user: {
  _id: ObjectId;
  displayName: string;
  avatarSeed: string;
}, tier: LeagueTier = "bronze") {
  const db = await getDb();
  const leagues = db.collection<LeagueDocument>("leagues");
  const { weekStartDate } = getWeekBounds();
  const currentLeague = await leagues.findOne({
    weekStartDate,
    status: "active",
    "members.userId": user._id,
  });

  if (currentLeague) {
    return currentLeague;
  }

  await joinLeague(user, tier);

  return leagues.findOne({
    weekStartDate,
    status: "active",
    "members.userId": user._id,
  });
}

export async function incrementWeeklyXp(
  user: { _id: ObjectId; displayName: string; avatarSeed: string },
  xpEarned: number,
) {
  if (xpEarned <= 0) {
    return;
  }

  const db = await getDb();
  const leagues = db.collection<LeagueDocument>("leagues");
  const league = await ensureUserLeague(user);

  if (!league) {
    return;
  }

  await leagues.updateOne(
    { _id: league._id, "members.userId": user._id },
    { $inc: { "members.$.weeklyXp": xpEarned } },
  );
}

export async function runWeeklyLeagueReset() {
  const db = await getDb();
  const leagues = db.collection<LeagueDocument>("leagues");
  const activeLeagues = await leagues.find({ status: "active" }).toArray();

  for (const league of activeLeagues) {
    const sortedMembers = [...(league.members ?? [])].sort(
      (left, right) => Number(right.weeklyXp ?? 0) - Number(left.weeklyXp ?? 0),
    );

    for (let index = 0; index < sortedMembers.length; index += 1) {
      const member = sortedMembers[index];
      const tier =
        index < 10
          ? getNextTier(league.tier)
          : index >= Math.max(0, sortedMembers.length - 5)
            ? getPreviousTier(league.tier)
            : league.tier;

      await joinLeague(
        {
          _id: member.userId,
          displayName: member.displayName,
          avatarSeed: member.avatarSeed,
        },
        tier,
      );
    }

    await leagues.updateOne(
      { _id: league._id },
      { $set: { status: "completed", completedAt: new Date() } },
    );
  }
}
