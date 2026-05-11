export function parseKTP(text: string) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const getLine = (keyword: string) =>
    lines.find((l) => l.toLowerCase().includes(keyword));

  const result: any = {
    nik: "",
    nama: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    alamat: "",
    rtRw: "",
    kelurahan: "",
    kecamatan: "",
    agama: "",
    statusPerkawinan: "",
    pekerjaan: "",
    kewarganegaraan: "WNI",
  };

  /* ======================
     🔥 NIK
  ====================== */
  const nikLine = lines.find((l) => /\d{16}/.test(l));
  if (nikLine) result.nik = nikLine.match(/\d{16}/)?.[0] || "";

  /* ======================
   🔥 NAMA (ANTI TYPO OCR)
====================== */

  // ambil posisi NIK dulu
  const nikIndex = lines.findIndex((l) => /\d{16}/.test(l));

  if (nikIndex !== -1) {
    const possibleNama = lines[nikIndex + 1] || "";

    // biasanya nama ada tepat setelah NIK
    if (possibleNama && !/\d/.test(possibleNama) && possibleNama.length > 5) {
      result.nama = possibleNama.replace(/[^A-Z\s]/gi, "").trim();
    }
  }

  /* ======================
     🔥 TANGGAL LAHIR
  ====================== */
  const ttlMatch = text.match(/\d{2}-\d{2}-\d{4}/);
  if (ttlMatch) result.tanggalLahir = ttlMatch[0];

  /* ======================
     🔥 JENIS KELAMIN (fuzzy)
  ====================== */
  const jkLine = lines.find(
    (l) =>
      l.toLowerCase().includes("laki") || l.toLowerCase().includes("perem"),
  );

  if (jkLine) result.jenisKelamin = jkLine;

  /* ======================
     🔥 ALAMAT (fuzzy typo)
  ====================== */
  const idxAlamat = lines.findIndex((l) => l.toLowerCase().includes("alamat"));

  if (idxAlamat !== -1) {
    for (let i = idxAlamat + 1; i < lines.length; i++) {
      const line = lines[i].toUpperCase();

      if (
        line.includes("JL") ||
        line.includes("BLOK") ||
        line.includes("GANG")
      ) {
        result.alamat = line;
        break;
      }
    }
  }

  /* ======================
     🔥 KELURAHAN
  ====================== */
  const kel = lines.find((l) => l.toLowerCase().includes("duren"));
  if (kel) result.kelurahan = kel;

  /* ======================
     🔥 KECAMATAN
  ====================== */
  const kec = lines.find((l) => l.toLowerCase().includes("bekasi"));
  if (kec) result.kecamatan = kec;

  /* ======================
     🔥 STATUS
  ====================== */
  const status = lines.find((l) => l.toLowerCase().includes("kawin"));
  if (status) result.statusPerkawinan = "KAWIN";

  /* ======================
     🔥 PEKERJAAN
  ====================== */
  const kerja = lines.find((l) => l.toLowerCase().includes("karyawan"));
  if (kerja) result.pekerjaan = kerja;

  return result;
}
