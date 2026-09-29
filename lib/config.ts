// Change these to match the cafe.
export const CAFE = {
  name: "Kafe Singgah Sana",
  tagline: "KAFE PALING BEST DI REMBAU.",
  address: "Rembau, Negeri Sembilan",
  wazeName: "Balai Seri Andika",
  wazeLink: "https://waze.com/ul?q=Balai%20Seri%20Andika&navigate=yes",
  whatsapp: "60123456789", // cafe's WhatsApp number, no + or spaces
  bookingText: "Booking weekday sahaja",
  openDaysText: "Khamis - Selasa, Rabu TUTUP",
  hoursText: "11AM - 6PM",
  openTime: "11:00", // first booking slot
  closeTime: "17:00", // last booking slot (cafe closes 6PM)
  slotMinutes: 30,
  maxPax: 12,
  tables: 10,
  // Days customers can book: 0 = Sunday, 1 = Monday ... 6 = Saturday
  bookingDays: [1, 2, 4, 5],
};

export function timeSlots(): string[] {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const slots: string[] = [];
  for (let t = toMin(CAFE.openTime); t <= toMin(CAFE.closeTime); t += CAFE.slotMinutes) {
    const h = String(Math.floor(t / 60)).padStart(2, "0");
    const m = String(t % 60).padStart(2, "0");
    slots.push(h + ":" + m);
  }
  return slots;
}

export const rm = (n: number | string) => "RM " + Number(n).toFixed(2);

// Today's date in Malaysia as YYYY-MM-DD
export function todayMY(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(new Date());
}

// "0123456789" -> "60123456789" for wa.me links
export function waNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("60")) return digits;
  if (digits.startsWith("0")) return "6" + digits;
  return digits;
}

// Is this date (YYYY-MM-DD) a day customers can book?
export function isBookingDay(date: string): boolean {
  if (!date) return false;
  const day = new Date(date + "T00:00:00").getDay();
  return CAFE.bookingDays.includes(day);
}