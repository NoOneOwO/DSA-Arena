import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BADGES = [
  { name: "First Steps", description: "Solve your first problem", icon: "👶", condition: "problems_1" },
  { name: "Consistency King", description: "Maintain a 7-day streak", icon: "👑", condition: "streak_7" },
  { name: "Grinder", description: "Solve 100 problems", icon: "⚡", condition: "problems_100" },
  { name: "Hard Slayer", description: "Solve 50 hard problems", icon: "🗡️", condition: "hard_50" },
  { name: "Week Warrior", description: "Solve 7 problems in a single day", icon: "⚔️", condition: "daily_7" },
  { name: "Century", description: "Earn 100 XP", icon: "💯", condition: "xp_100" },
];

const USERS = [
  { username: "prakhar", displayName: "Prakhar", email: "prakhar@dsa.local", role: "USER" },
  { username: "taiyab", displayName: "Taiyab", email: "taiyab@dsa.local", role: "ADMIN" },
  { username: "satyam", displayName: "Satyam", email: "satyam@dsa.local", role: "ADMIN" },
  { username: "arham", displayName: "Arham", email: "arham@dsa.local", role: "USER" },
  { username: "vivek", displayName: "Vivek", email: "vivek@dsa.local", role: "USER" },
];

async function main() {
  console.log("Starting seed...\n");

  console.log("Cleaning existing data...");
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.topicProgress.deleteMany();
  await prisma.user.deleteMany();
  console.log("   Done.\n");

  console.log("Creating badges...");
  const badges = await prisma.badge.createManyAndReturn({ data: BADGES });
  console.log(`   Created ${badges.length} badges.\n`);

  console.log("Creating users...");
  const createdUsers = [];
  for (const u of USERS) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        username: u.username,
        displayName: u.displayName,
        password: "",
        role: u.role,
      },
    });
    createdUsers.push(user);
  }
  console.log(`   Created ${createdUsers.length} users: ${USERS.map(u => u.displayName).join(", ")}\n`);

  console.log("Creating join activities...");
  const now = new Date();
  const activities = createdUsers.map(user => ({
    userId: user.id,
    type: "JOINED",
    message: `${user.displayName} joined DSA Arena`,
    createdAt: now,
  }));
  await prisma.activity.createMany({ data: activities });
  console.log(`   Created ${activities.length} activities.\n`);

  const userCount = await prisma.user.count();
  const badgeCount = await prisma.badge.count();
  const activityCount = await prisma.activity.count();

  console.log("Seed complete!");
  console.log(`   ${userCount} users`);
  console.log(`   ${badgeCount} badges`);
  console.log(`   ${activityCount} activities\n`);
}

main()
  .then(() => console.log("Done"))
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
