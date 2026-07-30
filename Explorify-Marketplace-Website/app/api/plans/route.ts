import { NextRequest, NextResponse } from "next/server";
import { getAllActivePlans } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    const plans = await getAllActivePlans();
    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Error fetching all active plans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
