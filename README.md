# Explorify AI — Multi-Agent AI Travel Planner & Marketplace

> **Unified Multi-Modal Travel Platform for India**: Powered by a high-performance **Rust AWS Lambda Multi-Agent Engine**, **Next.js 14 Marketplace**, and **IRCTC Indian Railways Integration**.

---

## Overview

**Explorify AI** is an end-to-end multi-agent travel planning and marketplace platform. It converts natural language trip preferences (source, destination, travel dates, passenger counts, budget, and special interests) into personalized, real-time travel itineraries featuring live flight options, handpicked stay accommodations, and detailed day-by-day routes across India.

### Core Highlights
- **Rust Multi-Agent Lambda Engine**: Built with Rust & Gemini API for fast, streaming response generation.
- **IRCTC & Multi-Modal Travel Integration**: Combines Vande Bharat / Rajdhani Express trains, flight choices, and hotel bookings in a single platform.
- **Fail-Safe Dynamic Trip Generator**: Guarantees zero-downtime trip generation with client-side fallback fallback logic.
- **Razorpay & AWS DynamoDB**: Integrated payments, bookings database, and user authentication via NextAuth.

---

## Architecture & Ecosystem

The repository is organized into sub-modules:

```text
Explorify-AI--Multi-Agent-Travel-Planner-with-LangGraph/
├── Explorify-Marketplace-Website/   # Next.js 14 App Router Marketplace & Planner
├── Explorify-Travel-Planner/        # Rust AWS Lambda Multi-Agent Backend Engine
└── Explorify-Frontend/              # Standalone React + Vite Frontend Client
```

### 1. `Explorify-Marketplace-Website` (Next.js 14)
- **Framework**: Next.js 14, React 18, TailwindCSS, TypeScript.
- **Styling**: `#1a213a` Navy Charcoal palette, Framer Motion animations, Lucide icons, Sonner toasts.
- **APIs**:
  - `/api/travel-planner/ask`: Real-time HTTP streaming bridge to AWS Lambda engine.
  - `/api/places/autocomplete`: Google Places API integration for location search.

### 2. `Explorify-Travel-Planner` (Rust AWS Lambda Backend)
- **Language & Runtime**: Rust (2024 edition), `tokio`, `lambda_runtime`.
- **LLM Engine**: `gemini-client-api` (Google Gemini 2.0 model).
- **Tools**:
  - `flight_search`: Real-time flight search & deep booking link constructor.
  - `trains_search`: IRCTC train route search with seat availability (`1A`, `2A`, `3A`, `CC`, `SL`).
  - `get_hotel_details`: Hotel research & booking link provider.
  - `get_about_place`: Google Maps places & image URL lookup.

---

## Quick Start & Local Setup

### Prerequisites
- **Node.js**: `v18.x` or higher
- **Rust**: `1.75+` (for Lambda backend development)
- **Environment Variables**: Setup `.env.local` inside `Explorify-Marketplace-Website/`.

### 1. Running the Marketplace Website (Next.js)

```bash
cd Explorify-Marketplace-Website
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Running the Standalone Frontend (Vite)

```bash
cd Explorify-Frontend
npm install
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## Environment Configuration

Create a `.env.local` file inside `Explorify-Marketplace-Website/.env.local`:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# AWS DynamoDB & S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1

# Razorpay Keys
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Production Keys for Rust Lambda & Maps
API_SECRET=your_api_secret
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GEMINI_API_KEY=your_gemini_api_key
```

---

## Multi-Agent Workflow

```
[User Trip Form Input] 
       │
       ▼
[Next.js API Gateway (/api/travel-planner/ask)]
       │
       ▼
[Rust AWS Lambda Multi-Agent Engine]
       ├──► Flight Agent (Searches Direct & Connecting Flights)
       ├──► Train Agent (IRCTC Route & Seat Class Finder)
       ├──► Hotel Agent (Handpicked Stays & Vouchers)
       └──► Itinerary Agent (Day-by-Day Activity Generator)
       │
       ▼
[Real-Time JSON Stream to Next.js Frontend]
       │
       ▼
[Stunning UI Cards: Flights, Stays & Daily Route]
```

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p center>Crafted for Explorify Trips Pvt. Ltd.</p>
