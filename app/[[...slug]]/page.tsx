"use client";

import HomeKlg from "app/components/web/section/jliklg/home";
import { usePageData } from "../PageContext";

import React, { useEffect } from "react";

export default function Home() {
  const pageData = usePageData();
  const hasFullScreenBanner =
    pageData?.page?.sectionsAsMain?.some(
      (section) => section.template?.code === "full-screen-banner"
    ) ?? false;

  return (
    <div className="min-h-screen ">
      {/* {hasFullScreenBanner ? (
        <Header dataApi={pageData} isPrimary />
      ) : (
        <Header dataApi={pageData} isPrimary={false} />
      )} */}
      {/* {pageData?.page?.sectionsAsMain.map((rw, index) => {
        return (
          <React.Fragment key={"main" + index}>
            {rw?.template?.code == "full-screen-banner" && (
              <React.Fragment>
                <Hero dataApi={rw} />
              </React.Fragment>
            )}
            {rw?.template?.code == "home-service" && (
              <React.Fragment>
                <Services dataApi={rw} />
              </React.Fragment>
            )}
            {rw?.template?.code == "home-portfolio" && (
              <React.Fragment>
                <Portfolio dataApi={rw} />
              </React.Fragment>
            )}
            {rw?.template?.code == "home-about" && (
              <React.Fragment>
                <About dataApi={rw} />
              </React.Fragment>
            )}
            {rw?.template?.code == "home-contact" && (
              <React.Fragment>
                <Contact dataApi={rw} />
              </React.Fragment>
            )}
            {rw?.template?.code == "detail-page" && <DetailPage dataApi={rw} />}
            {rw?.template?.code == "list-content" && (
              <ListOfContent dataApi={rw} dataAll={pageData} />
            )}
            {rw?.template?.code == "grid-auto" && (
              <ClientSection dataApi={rw} />
            )}
            {rw?.template?.code == "visi-misi" && (
              <VisiMisiSection dataApi={rw} />
            )}
            {rw?.template?.code == "gallery" && <GallerySection dataApi={rw} />}
            {rw?.template?.code == "contact-map" && <ContactUs dataApi={rw} />}
          </React.Fragment>
        );
      })} */}
      <HomeKlg dataApi={""}></HomeKlg>
      <>
        {/* <footer className="bg-white border-t border-gray-200 py-8 mt-20 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} DevSolusi. Semua hak cipta dilindungi.
        </footer> */}
        {/* <Footer dataApi={pageData} /> */}
      </>
    </div>
  );
}
