"use client";

import { useState } from "react";
import { FetchData } from "../../../../lib/helper";
import { usePathname } from "next/navigation";

type Props = {
  dataApi: any;
};

export default function Footer({ dataApi }: Props) {
  const pathname = usePathname();
  const slug = pathname.split("/")[1];
  const [lang, setLang] = useState<"ID" | "EN">(dataApi?.langCode);
  const [isLangLoading, setIsLangLoading] = useState(false);

  const flagIcon = lang === "ID" ? "🇺🇸" : "🇮🇩";
  const flagLabel = lang === "ID" ? "EN" : "ID";

  return (
    <footer className="bg-gradient-to-r from-sky-600 to-purple-700 text-white py-10 mt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Logo & Deskripsi */}
        <div>
          <a href={dataApi?.navigation[0]?.url}>
            <img
              src="/images/sas_transparent.png"
              className="w-32 drop-shadow mb-4"
              alt="Logo"
            />
          </a>
          <p className="text-sm text-gray-100 leading-relaxed">
            {lang === "ID"
              ? "Kami adalah penyedia jasa cleaning service profesional yang siap menciptakan lingkungan bersih, sehat, dan nyaman."
              : "We are a professional cleaning service provider dedicated to creating a clean, healthy, and comfortable environment."}
          </p>
        </div>

        {/* Navigasi */}
        <div>
          <h4 className="font-semibold text-lg mb-4">Navigasi</h4>
          <ul className="space-y-2">
            {dataApi?.navigation?.map((rw: any, index: number) => (
              <li key={index}>
                <a
                  href={rw?.url}
                  className="hover:text-yellow-300 transition-colors"
                >
                  {rw?.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Ganti Bahasa */}
        <div>
          <h4 className="font-semibold text-lg mb-4">
            {lang === "ID" ? "Bahasa" : "Language"}
          </h4>
          <button
            onClick={async () => {
              setIsLangLoading(true);
              try {
                const url =
                  "api/fe/v1/changelang?slug=" +
                  encodeURIComponent(slug) +
                  "&lang=" +
                  encodeURIComponent(flagLabel);

                const data = await FetchData(url, "GET", "", false, "", false);
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
              "flex items-center gap-2 px-4 py-2 border border-white rounded-full text-sm font-medium hover:bg-white hover:text-purple-700 transition-all duration-200"
            }
          >
            <span className="text-lg">{flagIcon}</span>
            {flagLabel}
          </button>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/20 mt-10 pt-6 text-center text-sm text-gray-100">
        © {new Date().getFullYear()} Smart Cleaning Service. All rights
        reserved.
      </div>
    </footer>
  );
}
