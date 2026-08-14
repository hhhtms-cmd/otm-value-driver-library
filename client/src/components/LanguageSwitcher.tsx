/* Design reminder: the language selector is an archive tab, using coded abbreviations rather than generic dropdown chrome. */
import { useLanguage, type Language } from "@/contexts/LanguageContext";

const languages: Array<{ id: Language; label: string; title: string }> = [
  { id: "en", label: "EN", title: "English" },
  { id: "es", label: "ES", title: "Español" },
  { id: "zh", label: "中", title: "中文" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return <div className="language-switcher" role="group" aria-label="Language selector">{languages.map((item) => <button key={item.id} title={item.title} className={language === item.id ? "active" : ""} aria-pressed={language === item.id} onClick={() => setLanguage(item.id)}>{item.label}</button>)}</div>;
}
