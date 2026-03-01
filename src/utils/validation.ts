// Mock "taken" lists for demo; replace with API calls later.
const TAKEN_NICKNAMES = ["admin", "support", "work speak"];
const TAKEN_EMAILS = ["taken@example.com", "support@workspeak.com"];

export function isValidEmail(s: string): boolean {
  if (!s?.trim()) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(s.trim());
}

export function checkNicknameAvailable(
  value: string,
  currentUserNickname: string
): Promise<boolean> {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return Promise.resolve(false);
  if (trimmed === currentUserNickname.trim().toLowerCase()) return Promise.resolve(true);
  const taken = TAKEN_NICKNAMES.map((n) => n.toLowerCase()).includes(trimmed);
  return Promise.resolve(!taken);
}

export function checkEmailAvailable(
  value: string,
  currentUserEmail: string
): Promise<boolean> {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return Promise.resolve(false);
  if (trimmed === currentUserEmail.trim().toLowerCase()) return Promise.resolve(true);
  const taken = TAKEN_EMAILS.map((e) => e.toLowerCase()).includes(trimmed);
  return Promise.resolve(!taken);
}
