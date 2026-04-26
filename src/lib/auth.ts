import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";
const TOKEN_EXPIRY = "30d";

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        xp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        lastSolvedAt: true,
        createdAt: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/token=([^;]+)/);
    if (match) return match[1];
  }

  return null;
}

/**
 * Lightweight auth — verifies JWT only, no DB round-trip.
 * Use for routes that just need userId / username.
 */
export function getAuthPayload(request: Request): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Full auth — verifies JWT then fetches user from DB.
 * Use only when you need fresh user fields (xp, level, streak, etc.).
 */
export async function getUserFromRequest(request: Request) {
  const payload = getAuthPayload(request);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      role: true,
      xp: true,
      level: true,
      currentStreak: true,
      longestStreak: true,
      lastSolvedAt: true,
    },
  });

  return user;
}
