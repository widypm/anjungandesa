import { Metadata } from "next";
import CMSLayout from "../components/cms/CMSLayout";
import { PageTitleProvider } from "../lib/PageTitelCmsContext";
import { Providers } from "../lib/Providers";
import ClientToast from "../components/cms/ui/toastContainer";
export const metadata: Metadata = {
  metadataBase: new URL("https://solusi-apps.com"),
  title: "CMS",
  description:
    "Solusi Apps dan website adalah mitra teknologi Anda dalam pengembangan website dan aplikasi profesional. Kami melayani pembuatan WordPress, Custom CMS, POS, sistem rumah sakit terintegrasi BPJS, akuntansi BLU, chatbot AI, hingga aplikasi mobile Android & iOS.",
  keywords: [
    "jasa pembuatan website",
    "jasa pembuatan aplikasi",
    "jasa website WordPress",
    "aplikasi POS",
    "aplikasi rumah sakit BPJS",
    "akunting BLU",
    "chatbot AI",
    "jasa aplikasi mobile",
    "pengembangan software bisnis",
    "Solusi Apps dan website development",
  ],
  authors: [{ name: "DevSolusi", url: "https://solusi-apps.com/" }],
  creator: "DevSolusi",
  publisher: "DevSolusi",
  robots: "index, follow",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png", // opsional
  },
  openGraph: {
    title:
      "Jasa Pembuatan Website & Aplikasi Terintegrasi | Solusi Apps dan website development",
    description:
      "Layanan pembuatan website dan aplikasi profesional. WordPress, POS, RS BPJS, Akunting BLU, Chatbot AI, dan mobile apps. Solusi digital yang efisien dan terintegrasi.",
    url: "https://solusi-apps.com/",
    siteName: "DevSolusi",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // Pastikan file ini ada di /public
        width: 1200,
        height: 630,
        alt: "DevSolusi - Jasa Website & Aplikasi Terintegrasi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Jasa Pembuatan Website & Aplikasi Terintegrasi | Solusi Apps dan website development",
    description:
      "Solusi Apps dan website development membantu bisnis Anda membangun solusi digital yang efisien dan tepat sasaran. Website, aplikasi mobile, POS, dan sistem terintegrasi lainnya.",
    creator: "@devsolusi", // opsional
    images: ["/og-image.jpg"],
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <PageTitleProvider>
        <CMSLayout>
          {children}
          <ClientToast />
        </CMSLayout>
      </PageTitleProvider>
    </Providers>
  );
}
