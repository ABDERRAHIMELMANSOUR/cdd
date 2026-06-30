import slugify from "slugify";

export function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}
export function optStr(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v === "" ? null : v;
}
export function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === "on" || fd.get(key) === "true";
}
export function int(fd: FormData, key: string, fallback = 0): number {
  const n = parseInt(str(fd, key), 10);
  return Number.isNaN(n) ? fallback : n;
}
export function lines(fd: FormData, key: string): string[] {
  return str(fd, key)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}
export function makeSlug(input: string): string {
  return slugify(input, { lower: true, strict: true });
}
