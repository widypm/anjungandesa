"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { findMediaUrlByType } from "app/lib/helper";

type Props = {
  dataApi: any;
};
const preloadImage = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const img: HTMLImageElement = document.createElement("img");
    img.src = src;
    img.onload = () => resolve();
    img.onerror = reject;
  });
export default function Hero({ dataApi }: Props) {
  const [current, setCurrent] = useState(0);
  const slides = dataApi?.category?.pageCategories?.map((slide, index) => ({
    id: slide.id ?? index + 1, // kalau tidak ada id, ambil index + 1
    url: findMediaUrlByType(slide?.page?.mediaPages, "media_banner"),
    title: slide?.page?.translations[0]?.title,
    subtitle: slide?.page?.translations[0]?.subTitle,
    cta: slide?.page?.translations[0]?.overview,
  }));
  // Auto slide (opsional)
  useEffect(() => {
    const timer = setInterval(() => {
      handleSlideChange((current + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [current]);

  const handleSlideChange = async (index: number) => {
    await preloadImage(slides[index].url);
    setCurrent(index);
  };

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background slides */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.img
          key={slides[current].id}
          src={slides[current].url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6">
        <motion.h1
          key={slides[current].title}
          className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {slides[current].title}
        </motion.h1>
        <motion.p
          key={slides[current].subtitle}
          className="mt-4 text-lg md:text-2xl text-white/90 max-w-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {slides[current].subtitle}
        </motion.p>
        <motion.div
          className="mt-8 px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold shadow-lg hover:from-sky-700 hover:to-purple-700 transition"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          dangerouslySetInnerHTML={{ __html: slides[current].cta }}
        ></motion.div>

        {/* Bulletpoint navigation */}
        <div className="flex gap-3 mt-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideChange(index)}
              className={`w-4 h-4 rounded-full transition ${
                index === current
                  ? "bg-sky-600 scale-110"
                  : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
