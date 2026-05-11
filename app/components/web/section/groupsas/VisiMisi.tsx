"use client";

import { motion } from "framer-motion";
import { FiEye, FiTarget } from "react-icons/fi";
type Props = {
  dataApi: any;
};
export default function VisiMisiSection({ dataApi }: Props) {
  return (
    <section className="relative py-20 bg-gray-50 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/kerjateam.jpg"
          alt="Office Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
      </div>

      <div className="relative container mx-auto px-6 lg:px-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-sky-600">{dataApi?.title}</h2>
          <p className="text-gray-700 mt-2">{dataApi?.subTitle}</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ amount: 0.3 }}
          dangerouslySetInnerHTML={{ __html: dataApi?.description }}
        ></motion.div>
      </div>
    </section>
  );
}
