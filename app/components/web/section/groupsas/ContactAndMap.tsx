import { FiMapPin, FiPhone, FiMail } from "react-icons/fi";
type Props = {
  dataApi: any;
};
export default function ContactUs({ dataApi }: Props) {
  return (
    <section id="contact" className="py-16 bg-gray-50 ">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            {dataApi?.title}
          </h2>
          <p className="mt-3 text-gray-600">{dataApi?.subTitle}</p>
        </div>
        <div dangerouslySetInnerHTML={{ __html: dataApi?.description }}></div>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-10"> */}
        {/* Map */}
        {/* <div className="w-full h-80 rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.819240990689!2d107.61046687499697!3d-6.914744467671773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e62f8d06cf25%3A0x7a2a8a48f6c8f7b!2sBandung!5e0!3m2!1sen!2sid!4v1694768900000!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div> */}

        {/* Info */}
        {/* <div className="flex flex-col justify-center space-y-6">
            <div className="flex items-start gap-4">
              <FiMapPin className="text-purple-600 text-2xl shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-800">Alamat</h4>
                <p className="text-gray-600">
                  Jl. Contoh No.123, Bandung, Jawa Barat
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FiPhone className="text-purple-600 text-2xl shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-800">Telepon</h4>
                <p className="text-gray-600">+62 812-3456-7890</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FiMail className="text-purple-600 text-2xl shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-800">Email</h4>
                <p className="text-gray-600">info@smartcleaning.com</p>
              </div>
            </div>
          </div> */}
        {/* </div> */}
      </div>
    </section>
  );
}
