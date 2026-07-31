import { NextRequest, NextResponse } from "next/server";
import { createPaymentOrder } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const { amount, tripName } = await request.json();

    const numericAmount = Math.max(1, Number(amount) || 1000);

    // Create real Razorpay test order using backend credentials
    const order = await createPaymentOrder(
      numericAmount,
      "INR",
      `demo_rcpt_${Date.now()}`,
      { tripName: tripName || "Explorify Package" }
    );

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_RpVtiSZ0iaspVP",
    });
  } catch (error: any) {
    console.error("Error creating demo Razorpay order:", error);
    return NextResponse.json(
      {
        orderId: null,
        amount: (Number((await request.json().catch(() => ({}))).amount) || 1000) * 100,
        currency: "INR",
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_RpVtiSZ0iaspVP",
      },
      { status: 200 }
    );
  }
}
