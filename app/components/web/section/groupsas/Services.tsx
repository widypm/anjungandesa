"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { findMediaUrlByType } from "../../../../lib/helper";

type Props = {
  dataApi: any;
};

export default function Services({ dataApi }: Props) {
  return (
    <section
      id="services"
      className="max-w-7xl mx-auto px-6 py-20 border-t border-green-600"
    >
      {/* Judul */}
      <motion.h2
        className="text-4xl text-green-600 font-extrabold text-center mb-16 tracking-wide text-slate-900"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ amount: 0.2 }}
      >
        {dataApi?.category?.pageTranslations?.[0]?.title}
      </motion.h2>

      {/* Grid Layanan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {dataApi?.category?.pageCategories?.map((rw, index) => {
          const direction = index % 2 === 0 ? -50 : 50; // kiri/kanan
          const slug = rw?.page?.translations?.[0]?.slug || "#";

          return (
            <Link href={`/${slug}`} key={"layanan" + index} className="group">
              <motion.article
                className="bg-white rounded-xl shadow-md p-8 text-center flex flex-col items-center cursor-pointer transition-transform duration-200 group-hover:scale-105 group-hover:shadow-lg"
                initial={{ opacity: 0, x: direction }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ amount: 0.3 }}
              >
                <img
                  alt="Ilustrasi layanan"
                  className="mb-6 h-28 w-28 rounded-full border border-sky-400 object-cover"
                  loading="lazy"
                  src={findMediaUrlByType(rw?.page?.mediaPages, "media_image")}
                />
                <h3 className="text-2xl font-bold text-sky-600 mb-3">
                  {rw?.page?.translations?.[0]?.title}
                </h3>
                <div
                  dangerouslySetInnerHTML={{
                    __html: rw?.page?.translations?.[0]?.overview,
                  }}
                />
                <div className="mt-4 inline-block px-4 py-2 bg-sky-500 text-white rounded-full text-sm font-medium hover:bg-sky-600 transition-colors duration-200">
                  Learn More →
                </div>
              </motion.article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
