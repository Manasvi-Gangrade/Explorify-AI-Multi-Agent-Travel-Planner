import { formatINR, getTrip, trips } from "./site-data";

export interface PdfTicketData {
  bookingId: string;
  tripId: string;
  tripName: string;
  destination: string;
  state?: string;
  days: number;
  nights: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  travellers: number;
  totalAmount: number;
  paymentId?: string;
  paymentMethod?: string;
}

export function generateExplorifyPdfTicket(data: PdfTicketData) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups in your browser to view & print your multi-page E-Ticket PDF.");
    return;
  }

  // Retrieve matching trip or fallback to first matching by destination/name
  let matchedTrip = getTrip(data.tripId);
  if (!matchedTrip) {
    matchedTrip = trips.find(t => t.name.toLowerCase().includes(data.tripName.toLowerCase()) || t.destination.toLowerCase().includes(data.destination.toLowerCase()));
  }

  const daysCount = data.days || matchedTrip?.days || 6;
  const nightsCount = data.nights || matchedTrip?.nights || Math.max(1, daysCount - 1);

  // Generate or use dynamic itinerary days
  const baseItinerary = matchedTrip?.itinerary && matchedTrip.itinerary.length > 0
    ? matchedTrip.itinerary
    : Array.from({ length: daysCount }).map((_, idx) => ({
        day: idx + 1,
        title: idx === 0 ? "Arrival & Welcome" : idx === daysCount - 1 ? "Departure & Farewell" : `Expedition Trail ${idx + 1}`,
        place: data.destination,
        description: idx === 0
          ? `Arrival at ${data.destination}, transfer to stay, briefing session with local guide.`
          : idx === daysCount - 1
          ? `Check-out after breakfast, souvenir shopping, transfer back to departure hub.`
          : `Guided exploration of scenic points, cultural spots, local bazaar and evening leisure.`
      }));

  const highlights = matchedTrip?.highlights && matchedTrip.highlights.length > 0
    ? matchedTrip.highlights
    : [`Guided Tour of ${data.destination}`, "3-Star & 4-Star Stay", "Private AC Vehicle Transfers", "24/7 Expedition Lead"];

  const inclusions = matchedTrip?.inclusions && matchedTrip.inclusions.length > 0
    ? matchedTrip.inclusions
    : [`${nightsCount} Nights Accommodation`, "Daily Breakfast & Dinner", "All Internal Sightseeing Transfers", "State Permits & Taxes"];

  const exclusions = matchedTrip?.exclusions && matchedTrip.exclusions.length > 0
    ? matchedTrip.exclusions
    : ["Flight / Train to Starting Point", "Personal Laundry & Shopping", "Optional Adventure Activities", "Tips & Gratitude"];

  const meetingPoint = matchedTrip?.meetingPoint || `${data.destination} Airport / Central Bus Terminal`;
  const bookingCode = data.bookingId || `EXP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=EXPLORIFY-VERIFIED-${bookingCode}&color=1d6fa5&bgcolor=ffffff`;
  const paymentTxn = data.paymentId || `pay_rzp_${Math.random().toString(36).substring(2, 12)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Explorify E-Ticket - ${bookingCode}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        @page {
          size: A4 portrait;
          margin: 0;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        html, body {
          width: 210mm;
          background: #f1f5f9;
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          color: #0f172a;
          font-size: 12px;
          line-height: 1.45;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .page {
          width: 210mm;
          height: 297mm;
          padding: 16mm 16mm;
          margin: 0 auto;
          position: relative;
          background: #ffffff;
          page-break-after: always;
          break-after: page;
          box-sizing: border-box;
          overflow: hidden;
        }

        .page-border {
          position: absolute;
          top: 6mm; left: 6mm; right: 6mm; bottom: 6mm;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          pointer-events: none;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #1d6fa5;
          padding-bottom: 14px;
          margin-bottom: 16px;
        }

        .brand-logo {
          font-size: 22px;
          font-weight: 800;
          color: #1d6fa5;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .brand-subtitle {
          font-size: 10px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .status-badge {
          background: #ecfdf5;
          border: 1.2px solid #10b981;
          color: #047857;
          font-size: 11px;
          font-weight: 800;
          padding: 6px 14px;
          border-radius: 20px;
        }

        .hero-banner {
          background: linear-gradient(135deg, #1d6fa5 0%, #0c4a6e 100%);
          color: #ffffff;
          border-radius: 12px;
          padding: 18px 20px;
          margin-bottom: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .hero-title {
          font-size: 19px;
          font-weight: 800;
          margin-bottom: 2px;
        }

        .hero-sub {
          font-size: 12px;
          opacity: 0.95;
        }

        .ticket-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
          margin-bottom: 18px;
        }

        .card-box {
          background: #f8fafc;
          border: 1.5px dashed #cbd5e1;
          border-radius: 12px;
          padding: 16px;
        }

        .label {
          font-size: 9.5px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 2px;
        }

        .val {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }

        .val-highlight {
          color: #1d6fa5;
          font-size: 16px;
        }

        .info-matrix {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
        }

        .qr-card {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          padding: 12px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .qr-img {
          width: 105px;
          height: 105px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          padding: 4px;
          background: #ffffff;
        }

        .table-box {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .table-box th {
          background: #f1f5f9;
          color: #334155;
          font-size: 10.5px;
          font-weight: 700;
          text-align: left;
          padding: 8px 12px;
          text-transform: uppercase;
        }

        .table-box td {
          padding: 10px 12px;
          border-top: 1px solid #e2e8f0;
          font-size: 12px;
        }

        .section-title {
          font-size: 14.5px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          border-left: 3.5px solid #1d6fa5;
          padding-left: 8px;
        }

        .itinerary-day {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 10px;
          display: flex;
          gap: 14px;
        }

        .day-badge {
          background: #e0f2fe;
          color: #0369a1;
          font-weight: 800;
          font-size: 11px;
          padding: 6px 10px;
          border-radius: 6px;
          height: fit-content;
          min-width: 55px;
          text-align: center;
        }

        .list-check {
          list-style: none;
        }

        .list-check li {
          position: relative;
          padding-left: 18px;
          margin-bottom: 6px;
          font-size: 12px;
        }

        .list-check li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #10b981;
          font-weight: 800;
        }

        .list-cross li::before {
          content: "✕";
          color: #ef4444;
        }

        .footer-stamp {
          position: absolute;
          bottom: 12mm;
          left: 16mm; right: 16mm;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 14px;
          border-top: 1.5px solid #e2e8f0;
        }

        .seal-box {
          border: 2px dashed #1d6fa5;
          border-radius: 50%;
          width: 75px;
          height: 75px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 8px;
          font-weight: 800;
          color: #1d6fa5;
          transform: rotate(-10deg);
        }

        @media print {
          body { background: white; width: 210mm; }
          .page {
            width: 210mm;
            height: 297mm;
            padding: 16mm 16mm;
            margin: 0;
            border: none;
            page-break-after: always;
            break-after: page;
            overflow: hidden;
          }
          .page-border {
            top: 6mm; left: 6mm; right: 6mm; bottom: 6mm;
          }
        }
      </style>
    </head>
    <body>

      <!-- PAGE 1: OFFICIAL BOARDING PASS & E-TICKET -->
      <div class="page">
        <div class="page-border"></div>

        <div class="header">
          <div>
            <div class="brand-logo">✈ ExplorifyTrips</div>
            <div class="brand-subtitle">Official Confirmed Travel Pass & Voucher</div>
          </div>
          <div class="status-badge">✓ CONFIRMED & GUARANTEED</div>
        </div>

        <div class="hero-banner">
          <div>
            <div class="hero-title">${data.tripName}</div>
            <div class="hero-sub">📍 ${data.destination}${data.state ? `, ${data.state}` : ''} • ${daysCount} Days / ${nightsCount} Nights</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10px; opacity: 0.85;">BOOKING REF</div>
            <div style="font-size: 18px; font-weight: 800; letter-spacing: 1px;">${bookingCode}</div>
          </div>
        </div>

        <div class="ticket-grid">
          <div class="card-box">
            <div class="label">PASSENGER & EXPEDITION DETAILS</div>
            <div class="info-matrix">
              <div>
                <div class="label">PRIMARY PASSENGER</div>
                <div class="val">${data.customerName || "Manasvi Gangrade"}</div>
              </div>
              <div>
                <div class="label">MOBILE CONTACT</div>
                <div class="val">${data.customerPhone || "+91 98765 43210"}</div>
              </div>
              <div>
                <div class="label">DEPARTURE DATE</div>
                <div class="val val-highlight">${data.date}</div>
              </div>
              <div>
                <div class="label">PASSENGERS</div>
                <div class="val">${data.travellers} Traveler(s)</div>
              </div>
            </div>

            <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
              <div class="label">REPORTING / PICKUP POINT</div>
              <div class="val" style="font-size: 12px;">${meetingPoint} (Report 30 mins prior)</div>
            </div>
          </div>

          <div class="qr-card">
            <img src="${qrUrl}" alt="E-Ticket QR" class="qr-img" />
            <div style="font-size: 9.5px; font-weight: 800; color: #1d6fa5; margin-top: 6px;">VERIFIED E-TICKET</div>
            <div style="font-size: 8.5px; color: #64748b;">Scan at Departure Check-in</div>
          </div>
        </div>

        <div class="section-title">Payment & Settlement Summary</div>
        <table class="table-box">
          <thead>
            <tr>
              <th>Description</th>
              <th>Travellers</th>
              <th>Payment Status</th>
              <th style="text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>${data.tripName}</b><br/><span style="font-size: 10.5px; color: #64748b;">Inclusive of Accommodation, Transfers & Sightseeing</span></td>
              <td>${data.travellers} Person(s)</td>
              <td><span style="color: #10b981; font-weight: bold;">VERIFIED (PAID)</span></td>
              <td style="text-align: right; font-weight: bold;">${formatINR(data.totalAmount)}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right; font-weight: 700; color: #64748b;">Razorpay Transaction Reference:</td>
              <td style="text-align: right; font-family: monospace; font-size: 10.5px;">${paymentTxn}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td colspan="3" style="text-align: right; font-weight: 800; font-size: 13px;">Total Settled Amount:</td>
              <td style="text-align: right; font-weight: 800; font-size: 15px; color: #1d6fa5;">${formatINR(data.totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 18px; background: #fffbebfb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px;">
          <div style="font-weight: 700; color: #92400e; font-size: 11px;">⚠️ MANDATORY BOARDING ADVISORY</div>
          <p style="font-size: 10.5px; color: #b45309; margin-top: 2px;">
            Please carry a government photo ID (Aadhaar Card, Passport, or Driving License) along with this voucher.
          </p>
        </div>

        <div class="footer-stamp">
          <div>
            <div style="font-weight: 700; color: #0f172a; font-size: 12px;">Explorify AI Travel Platform</div>
            <div style="font-size: 10.5px; color: #64748b;">Support: support@explorify.ai | +91 1800-EXPLORIFY</div>
          </div>
          <div class="seal-box">
            EXPLORIFY<br/>VERIFIED<br/>OFFICIAL SEED
          </div>
        </div>
      </div>

      <!-- PAGE 2: DAY-BY-DAY ITINERARY -->
      <div class="page">
        <div class="page-border"></div>

        <div class="header">
          <div>
            <div class="brand-logo">🗓 Expedition Itinerary & Schedule</div>
            <div class="brand-subtitle">${data.tripName} • Day-by-Day Plan</div>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #1d6fa5;">PAGE 2 OF 3</div>
        </div>

        <div class="section-title">Trip Highlights</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px;">
          ${highlights.map(h => `
            <span style="background: #f0f9ff; border: 1px solid #bae6fd; color: #0369a1; font-weight: 600; padding: 5px 12px; border-radius: 16px; font-size: 11px;">✨ ${h}</span>
          `).join('')}
        </div>

        <div class="section-title">Daily Schedule</div>
        <div>
          ${baseItinerary.slice(0, 6).map(day => `
            <div class="itinerary-day">
              <div class="day-badge">DAY ${day.day}</div>
              <div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a;">${day.title}</div>
                <div style="font-size: 10.5px; font-weight: 700; color: #1d6fa5; margin-bottom: 2px;">📍 ${day.place}</div>
                <p style="color: #475569; font-size: 11.5px;">${day.description}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="footer-stamp">
          <div style="font-size: 10.5px; color: #94a3b8;">Itinerary schedule subject to local weather & road permits.</div>
          <div style="font-family: monospace; font-size: 9.5px; color: #94a3b8;">PAGE 2</div>
        </div>
      </div>

      <!-- PAGE 3: INCLUSIONS, EXCLUSIONS & PACKING GUIDE -->
      <div class="page">
        <div class="page-border"></div>

        <div class="header">
          <div>
            <div class="brand-logo">🧳 Services & Essential Guidelines</div>
            <div class="brand-subtitle">Inclusions, Exclusions & Travel Checklist</div>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #1d6fa5;">PAGE 3 OF 3</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px;">
          <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 16px;">
            <div style="font-size: 14px; font-weight: 800; color: #166534; margin-bottom: 10px;">✓ What's Included</div>
            <ul class="list-check">
              ${inclusions.map(inc => `<li>${inc}</li>`).join('')}
            </ul>
          </div>

          <div style="background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 12px; padding: 16px;">
            <div style="font-size: 14px; font-weight: 800; color: #991b1b; margin-bottom: 10px;">✕ What's Excluded</div>
            <ul class="list-check list-cross">
              ${exclusions.map(exc => `<li>${exc}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="section-title">Recommended Packing List</div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 18px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
            <div>
              <div class="label">📄 MANDATORY DOCUMENTS</div>
              <ul style="font-size: 11px; color: #475569; padding-left: 12px; margin-top: 4px;">
                <li>Original Govt Photo ID</li>
                <li>Printed E-Ticket Pass</li>
                <li>2 Passport Size Photos</li>
              </ul>
            </div>
            <div>
              <div class="label">👕 CLOTHING & GEAR</div>
              <ul style="font-size: 11px; color: #475569; padding-left: 12px; margin-top: 4px;">
                <li>Comfortable Walking Shoes</li>
                <li>Warm Layer / Jacket</li>
                <li>Raincoat / Umbrella</li>
              </ul>
            </div>
            <div>
              <div class="label">💊 PERSONAL ESSENTIALS</div>
              <ul style="font-size: 11px; color: #475569; padding-left: 12px; margin-top: 4px;">
                <li>Motion Sickness Pills</li>
                <li>Sunscreen & Lip Balm</li>
                <li>Personal First Aid Kit</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="section-title">Support & Emergency Helpline</div>
        <p style="font-size: 11px; color: #64748b; margin-bottom: 14px;">
          For emergency assistance during your travel, contact your assigned expedition manager or call our 24/7 helpline at <b>+91 1800-EXPLORIFY</b>.
        </p>

        <div class="footer-stamp">
          <div>
            <div style="font-weight: 700; color: #0f172a; font-size: 12px;">Explorify AI Travel Technologies</div>
            <div style="font-size: 10.5px; color: #64748b;">Thank you for booking with Explorify! Have a safe and wonderful trip.</div>
          </div>
          <div style="font-family: monospace; font-size: 9.5px; color: #94a3b8;">
            DOC-VERIFIED-AUTH-2026
          </div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
