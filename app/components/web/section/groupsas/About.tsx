"use client";

import { motion } from "framer-motion";

type Props = {
  dataApi: any;
};

export default function About({ dataApi }: Props) {
  return (
    <section
      id="about"
      className="max-w-7xl mx-auto px-6 py-20 border-t border-green-600 overflow-hidden"
    >
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Kiri - Teks */}
        <div>
          <motion.h2
            className="text-4xl md:text-5xl text-sky-600 font-extrabold mb-6 tracking-wide"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ amount: 0.4 }}
          >
            {dataApi?.title}
          </motion.h2>

          <motion.div
            className="text-slate-700 text-lg leading-relaxed font-mono"
            dangerouslySetInnerHTML={{ __html: dataApi?.description }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewport={{ amount: 0.4 }}
          ></motion.div>
        </div>

        {/* Kanan - Ilustrasi */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ amount: 0.3 }}
          className="flex justify-center"
        >
          <img
            src={dataApi?.image}
            alt="About illustration"
            className="max-w-full h-auto rounded-2xl shadow-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}
