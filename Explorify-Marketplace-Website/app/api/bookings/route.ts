import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getBookingsByUser } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const bookings = await getBookingsByUser(session.user.id);
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error getting user bookings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
