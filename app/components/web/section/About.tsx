"use client";

import { motion } from "framer-motion";

type Props = {
  dataApi: any;
};

export default function About({ dataApi }: Props) {
  return (
    <section className="relative py-12 bg-white">
      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-sky-600 mb-4">Tentang Kami</h2>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            Kami adalah perusahaan penyedia{" "}
            <span className="font-semibold">
              jasa cleaning service profesional
            </span>{" "}
            yang berkomitmen untuk memberikan lingkungan kerja dan hunian yang{" "}
            <span className="font-semibold">bersih, sehat, dan nyaman</span>.
            Dengan tim berpengalaman dan peralatan modern, kami melayani
            berbagai kebutuhan kebersihan mulai dari perkantoran, gedung, rumah
            tangga, hingga fasilitas publik.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Visi kami adalah menciptakan standar baru dalam pelayanan kebersihan
            dengan mengedepankan kualitas, ketepatan waktu, serta keramahan
            dalam melayani pelanggan.
          </p>
        </motion.div>

        {/* Image */}
        <motion.div
          className="relative w-full h-80 lg:h-[400px]"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <img
            src="/images/tentangkami.jpg"
            alt="Tim Cleaning Service"
            className="w-full h-full object-cover rounded-2xl shadow-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}
