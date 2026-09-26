# Kafe Singgah Sana

A booking and QR ordering system I built for my cousin's cafe.

Customers can **book a table** ahead of time, or **scan the QR code on their table** to order from their phone. No app to install, no account needed. Staff get a live dashboard where new orders and bookings pop up on their own.

## What it does

| Page | Who | What |
|---|---|---|
| `/` | Customers | Cafe info and menu |
| `/book` | Customers | Reserve a date, time and number of people |
| `/t/5` | Customers at table 5 | Browse menu, add to cart, place order, track status |
| `/admin` | Staff | Live orders board, bookings (with one-tap WhatsApp reply), menu editor, printable table QR codes |

## Tech

- **Next.js 16** (App Router, TypeScript, Tailwind CSS)
- **Supabase** (Postgres, Auth, Realtime)
- **Vercel** for hosting

## Security notes

The browser talks to the database directly, so the database itself has to enforce the rules. That's done with Postgres **Row Level Security**:

- Customers can read the menu and create bookings, but can't read anyone else's bookings or orders.
- Orders go through a `place_order()` database function that looks up **prices from the menu itself**, so changing a price in the browser does nothing.
- Booking rules (no past dates, sensible party size and field lengths) are checked in the database, not just in the form.
- Being logged in isn't enough to see the dashboard. The account must also be listed in the `staff` table, and public sign-ups are turned off.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL and publishable key
npm run dev
```

Set up the database by running `supabase/01-tables.sql` and then `supabase/02-security-and-functions.sql` in the Supabase SQL Editor.
