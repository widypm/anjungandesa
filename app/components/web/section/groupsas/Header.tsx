"use client";

import { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp, FiMenu, FiX } from "react-icons/fi";
import { FetchData } from "../../../../lib/helper";
import { usePathname } from "next/navigation";

type Props = {
  dataApi: any;
  isPrimary: boolean;
};

export default function Header({ dataApi, isPrimary }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [lang, setLang] = useState<"ID" | "EN">(dataApi?.langCode);
  const pathname = usePathname();
  const slug = pathname.split("/")[1];
  const [isLangLoading, setIsLangLoading] = useState(false);

  const flagIcon = lang === "ID" ? "🇺🇸" : "🇮🇩";
  const flagLabel = lang === "ID" ? "EN" : "ID";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20); // aktif kalau scroll lebih dari 20px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header
      className={`fixed w-full z-40 transition-all duration-300 ${
        scrolled || !isPrimary
          ? "bg-card-gradient backdrop-blur shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <a
          className="text-3xl font-extrabold bg-gradient-to-r from-sky-500 to-purple-600 text-transparent bg-clip-text tracking-widest"
          href={dataApi?.navigation[0].url}
        >
          <img
            src="/images/sas_transparent.png"
            className="w-32 drop-shadow"
            alt="Logo"
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="flex items-center gap-6">
          <ul className="hidden md:flex space-x-8 font-medium text-white">
            {dataApi?.navigation?.map((rw: any, index: number) => (
              <li key={index} className="relative group">
                <a
                  className="hover:font-bold flex items-center relative pb-1 transition-colors duration-200"
                  href={rw?.children?.length > 0 ? "#" : rw?.url}
                >
                  {rw?.title}
                  {rw?.children?.length > 0 && (
                    <FiChevronDown className="ml-1 text-sm transition-transform duration-300 group-hover:rotate-180" />
                  )}
                  {/* Underline animasi sliding */}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-sky-500 to-green-500 transition-all duration-300 group-hover:w-full"></span>
                </a>

                {/* Dropdown Desktop */}
                {rw?.children?.length > 0 && (
                  <ul className="absolute left-0 mt-3 w-60 bg-black/50 backdrop-blur rounded-xl shadow-lg opacity-0 scale-95 transform transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 overflow-hidden">
                    {rw.children.map((child: any, idx: number) => (
                      <li key={idx}>
                        <a
                          href={child.url}
                          className="block px-5 py-3 hover:text-black hover:bg-gradient-to-r hover:from-sky-50 hover:to-purple-50 transition-colors duration-200"
                        >
                          {child.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {/* Tombol ganti bahasa (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={async () => {
                setIsLangLoading(true);
                try {
                  const url =
                    "api/fe/v1/changelang?slug=" +
                    encodeURIComponent(slug) +
                    "&lang=" +
                    encodeURIComponent(flagLabel);

                  const data = await FetchData(
                    url,
                    "GET",
                    "",
                    false,
                    "",
                    false
                  );
                  if (data?.data?.slug) {
                    window.location.assign("/" + data?.data?.slug);
                  } else {
                    setLang(lang === "ID" ? "EN" : "ID");
                  }
                } finally {
                  setIsLangLoading(false);
                }
              }}
              disabled={isLangLoading}
              className={
                (isLangLoading ? "opacity-50 cursor-not-allowed " : " ") +
                "flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-full text-sm font-medium text-white hover:border-purple-500 hover:text-purple-600 transition-all duration-200"
              }
            >
              <span className="text-lg">{flagIcon}</span>
              {flagLabel}
            </button>
          </div>

          {/* Hamburger Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-sky-600 text-3xl p-3 rounded-lg hover:bg-black-50 transition"
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden bg-black/50 backdrop-blur border-t border-gray-200 backdrop-blur animate-slideDown">
          <ul className="flex flex-col space-y-4 px-6 py-6 font-medium text-white">
            {dataApi?.navigation?.map((rw: any, index: number) => (
              <li key={index}>
                <div
                  className="flex justify-between items-center cursor-pointer hover:text-purple-600 transition-colors py-2"
                  onClick={() =>
                    setOpenDropdown(openDropdown === index ? null : index)
                  }
                >
                  <span className="flex items-center">{rw?.title}</span>
                  {rw?.children?.length > 0 &&
                    (openDropdown === index ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </div>

                {/* Dropdown Mobile */}
                {openDropdown === index && rw?.children?.length > 0 && (
                  <ul className="mt-2 ml-4 space-y-2 border-l pl-4 border-purple-200">
                    {rw.children.map((child: any, idx: number) => (
                      <li key={idx}>
                        <a
                          href={child.url}
                          className="block hover:text-purple-600 transition-colors py-1"
                        >
                          {child.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}

            {/* Tombol ganti bahasa (Mobile) */}
            <li className="pt-4 border-t border-gray-200">
              <button
                onClick={async () => {
                  setIsLangLoading(true);
                  try {
                    const url =
                      "api/fe/v1/changelang?slug=" +
                      encodeURIComponent(slug) +
                      "&lang=" +
                      encodeURIComponent(flagLabel);

                    const data = await FetchData(
                      url,
                      "GET",
                      "",
                      false,
                      "",
                      false
                    );
                    if (data?.data?.slug) {
                      window.location.assign("/" + data?.data?.slug);
                    } else {
                      setLang(lang === "ID" ? "EN" : "ID");
                    }
                  } finally {
                    setIsLangLoading(false);
                  }
                }}
                disabled={isLangLoading}
                className={
                  (isLangLoading ? "opacity-50 cursor-not-allowed " : " ") +
                  "flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:border-purple-500 hover:text-purple-600 transition-all duration-200 w-full justify-center"
                }
              >
                <span className="text-lg">{flagIcon}</span>
                {flagLabel}
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* Animasi CSS */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease forwards;
        }
      `}</style>
    </header>
  );
}
