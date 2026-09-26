// Change these to match your cousin's cafe.
export const CAFE = {
  name: "Kafe Singgah Sana",
  tagline: "Singgah sekejap, rasa macam rumah.",
  address: "Shah Alam, Selangor",
  whatsapp: "60123456789", // cafe's WhatsApp number, no + or spaces
  openTime: "10:00", // first booking slot
  closeTime: "22:00", // last booking slot
  slotMinutes: 30,
  maxPax: 12,
  tables: 10, // default number of tables for the QR page
};

// "10:00", "10:30", ... up to closeTime
export function timeSlots(): string[] {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const slots: string[] = [];
  for (let t = toMin(CAFE.openTime); t <= toMin(CAFE.closeTime); t += CAFE.slotMinutes) {
    const h = String(Math.floor(t / 60)).padStart(2, "0");
    const m = String(t % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
  }
  return slots;
}

export const rm = (n: number | string) => `RM ${Number(n).toFixed(2)}`;

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
