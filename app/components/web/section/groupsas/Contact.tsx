"use client";
import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

type Props = {
  dataApi: any;
};

export default function Contact({ dataApi }: Props) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const token = await recaptchaRef.current?.getValue();
    if (!token) {
      setErrorMsg("Harap verifikasi captcha terlebih dahulu.");
      setLoading(false);
      return;
    }

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement)
      .value;

    const subject = encodeURIComponent(`Pesan dari ${name}`);
    const body = encodeURIComponent(
      `Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`
    );

    // Kirim via email client
    window.location.href = `mailto:widy.prawira@gmail.com?subject=${subject}&body=${body}`;

    setLoading(false);
    setSuccessMsg("Pesan berhasil terkirim!");
    form.reset();
    recaptchaRef.current?.reset();
  };

  return (
    <section
      id="contact"
      className="bg-gradient-to-br from-purple-50 to-blue-50 py-20 border-t border-purple-200"
    >
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl font-extrabold mb-6 text-center text-purple-700 tracking-wide">
          {dataApi?.title || "Hubungi Kami"}
        </h2>
        <p className="text-center text-gray-600 mb-10">
          Kami siap membantu Anda. Silakan isi formulir di bawah ini.
        </p>

        <form
          className="bg-white p-8 rounded-2xl shadow-lg space-y-6"
          onSubmit={handleSubmit}
        >
          <input
            name="name"
            className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
            placeholder="Nama Lengkap"
            required
          />
          <input
            type="email"
            name="email"
            className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
            placeholder="Email"
            required
          />
          <textarea
            name="message"
            className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
            rows={5}
            placeholder="Pesan"
            required
          />

          <div className="flex justify-center">
            <ReCAPTCHA ref={recaptchaRef} sitekey="YOUR_RECAPTCHA_SITE_KEY" />
          </div>

          {errorMsg && (
            <p className="text-red-500 text-sm text-center">{errorMsg}</p>
          )}
          {successMsg && (
            <p className="text-green-500 text-sm text-center">{successMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Mengirim..." : "Kirim Pesan"}
          </button>
        </form>
      </div>
    </section>
  );
}
