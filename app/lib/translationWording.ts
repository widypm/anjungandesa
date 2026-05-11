import id from "@/../public/wording/id.json";
import en from "@/../public/wording/en.json";
type Lang = "ID" | "EN";
const translations: Record<Lang, Record<string, string>> = {
  ID: id,
  EN: en,
};
function formatKey(key: string): string {
  return key
    .replaceAll("_", " ") // ganti underscore jadi spasi
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase() // kapitalisasi tiap kata
    );
}
export function wordingTr(lang: string, key: string) {
  // validasi dulu
  const safeLang: Lang = lang === "EN" ? "EN" : "ID";

  return translations[safeLang][key] || formatKey(key);
}
