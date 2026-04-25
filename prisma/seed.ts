import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BADGES = [
  { name: "First Steps", description: "Solve your first problem", icon: "👶", condition: "problems_1" },
  { name: "Consistency King", description: "Maintain a 7-day streak", icon: "👑", condition: "streak_7" },
  { name: "Grinder", description: "Solve 100 problems", icon: "⚡", condition: "problems_100" },
  { name: "Hard Slayer", description: "Solve 50 hard problems", icon: "🗡️", condition: "hard_50" },
  { name: "Week Warrior", description: "Solve 7 problems in a single day", icon: "⚔️", condition: "daily_7" },
  { name: "Century", description: "Earn 100 XP", icon: "💯", condition: "xp_100" },
];

interface TopicEntry {
  topicId: string;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
}

function computeStats(topics: TopicEntry[]) {
  let totalEasy = 0, totalMedium = 0, totalHard = 0;
  for (const t of topics) {
    totalEasy += t.easySolved;
    totalMedium += t.mediumSolved;
    totalHard += t.hardSolved;
  }
  const xp = totalEasy * 10 + totalMedium * 25 + totalHard * 50;
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 100)));
  const totalSolved = totalEasy + totalMedium + totalHard;
  return { xp, level, totalEasy, totalMedium, totalHard, totalSolved };
}

const aliTopics: TopicEntry[] = [
  { topicId: "arrays", easySolved: 5, mediumSolved: 3, hardSolved: 1 },
  { topicId: "strings", easySolved: 3, mediumSolved: 2, hardSolved: 0 },
  { topicId: "linked-list", easySolved: 2, mediumSolved: 1, hardSolved: 0 },
  { topicId: "binary-search", easySolved: 3, mediumSolved: 1, hardSolved: 0 },
  { topicId: "trees", easySolved: 2, mediumSolved: 1, hardSolved: 1 },
  { topicId: "dynamic-programming", easySolved: 1, mediumSolved: 1, hardSolved: 0 },
];

const zaidTopics: TopicEntry[] = [
  { topicId: "arrays", easySolved: 4, mediumSolved: 2, hardSolved: 0 },
  { topicId: "strings", easySolved: 2, mediumSolved: 1, hardSolved: 0 },
  { topicId: "stack", easySolved: 3, mediumSolved: 1, hardSolved: 0 },
  { topicId: "hashing", easySolved: 2, mediumSolved: 2, hardSolved: 1 },
  { topicId: "graphs", easySolved: 1, mediumSolved: 1, hardSolved: 0 },
  { topicId: "greedy", easySolved: 2, mediumSolved: 0, hardSolved: 0 },
];

const saraTopics: TopicEntry[] = [
  { topicId: "arrays", easySolved: 6, mediumSolved: 4, hardSolved: 2 },
  { topicId: "strings", easySolved: 5, mediumSolved: 3, hardSolved: 1 },
  { topicId: "linked-list", easySolved: 4, mediumSolved: 2, hardSolved: 1 },
  { topicId: "stack", easySolved: 3, mediumSolved: 2, hardSolved: 0 },
  { topicId: "queue", easySolved: 2, mediumSolved: 1, hardSolved: 0 },
  { topicId: "binary-search", easySolved: 4, mediumSolved: 3, hardSolved: 1 },
  { topicId: "trees", easySolved: 3, mediumSolved: 2, hardSolved: 1 },
  { topicId: "heap", easySolved: 2, mediumSolved: 1, hardSolved: 0 },
  { topicId: "hashing", easySolved: 3, mediumSolved: 2, hardSolved: 0 },
  { topicId: "graphs", easySolved: 2, mediumSolved: 2, hardSolved: 1 },
  { topicId: "dynamic-programming", easySolved: 3, mediumSolved: 2, hardSolved: 1 },
  { topicId: "greedy", easySolved: 2, mediumSolved: 1, hardSolved: 0 },
  { topicId: "sliding-window", easySolved: 2, mediumSolved: 1, hardSolved: 0 },
  { topicId: "two-pointers", easySolved: 3, mediumSolved: 1, hardSolved: 0 },
];

async function main() {
  console.log("🌱 Starting seed...\n");

  // ── Cleanup ──
  console.log("🗑️  Cleaning existing data...");
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.topicProgress.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.user.deleteMany();
  console.log("   Done.\n");

  // ── Badges ──
  console.log("🏅 Creating badges...");
  const badges = await prisma.badge.createManyAndReturn({ data: BADGES });
  console.log(`   Created ${badges.length} badges.\n`);

  // ── Users ──
  console.log("👤 Creating sample users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const ali = await prisma.user.create({
    data: { email: "ali@test.com", username: "ali", displayName: "Ali Khan", password: hashedPassword },
  });
  const zaid = await prisma.user.create({
    data: { email: "zaid@test.com", username: "zaid", displayName: "Zaid Ahmed", password: hashedPassword },
  });
  const sara = await prisma.user.create({
    data: { email: "sara@test.com", username: "sara", displayName: "Sara Malik", password: hashedPassword },
  });
  console.log("   Created users: ali, zaid, sara\n");

  // ── Friendships ──
  console.log("🤝 Creating friendships...");
  await prisma.friendship.createMany({
    data: [
      { requesterId: ali.id, addresseeId: zaid.id, status: "ACCEPTED" },
      { requesterId: ali.id, addresseeId: sara.id, status: "ACCEPTED" },
      { requesterId: zaid.id, addresseeId: sara.id, status: "ACCEPTED" },
    ],
  });
  console.log("   All 3 users are now friends.\n");

  // ── Topic Progress ──
  console.log("📊 Creating topic progress...");

  async function seedTopicProgress(userId: string, topics: TopicEntry[]) {
    for (const t of topics) {
      await prisma.topicProgress.create({
        data: { userId, topicId: t.topicId, easySolved: t.easySolved, mediumSolved: t.mediumSolved, hardSolved: t.hardSolved },
      });
    }
  }

  await seedTopicProgress(ali.id, aliTopics);
  await seedTopicProgress(zaid.id, zaidTopics);
  await seedTopicProgress(sara.id, saraTopics);

  const aliStats = computeStats(aliTopics);
  const zaidStats = computeStats(zaidTopics);
  const saraStats = computeStats(saraTopics);

  console.log(`   ali:  ${aliTopics.length} topics, ${aliStats.totalSolved} solved, ${aliStats.xp} XP, level ${aliStats.level}`);
  console.log(`   zaid: ${zaidTopics.length} topics, ${zaidStats.totalSolved} solved, ${zaidStats.xp} XP, level ${zaidStats.level}`);
  console.log(`   sara: ${saraTopics.length} topics, ${saraStats.totalSolved} solved, ${saraStats.xp} XP, level ${saraStats.level}\n`);

  // ── Update user stats ──
  console.log("📈 Updating user stats...");
  const today = new Date();

  await prisma.user.update({
    where: { id: ali.id },
    data: { xp: aliStats.xp, level: aliStats.level, currentStreak: 3, longestStreak: 5, lastSolvedAt: today },
  });
  await prisma.user.update({
    where: { id: zaid.id },
    data: { xp: zaidStats.xp, level: zaidStats.level, currentStreak: 1, longestStreak: 3, lastSolvedAt: today },
  });
  await prisma.user.update({
    where: { id: sara.id },
    data: { xp: saraStats.xp, level: saraStats.level, currentStreak: 7, longestStreak: 12, lastSolvedAt: today },
  });
  console.log("   Done.\n");

  // ── Activities ──
  console.log("📝 Creating activities...");
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400000);

  const baseActivities = [ali, zaid, sara].flatMap((user) => [
    { userId: user.id, type: "JOINED", message: "Joined DSA Arena", createdAt: thirtyDaysAgo },
    { userId: user.id, type: "PROGRESS_UPDATE", message: "Updated Arrays progress", createdAt: today },
  ]);

  const saraExtras = [
    { userId: sara.id, type: "LEVEL_UP", message: `Reached Level ${saraStats.level}`, createdAt: today },
    { userId: sara.id, type: "BADGE_EARNED", message: "Earned Consistency King badge", createdAt: today },
  ];

  await prisma.activity.createMany({ data: [...baseActivities, ...saraExtras] });
  console.log(`   Created ${baseActivities.length + saraExtras.length} activities.\n`);

  // ── Badge Awards ──
  console.log("🏆 Awarding badges...");
  const badgeMap = new Map(badges.map((b) => [b.condition, b.id]));

  const badgeAwards: { userId: string; badgeId: string }[] = [];

  const firstStepsId = badgeMap.get("problems_1")!;
  const centuryId = badgeMap.get("xp_100")!;
  const consistencyId = badgeMap.get("streak_7")!;
  const grinderId = badgeMap.get("problems_100")!;

  for (const user of [ali, zaid, sara]) {
    badgeAwards.push({ userId: user.id, badgeId: firstStepsId });
    badgeAwards.push({ userId: user.id, badgeId: centuryId });
  }

  badgeAwards.push({ userId: sara.id, badgeId: consistencyId });

  if (saraStats.totalSolved >= 100) {
    badgeAwards.push({ userId: sara.id, badgeId: grinderId });
    console.log(`   sara qualifies for Grinder (${saraStats.totalSolved} solved)`);
  } else {
    console.log(`   sara does NOT qualify for Grinder (${saraStats.totalSolved}/100 solved)`);
  }

  await prisma.userBadge.createMany({ data: badgeAwards });
  console.log(`   Awarded ${badgeAwards.length} badges.\n`);

  // ── Summary ──
  const userCount = await prisma.user.count();
  const badgeCount = await prisma.badge.count();
  const topicCount = await prisma.topicProgress.count();
  const activityCount = await prisma.activity.count();
  const awardCount = await prisma.userBadge.count();

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🌱 Seed complete!");
  console.log(`   ${userCount} users`);
  console.log(`   ${badgeCount} badges`);
  console.log(`   ${topicCount} topic progress records`);
  console.log(`   ${activityCount} activities`);
  console.log(`   ${awardCount} badge awards`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => console.log("✅ Done"))
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
