import { prisma } from "../prisma";
import fs from "fs";
import path from "path";

export async function generateWordings(companyId: string) {
  const data = await prisma.wordingPage.findMany({
    where: { isActive: true, isDeleted: false, companyId },
    select: { key: true, label: true, langCode: true },
  });

  // Group by langCode
  const grouped: Record<string, Record<string, string>> = {};

  data.forEach((item) => {
    if (!grouped[item.langCode]) {
      grouped[item.langCode] = {};
    }
    grouped[item.langCode][item.key] = item.label;
  });

  // Save JSON per lang
  const outputDir = path.join(process.cwd(), "public", "wording");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const lang in grouped) {
    const filePath = path.join(outputDir, `${lang.toLowerCase()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(grouped[lang], null, 2), "utf-8");
    console.log(`✅ Generated: ${filePath}`);
  }
}
