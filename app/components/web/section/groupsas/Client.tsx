"use client";

import { findMediaUrlByType } from "app/lib/helper";
import { motion } from "framer-motion";
import { FiAward } from "react-icons/fi";

type Props = {
  dataApi: any;
};
export default function ClientSection({ dataApi }: Props) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        {/* Title dengan Icon */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <FiAward className="text-sky-600 text-2xl" />
          <h2 className="text-2xl font-bold text-sky-600">
            {dataApi?.category?.pageTranslations[0].title}
          </h2>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center">
          {dataApi?.category?.pageCategories?.map((client, index) => (
            <motion.div
              key={index}
              className="flex justify-center"
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.3 }}
              viewport={{ amount: 0.3 }}
            >
              <img
                src={findMediaUrlByType(
                  client?.page?.mediaPages,
                  "media_image"
                )}
                alt={`Client ${index + 1}`}
                className="h-12 object-contain"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
