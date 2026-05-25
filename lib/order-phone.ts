/** ລຶບອັກຂະລະທີ່ບໍ່ແມ່ນຕົວເລກ (ຮັກສາ 0 ນຳໜ້າເບີລາວ) */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function phonesMatch(a: string, b: string): boolean {
  const da = normalizePhone(a);
  const db = normalizePhone(b);
  if (!da || !db) return false;
  if (da === db) return true;
  if (da.length >= 8 && db.length >= 8) {
    return da.endsWith(db.slice(-8)) || db.endsWith(da.slice(-8));
  }
  return da.endsWith(db) || db.endsWith(da);
}
