"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { findImage } from "../../../../lib/helper";

type ContentItem = {
  id: number;
  slug: string;
  title: string;
  overview: string;
  thumbnail: string;
  createdAt: string;
  createdBy: string;
};
type Props = {
  dataApi: any;
  dataAll: any;
};
export default function ListOfContent({ dataApi, dataAll }: Props) {
  const perPage = 6;
  const [visibleCount, setVisibleCount] = useState(perPage);

  // Hardcode dummy data
  //   const dataApi: ContentItem[] = [
  //     {
  //       id: 1,
  //       slug: "pembuatan-website",
  //       title: "Pembuatan Website",
  //       overview: "Kami menyediakan layanan pembuatan website profesional.",
  //       thumbnail: "https://source.unsplash.com/600x400/?website,design",
  //       createdAt: "2025-08-01",
  //       createdBy: "Admin",
  //     },
  //     {
  //       id: 2,
  //       slug: "digital-marketing",
  //       title: "Digital Marketing",
  //       overview: "Strategi digital marketing untuk mengembangkan bisnismu.",
  //       thumbnail: "https://source.unsplash.com/600x400/?marketing,digital",
  //       createdAt: "2025-08-03",
  //       createdBy: "Budi",
  //     },
  //     {
  //       id: 3,
  //       slug: "seo-optimization",
  //       title: "SEO Optimization",
  //       overview: "Optimasi SEO agar websitemu muncul di halaman pertama Google.",
  //       thumbnail: "https://source.unsplash.com/600x400/?seo,search",
  //       createdAt: "2025-08-05",
  //       createdBy: "Siti",
  //     },
  //     {
  //       id: 4,
  //       slug: "app-development",
  //       title: "App Development",
  //       overview: "Pengembangan aplikasi mobile dan desktop sesuai kebutuhan.",
  //       thumbnail: "https://source.unsplash.com/600x400/?app,development",
  //       createdAt: "2025-08-07",
  //       createdBy: "Rudi",
  //     },
  //     {
  //       id: 5,
  //       slug: "content-writing",
  //       title: "Content Writing",
  //       overview: "Jasa penulisan konten untuk website dan media sosial.",
  //       thumbnail: "https://source.unsplash.com/600x400/?writing,content",
  //       createdAt: "2025-08-08",
  //       createdBy: "Ani",
  //     },
  //     {
  //       id: 6,
  //       slug: "graphic-design",
  //       title: "Graphic Design",
  //       overview: "Desain grafis kreatif untuk branding dan promosi.",
  //       thumbnail: "https://source.unsplash.com/600x400/?graphic,design",
  //       createdAt: "2025-08-09",
  //       createdBy: "Rina",
  //     },
  //     {
  //       id: 7,
  //       slug: "cyber-security",
  //       title: "Cyber Security",
  //       overview: "Lindungi data dan sistem bisnismu dari ancaman digital.",
  //       thumbnail: "https://source.unsplash.com/600x400/?cyber,security",
  //       createdAt: "2025-08-10",
  //       createdBy: "Andi",
  //     },
  //   ];

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + perPage);
  };
  //   console.log("datasss",dataApi)

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 pt-28">
      {/* Header dengan background blur */}
      <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-12">
        {/* Background Image */}
        <img
          src={
            findImage(
              dataAll?.page?.mediaPages,
              dataAll?.langCode,
              "media_banner"
            )?.url
          }
          alt="Header background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay blur */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        {/* Judul */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <h2 className="text-4xl font-extrabold text-white drop-shadow-lg tracking-wide">
            📚 {dataAll?.title}
          </h2>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {dataApi?.category?.pageCategories
          ?.slice(0, visibleCount)
          .map((item, index) => (
            <motion.article
              key={item?.page?.translations?.[0]?.id}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              {/* Thumbnail */}
              <a href={`/${item?.page?.translations?.[0]?.slug}`}>
                <img
                  src={
                    findImage(
                      item?.page?.mediaPages,
                      dataAll?.langCode,
                      "media_thumbnail"
                    )?.url
                  }
                  alt={item?.page?.translations?.[0]?.title}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                />
              </a>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <a href={`/${item?.page?.translations?.[0]?.slug}`}>
                  <h3 className="text-xl font-bold text-slate-800 hover:text-green-600 transition-colors">
                    {item?.page?.translations?.[0]?.title}
                  </h3>
                </a>

                <div
                  className="text-slate-600 mt-2 text-sm"
                  dangerouslySetInnerHTML={{
                    __html: item?.page?.translations?.[0]?.overview,
                  }}
                ></div>

                {/* Meta info */}
                <div className="mt-auto pt-4 text-xs text-gray-500 border-t">
                  <span>
                    📅 {dayjs(item?.page?.createdAt).format("DD MMM YYYY")}
                  </span>{" "}
                  | <span>✍️ {item?.page?.createBy}</span>
                </div>
              </div>
            </motion.article>
          ))}
      </div>

      {/* Load More Button */}
      {visibleCount < dataApi?.category?.pageCategories.length && (
        <div className="mt-10 text-center">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
