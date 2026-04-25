import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Action must be 'accept' or 'reject'" },
        { status: 400 }
      );
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id },
      include: {
        requester: { select: { id: true, username: true, displayName: true } },
        addressee: { select: { id: true, username: true, displayName: true } },
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { success: false, error: "Friend request not found" },
        { status: 404 }
      );
    }

    if (friendship.addresseeId !== user.id) {
      return NextResponse.json(
        { success: false, error: "You can only respond to requests sent to you" },
        { status: 403 }
      );
    }

    if (friendship.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "This request has already been handled" },
        { status: 400 }
      );
    }

    const newStatus = action === "accept" ? "ACCEPTED" : "REJECTED";

    const updated = await prisma.friendship.update({
      where: { id },
      data: { status: newStatus },
    });

    if (action === "accept") {
      await prisma.activity.createMany({
        data: [
          {
            userId: user.id,
            type: "FRIEND_ACCEPTED",
            message: `Became friends with ${friendship.requester.displayName || friendship.requester.username}`,
            metadata: { friendId: friendship.requesterId },
          },
          {
            userId: friendship.requesterId,
            type: "FRIEND_ACCEPTED",
            message: `Became friends with ${user.displayName || user.username}`,
            metadata: { friendId: user.id },
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      data: { friendship: updated },
    });
  } catch (error) {
    console.error("Update friendship error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const friendship = await prisma.friendship.findUnique({
      where: { id },
    });

    if (!friendship) {
      return NextResponse.json(
        { success: false, error: "Friendship not found" },
        { status: 404 }
      );
    }

    if (
      friendship.requesterId !== user.id &&
      friendship.addresseeId !== user.id
    ) {
      return NextResponse.json(
        { success: false, error: "You are not part of this friendship" },
        { status: 403 }
      );
    }

    await prisma.friendship.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: "Friendship removed" },
    });
  } catch (error) {
    console.error("Delete friendship error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
