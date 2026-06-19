/** Strip everything except 0-9 — for phone / numeric-only text fields. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}
