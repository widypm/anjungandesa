import Script from "next/script";
import PageProvider from "../PageProvider";
import { FetchData } from "../lib/helper";
import { headers } from "next/headers";

type Props = {
  children: React.ReactNode;
  params: { slug?: string[] };
};

export async function generateMetadata({ params }: Props) {
  // const { meta } = await getPageData(params);
  // return meta;
  return {
    title: "Website KLG",
    description: "Jaklingko",

    // dst...
  };
}

// async function getPageData(params: { slug?: string[] }) {
//   const slug = params.slug?.join("/") || "home";

//   let dataapi: any = null;
//   let errorMessage: string | null = null;

//   try {
//     const datauri = await FetchData(
//       `api/fe/v1/page?cuid=cmeeeatkq0000zidiydh22pbi${
//         slug && slug !== "" ? "&slug=" + slug : ""
//       }`,
//       "GET",
//       "",
//       false,
//       "",
//       false,
//       false
//     );

//     dataapi = datauri?.data;

//     if (!dataapi) {
//       throw new Error("API response kosong atau tidak valid");
//     }
//   } catch (err: any) {
//     errorMessage = err?.message || "Unknown error saat fetch API";
//   }

//   const meta = {
//     metadataBase: new URL(dataapi?.baseUrl ?? "https://solusi-apps.com"),
//     title: dataapi?.metaTitle ?? "WebSite",
//     description: dataapi?.metaDescription,
//     keywords: dataapi?.metaKeyword,
//     authors: dataapi?.authors ? [{ name: dataapi.authors }] : [],
//     creator: dataapi?.creator ?? undefined,
//     publisher: dataapi?.publisher ?? undefined,
//     robots: dataapi?.robots ?? "index, follow",
//     openGraph: {
//       title: dataapi?.ogTitle ?? dataapi?.metaTitle,
//       description: dataapi?.ogDescription ?? dataapi?.metaDescription,
//       url: dataapi?.baseUrl ?? "https://solusi-apps.com",
//       siteName: dataapi?.siteName ?? undefined,
//       locale: dataapi?.locale ?? "id_ID",
//       type: "website",
//       images: dataapi?.ogImage
//         ? [{ url: dataapi?.ogImage, width: 1200, height: 630 }]
//         : [],
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: dataapi?.twitterTitle ?? dataapi?.metaTitle,
//       description: dataapi?.twitterDescription ?? dataapi?.metaDescription,
//       images: dataapi?.ogImage ? [dataapi?.ogImage] : [],
//     },
//   };

//   return { meta, page: dataapi, errorMessage };
// }

export default async function RootLayout({ children, params }: Props) {
  // const { page, errorMessage } = await getPageData(params);
  const { errorMessage } = { errorMessage: null };
  const page = { requestTime: new Date().toISOString() };
  return (
    <html lang="id">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SYRJNCBM81"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SYRJNCBM81');
          `}
        </Script>

        {/* Debug Mode selalu aktif */}
        <Script id="debug-page-data" strategy="afterInteractive">
          {`
            console.log("%c[DEBUG PAGE DATA]", "color: #4CAF50; font-weight: bold;", ${JSON.stringify(
              page
            )});
            ${
              errorMessage
                ? `console.error("%c[API ERROR]", "color: red; font-weight: bold;", "${errorMessage}");`
                : ""
            }
          `}
        </Script>
      </head>
      <body>
        <PageProvider value={page}>{children}</PageProvider>
      </body>
    </html>
  );
}
