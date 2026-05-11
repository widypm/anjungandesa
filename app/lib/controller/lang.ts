import { prisma } from "../../lib/prisma";
export async function getSlugByLang(currentSlug, newLangCode) {
  console.log("baru", currentSlug);
  const result = await prisma.pageTranslation.findFirst({
    where: {
      langCode: newLangCode,
      isDeleted: false,
      page: {
        translations: {
          some: {
            slug: currentSlug,
          },
        },
      },
    },
    select: { slug: true },
  });

  return result?.slug ?? ""; // selalu string
}
