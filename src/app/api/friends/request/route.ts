import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, inviteCode } = body;

    if (!username && !inviteCode) {
      return NextResponse.json(
        { success: false, error: "Username or invite code is required" },
        { status: 400 }
      );
    }

    const targetUser = inviteCode
      ? await prisma.user.findUnique({ where: { inviteCode } })
      : await prisma.user.findUnique({
          where: { username: username.toLowerCase() },
        });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (targetUser.id === user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot send a friend request to yourself" },
        { status: 400 }
      );
    }

    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: user.id, addresseeId: targetUser.id },
          { requesterId: targetUser.id, addresseeId: user.id },
        ],
      },
    });

    if (existingFriendship) {
      if (existingFriendship.status === "ACCEPTED") {
        return NextResponse.json(
          { success: false, error: "You are already friends" },
          { status: 400 }
        );
      }
      if (existingFriendship.status === "PENDING") {
        return NextResponse.json(
          { success: false, error: "A friend request already exists" },
          { status: 400 }
        );
      }
      if (existingFriendship.status === "REJECTED") {
        await prisma.friendship.update({
          where: { id: existingFriendship.id },
          data: {
            requesterId: user.id,
            addresseeId: targetUser.id,
            status: "PENDING",
          },
        });

        await prisma.activity.create({
          data: {
            userId: user.id,
            type: "FRIEND_REQUEST_SENT",
            message: `Sent a friend request to ${targetUser.displayName || targetUser.username}`,
            metadata: { targetUserId: targetUser.id },
          },
        });

        return NextResponse.json({
          success: true,
          data: { message: "Friend request sent" },
        });
      }
    }

    const friendship = await prisma.friendship.create({
      data: {
        requesterId: user.id,
        addresseeId: targetUser.id,
        status: "PENDING",
      },
    });

    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "FRIEND_REQUEST_SENT",
        message: `Sent a friend request to ${targetUser.displayName || targetUser.username}`,
        metadata: { targetUserId: targetUser.id },
      },
    });

    return NextResponse.json(
      { success: true, data: { friendship } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Friend request error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
