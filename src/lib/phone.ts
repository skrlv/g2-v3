/**
 * Телефон: форматирование при вводе и нормализация на сервере.
 * Российские номера (+7 / 8) приводятся к виду +7 (999) 123-45-67;
 * остальные страны — «+» и цифры без маски, чтобы не ломать иностранные номера.
 */

const RU_LENGTH = 11;

/** Только цифры; ведущая «8» у российского номера заменяется на «7». */
export function phoneDigits(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.length === RU_LENGTH && digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (digits.length === 10 && !value.trim().startsWith("+")) digits = "7" + digits;
  return digits;
}

/** Значение поля по мере ввода: маска для +7, свободный формат для других стран. */
export function formatPhoneInput(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  const foreign = raw.startsWith("+") && !raw.startsWith("+7") && !raw.startsWith("+8");
  if (foreign) return "+" + raw.slice(1).replace(/[^\d\s()-]/g, "").slice(0, 20);

  const digits = phoneDigits(raw).slice(0, RU_LENGTH);
  if (!digits) return raw.startsWith("+") ? "+" : "";
  const country = digits.startsWith("7") ? "7" : "7";
  const rest = digits.startsWith("7") ? digits.slice(1) : digits;
  let out = `+${country}`;
  if (rest.length) out += ` (${rest.slice(0, 3)}`;
  if (rest.length >= 3) out += ")";
  if (rest.length > 3) out += ` ${rest.slice(3, 6)}`;
  if (rest.length > 6) out += `-${rest.slice(6, 8)}`;
  if (rest.length > 8) out += `-${rest.slice(8, 10)}`;
  return out;
}

/** Нормализованный номер для базы: «+» и цифры. null — номер неполный. */
export function normalizePhone(value: string): string | null {
  const digits = phoneDigits(value);
  if (digits.length < 10 || digits.length > 15) return null;
  if (digits.startsWith("7") && digits.length !== RU_LENGTH) return null;
  return `+${digits}`;
}

/** Красивая запись для писем и Telegram. */
export function formatPhone(value: string): string {
  const digits = phoneDigits(value);
  if (digits.length === RU_LENGTH && digits.startsWith("7")) return formatPhoneInput(digits);
  return value.startsWith("+") ? value : `+${digits}`;
}
