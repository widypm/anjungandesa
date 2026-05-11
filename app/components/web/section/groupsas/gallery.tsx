"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { findMediaUrlByType } from "app/lib/helper";

const images = [
  "/images/gallery1.jpg",
  "/images/gallery2.jpg",
  "/images/gallery3.jpg",
  "/images/gallery4.jpg",
  "/images/gallery5.jpg",
  "/images/gallery6.jpg",
];
type Props = {
  dataApi: any;
};
export default function GallerySection({ dataApi }: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // console.log("Gallery", dataApi);
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        <h2 className="text-3xl font-bold  text-sky-600 mb-12">
          {dataApi?.category?.pageTranslations[0].title}
        </h2>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {dataApi?.category?.pageCategories?.map((src, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer overflow-hidden rounded-xl shadow-md"
              onClick={() =>
                setSelectedImage(
                  findMediaUrlByType(src?.page?.mediaPages, "media_image")
                )
              }
            >
              <img
                src={findMediaUrlByType(src?.page?.mediaPages, "media_image")}
                alt={`Gallery ${index + 1}`}
                className="w-full h-48 object-cover"
              />
            </motion.div>
          ))}
        </div>

        {/* Popup Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
            >
              {/* Image Container */}
              <motion.div
                className="relative max-w-4xl w-full px-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedImage}
                  alt="Popup"
                  className="w-full max-h-[80vh] object-contain rounded-lg"
                />
                {/* Close Button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md"
                >
                  <FiX size={24} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
