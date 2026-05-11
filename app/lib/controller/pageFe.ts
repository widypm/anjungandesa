import { prisma } from "../prisma";
import { getCachedMenuForFE } from "./menu";

export async function getPageData(slugQs: any, cuid: any) {
  const slug = slugQs;
  const now = new Date();

  const data = await prisma.pageTranslation.findFirst({
    where: {
      slug: { contains: slug },
      page: {
        publishAt: { lte: now },
        OR: [{ unPublishAt: null }, { unPublishAt: { gt: now } }],
      },
    },
    include: {
      page: {
        include: {
          sectionsAsMain: {
            where: { isActive: true },
            include: {
              category: {
                include: {
                  pageCategories: {
                    include: {
                      page: {
                        include: {
                          translations: {
                            include: {
                              page: { include: { mediaPages: true } },
                            },
                          },
                          mediaPages: true,
                        },
                      },
                    },
                  },
                  medias: true,
                  pageTranslations: true,
                },
              },
              template: true,
            },
          },
          mediaPages: true,
        },
      },
    },
  });

  // filter manual sesuai langCode parent
  let langCode = "ID";
  if (data) {
    langCode = data.langCode;

    // filter manual semua nested
    data.page.sectionsAsMain = data.page.sectionsAsMain.filter(
      (sec) => sec.langCode === langCode
    );
    data.page.sectionsAsMain.forEach((sec) => {
      if (sec.category) {
        sec.category.pageCategories = sec.category.pageCategories
          .filter((pc) => pc.langCode === langCode)
          .map((pc) => {
            if (pc.page) {
              // filter translations
              if (Array.isArray(pc.page.translations)) {
                pc.page.translations = pc.page.translations.filter(
                  (tr) => tr.langCode === langCode
                );
              }

              // filter mediaPages
              if (Array.isArray(pc.page.mediaPages)) {
                pc.page.mediaPages = pc.page.mediaPages.filter(
                  (mp) => mp.langCode === langCode
                );
              }
            }
            return pc;
          });

        // filter pageTranslations
        sec.category.pageTranslations = sec.category.pageTranslations.filter(
          (pt) => pt.langCode === langCode
        );
      }
    });
    // filter manual sesuai langCode parent
    if (data?.page?.mediaPages) {
      data.page.mediaPages = data.page.mediaPages.filter(
        (m) => m.langCode === data.langCode
      );
    }
  }

  let dataRsp: any = data;
  // console.log("menu dum", await getCachedMenuForFE(langCode));
  dataRsp.navigation = await getCachedMenuForFE(langCode, cuid);
  //   console.log("lock", dataRsp);
  return dataRsp;
}
