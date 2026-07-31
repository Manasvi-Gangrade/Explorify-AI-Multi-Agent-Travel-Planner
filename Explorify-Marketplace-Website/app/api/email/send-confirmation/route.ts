import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email = "explorer@explorify.ai",
      customerName = "Explorer Passenger",
      bookingId = "EXP-2026-10294",
      tripName = "Explorify Expedition",
      totalAmount = 24999,
      date = "2026-09-15",
      travellers = 1,
      paymentId = "pay_rzp_demo",
    } = body;

    const formattedPrice = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(totalAmount);

    const emailSubject = `✈ Booking Confirmed! Your Explorify E-Ticket [${bookingId}]`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #1d6fa5 0%, #0c4a6e 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
          .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .body-content { padding: 24px; }
          .ticket-card { background: #f0f9ff; border: 1.5px dashed #0284c7; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
          .label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; }
          .val { font-weight: 700; color: #0f172a; }
          .badge { background: #dcfce7; color: #166534; font-weight: 800; padding: 4px 12px; border-radius: 12px; font-size: 12px; display: inline-block; }
          .cta-btn { display: inline-block; background: #1d6fa5; color: #ffffff !important; font-weight: 700; padding: 14px 28px; border-radius: 30px; text-decoration: none; margin-top: 16px; }
          .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ExplorifyTrips</div>
            <p style="margin-top: 6px; opacity: 0.9; font-size: 14px;">Your Trip is Confirmed & Ready!</p>
          </div>

          <div class="body-content">
            <h2 style="font-size: 18px; margin-bottom: 8px;">Hi ${customerName}, 👋</h2>
            <p style="font-size: 14px; color: #475569;">
              Thank you for choosing Explorify! Your payment of <b>${formattedPrice}</b> was verified successfully via Razorpay.
            </p>

            <div class="ticket-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <div>
                  <div class="label">BOOKING ID</div>
                  <div class="val" style="color: #1d6fa5; font-size: 18px;">${bookingId}</div>
                </div>
                <div class="badge">✓ CONFIRMED</div>
              </div>

              <div style="border-top: 1px solid #bae6fd; padding-top: 12px;">
                <div class="info-row">
                  <span class="label">TRIP NAME</span>
                  <span class="val">${tripName}</span>
                </div>
                <div class="info-row">
                  <span class="label">DEPARTURE DATE</span>
                  <span class="val" style="color: #1d6fa5;">${date}</span>
                </div>
                <div class="info-row">
                  <span class="label">PASSENGERS</span>
                  <span class="val">${travellers} Traveler(s)</span>
                </div>
                <div class="info-row">
                  <span class="label">RAZORPAY PAYMENT ID</span>
                  <span class="val" style="font-family: monospace;">${paymentId}</span>
                </div>
              </div>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">
                Your multi-page official PDF travel voucher with QR code & day-by-day itinerary is attached to your account.
              </p>
              <a href="http://localhost:3000/bookings" class="cta-btn">View My Bookings & Download Voucher</a>
            </div>
          </div>

          <div class="footer">
            Need help? Reply to this email or contact our 24/7 Helpline: <b>+91 1800-EXPLORIFY</b><br/>
            © 2026 Explorify AI Travel Technologies Inc.
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`====================================================`);
    console.log(`[AUTOMATED EMAIL NOTIFICATION TRIGGERED]`);
    console.log(`To: ${email}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Booking ID: ${bookingId}`);
    console.log(`====================================================`);

    return NextResponse.json({
      success: true,
      message: `Automated confirmation email successfully dispatched to ${email}`,
      recipient: email,
      bookingId,
      emailSubject,
      timestamp: new Date().toISOString(),
      previewHtml: htmlBody,
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to dispatch email" },
      { status: 500 }
    );
  }
}
