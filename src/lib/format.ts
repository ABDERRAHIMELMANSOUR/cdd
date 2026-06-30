export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(date).toLocaleDateString(
    "fr-FR",
    opts ?? { day: "numeric", month: "long", year: "numeric" }
  );
}
