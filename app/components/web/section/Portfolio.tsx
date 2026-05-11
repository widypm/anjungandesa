"use client";

import React from "react";
import { motion } from "framer-motion";
import { findMediaUrlByType } from "../../../lib/helper";

type Props = {
  dataApi: any;
};

export default function Portfolio({ dataApi }: Props) {
  return (
    <section
      id="portfolio"
      className="bg-white py-20 border-t border-purple-600 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Judul */}
        <motion.h2
          className="text-4xl text-purple-600 font-extrabold text-center mb-16 tracking-wide text-slate-900"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ amount: 0.4 }}
        >
          {dataApi?.category?.pageTranslations?.[0]?.title}
        </motion.h2>

        {/* Grid Portfolio */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.3 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 },
            },
          }}
        >
          {dataApi?.category?.pageCategories?.map((rw, index) => (
            <motion.article
              key={"portfolio" + index}
              className="bg-slate-50 rounded-xl shadow-md text-center hover:shadow-xl transition-transform hover:scale-[1.02]"
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <img
                alt="Tampilan aplikasi atau website klien"
                className="w-full object-cover h-48 rounded-t-xl"
                height="400"
                loading="lazy"
                src={findMediaUrlByType(rw?.page?.mediaPages, "media_image")}
                width="600"
              />
              <div className="w-full p-4">
                <h3 className="text-2xl font-bold text-sky-600 mb-2">
                  {rw?.page?.translations?.[0]?.title}
                </h3>
                <div
                  className="text-slate-600 text-sm"
                  dangerouslySetInnerHTML={{
                    __html: rw?.page?.translations?.[0]?.overview,
                  }}
                />
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
