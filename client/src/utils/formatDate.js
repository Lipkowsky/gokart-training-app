
export function formatDate(dateString) {
  if (!dateString) return "Brak daty";

  const date = new Date(dateString);

  return date.toLocaleString("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
