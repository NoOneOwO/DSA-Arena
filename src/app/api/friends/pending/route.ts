import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const [received, sent] = await Promise.all([
      prisma.friendship.findMany({
        where: { addresseeId: user.id, status: "PENDING" },
        include: {
          requester: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              xp: true,
              level: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.friendship.findMany({
        where: { requesterId: user.id, status: "PENDING" },
        include: {
          addressee: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              xp: true,
              level: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const receivedRequests = received.map((f) => ({
      friendshipId: f.id,
      user: f.requester,
      createdAt: f.createdAt,
      direction: "received" as const,
    }));

    const sentRequests = sent.map((f) => ({
      friendshipId: f.id,
      user: f.addressee,
      createdAt: f.createdAt,
      direction: "sent" as const,
    }));

    return NextResponse.json({
      success: true,
      data: { received: receivedRequests, sent: sentRequests },
    });
  } catch (error) {
    console.error("Get pending requests error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
