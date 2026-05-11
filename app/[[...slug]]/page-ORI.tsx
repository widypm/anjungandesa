"use client";

import { usePageData } from "../PageContext";
import Hero from "../components/web/section/Hero";
import Services from "../components/web/section/Services";
import Portfolio from "../components/web/section/Portfolio";
import About from "../components/web/section/About";
import Contact from "../components/web/section/Contact";
import Header from "../components/web/section/Header";
import React from "react";
import DetailPage from "../components/web/section/DetailArtikel";
import ListOfContent from "../components/web/section/ListContent";

export default function Home() {
  const pageData = usePageData();
  return (
    <>
      <Header dataApi={pageData} />

      {pageData?.page?.sectionsAsMain.map((rw, index) => {
        return (
          <React.Fragment key={"main" + index}>
            {rw?.template?.code == "home-banner" && (
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
          </React.Fragment>
        );
      })}

      <>
        <footer className="bg-white border-t border-gray-200 py-8 mt-20 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} DevSolusi. Semua hak cipta dilindungi.
        </footer>
      </>
    </>
  );
}
