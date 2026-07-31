import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createBooking, getBookingsByUser, clearAllBookings } from "@/lib/db-helpers";
import { DynamoDBBooking } from "@/lib/dynamodb";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await auth();

    const bookingId = body.bookingId || `EXP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const userId = session?.user?.id || body.userId || "guest_user";
    const customerEmail = session?.user?.email || body.customerEmail || "explorer@explorify.ai";
    const customerName = session?.user?.name || body.customerName || "Explorer Passenger";

    const newBooking: DynamoDBBooking = {
      bookingId,
      userId,
      planId: body.planId || body.tripId || "p1",
      departureId: body.departureId || "dep_1",
      numPeople: body.numPeople || body.travellers || 1,
      totalAmount: body.totalAmount || 24999,
      paymentStatus: body.paymentStatus || "completed",
      bookingStatus: "confirmed",
      tripDate: body.tripDate || body.date || new Date().toISOString().split("T")[0],
      razorpayOrderId: body.razorpayOrderId || `order_${Math.random().toString(36).substring(2, 10)}`,
      razorpayPaymentId: body.razorpayPaymentId || `pay_${Math.random().toString(36).substring(2, 10)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to database
    await createBooking(newBooking);

    // Trigger Automated Email Dispatch
    let emailStatus = { success: true, message: "Email notification triggered" };
    try {
      const emailRes = await fetch(new URL("/api/email/send-confirmation", request.url).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customerEmail,
          customerName,
          bookingId,
          tripName: body.tripName || "Explorify Expedition",
          totalAmount: newBooking.totalAmount,
          date: newBooking.tripDate,
          travellers: newBooking.numPeople,
          paymentId: newBooking.razorpayPaymentId,
        }),
      });
      if (emailRes.ok) {
        emailStatus = await emailRes.json();
      }
    } catch (e) {
      console.warn("Could not dispatch confirmation email:", e);
    }

    return NextResponse.json({
      success: true,
      booking: newBooking,
      emailStatus,
    });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await clearAllBookings();
    return NextResponse.json({ success: true, message: "All bookings cleared successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
