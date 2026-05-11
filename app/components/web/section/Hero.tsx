"use client";

import { motion } from "framer-motion";

type Props = {
  dataApi: any;
};

export default function Hero({ dataApi }: Props) {
  return (
    <section className="bg-gradient-to-r from-sky-100 via-white to-purple-100 text-slate-900 py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 mt-2">
        {/* Text Section */}
        <motion.div
          className="w-full md:w-1/2 space-y-8 text-center md:text-left"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ amount: 0.3 }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold leading-tight tracking-wide">
            {dataApi?.title}
          </h1>

          <motion.div
            dangerouslySetInnerHTML={{ __html: dataApi?.description }}
            className="text-base sm:text-lg md:text-xl leading-relaxed text-slate-700"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ amount: 0.3 }}
          />
        </motion.div>

        {/* Image Section */}
        <motion.div
          className="w-full md:w-1/2 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          viewport={{ amount: 0.3 }}
        >
          <img
            src={dataApi?.image}
            alt="jasa pembuatan aplikasi website.jpg"
            className="rounded-xl shadow-lg w-full max-w-md h-auto"
            width={600}
            height={400}
          />
        </motion.div>
      </div>
    </section>
  );
}
