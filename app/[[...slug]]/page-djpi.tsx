"use client";

import { usePageData } from "../PageContext";
import Hero from "../components/web/section/groupsas/Hero";
import Services from "../components/web/section/Services";
import Portfolio from "../components/web/section/Portfolio";
import About from "../components/web/section/groupsas/About";
import Contact from "../components/web/section/Contact";
import Header from "../components/web/section/groupsas/Header";
import React, { useEffect } from "react";
import DetailPage from "../components/web/section/groupsas/DetailArtikel";
import ListOfContent from "../components/web/section/ListContent";
import ClientSection from "app/components/web/section/groupsas/Client";
import VisiMisiSection from "app/components/web/section/groupsas/VisiMisi";
import GallerySection from "app/components/web/section/groupsas/gallery";
import Footer from "app/components/web/section/groupsas/footer";
import ContactUs from "app/components/web/section/groupsas/ContactAndMap";

export default function Home() {
  const pageData = usePageData();
  const hasFullScreenBanner =
    pageData?.page?.sectionsAsMain?.some(
      (section) => section.template?.code === "full-screen-banner"
    ) ?? false;

  return (
    <>
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
      Please login...
      <>
        {/* <footer className="bg-white border-t border-gray-200 py-8 mt-20 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} DevSolusi. Semua hak cipta dilindungi.
        </footer> */}
        {/* <Footer dataApi={pageData} /> */}
      </>
    </>
  );
}
