"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Webcam from "react-webcam";
import SuratPreview from "../anjungan/preview";
type Props = {
  dataApi: any;
};
type AhliWarisItem = {
  nama: string;
  nik: string;
  hubungan: string;
  alamat: string;
};

type FormKTP = {
  /* ===== UMUM ===== */
  jenis: string;
  nik: string;
  nama: string;
  ttl: string;
  alamat: string;
  pekerjaan: string;
  keperluan: string;

  /* ===== LAHIR ===== */
  ttlAnak?: string;
  namaAyah?: string;
  namaIbu?: string;

  /* ===== KEMATIAN ===== */
  htlMeninggal?: string;
  sebabMeninggal?: string;

  /* ===== PINDAH ===== */
  alamatAsal?: string;
  alamatTujuan?: string;
  alasanPindah?: string;

  /* ===== USAHA ===== */
  namaUsaha?: string;
  jenisUsaha?: string;
  alamatUsaha?: string;

  /* ===== TANAH (UMUM) ===== */
  letakTanah: string;
  luas: string;
  batasUtara: string;
  batasSelatan: string;
  batasTimur: string;
  batasBarat: string;
  statusTanah: string;
  penggunaanTanah: string;

  /* ===== PENGANTAR BPN ===== */
  // pakai field tanah + keperluan

  /* ===== JUAL BELI / HIBAH ===== */
  jenisTransaksi?: string;
  namaPihakPertama?: string;
  nikPihakPertama?: string;
  namaPihakKedua?: string;
  nikPihakKedua?: string;

  // ===== pengantar bpjs ===== //
  noBpjs?: string;
  faskes?: string;

  /* ===== BEASISWA ===== */
  namaSekolah?: string;
  kelas?: string;
  nim?: string;
  jurusan?: string;
  namaOrtu?: string;
  penghasilanOrtu?: string;

  /* ===== AHLI WARIS ===== */
  ahliWaris?: AhliWarisItem[];
};

export default function HomeKlg({ dataApi }: Props) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isBtn, setIsBtn] = useState(0);
  const [selectedGolongn, setSelectedGolongan] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [gol, setGol] = useState<any>([]);
  const [isMobile, setIsMobile] = useState(false);
  const videoConstraints = {
    facingMode: { ideal: "environment" },
    width: { ideal: 1280 }, // 🔥 lebih stabil
    height: { ideal: 960 },
  };

  useEffect(() => {
    const updateSizes = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
      setIsMobile(window.innerWidth < 768); // md breakpoint Tailwind
    };

    updateSizes();
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log("Voices loaded:", voices);
      }
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const speakText = (text: string) => {
    if (!voiceEnabled) {
      console.warn("Voice belum diaktifkan, klik dulu tombol 'Aktifkan Suara'");
      return;
    }

    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "id-ID";
    msg.rate = 1;
    msg.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const indoVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes("id") ||
        v.name.toLowerCase().includes("indonesian"),
    );

    if (indoVoice) msg.voice = indoVoice;
    else
      console.warn(
        "⚠️ Tidak ditemukan suara Bahasa Indonesia, gunakan default",
      );

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  };
  const stopSpeak = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };
  const renderFormByJenis = () => {
    const grid = "grid grid-cols-1 md:grid-cols-2 gap-4 w-full";

    switch (form.jenis) {
      /* ================= SURAT KEMATIAN ================= */
      case "kematian":
        return (
          <div className={grid}>
            <input
              className="form-input w-full"
              placeholder="Nama Almarhum / Almarhumah"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />

            <input type="date" className="form-input w-full" />

            <input
              className="form-input w-full"
              placeholder="Sebab Meninggal"
            />

            <textarea
              className="form-textarea w-full md:col-span-2"
              placeholder="Alamat Terakhir"
            />
          </div>
        );
      /// ========Surat pengantar BPN========//
      case "pengantarSertifikatTanah":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <input
              className="form-input w-full"
              placeholder="Nama Pemohon"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="NIK"
              value={form.nik}
              onChange={(e) => setForm({ ...form, nik: e.target.value })}
            />

            <textarea
              className="form-textarea w-full md:col-span-2"
              placeholder="Alamat Pemohon"
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Letak Tanah"
              value={form.letakTanah}
              onChange={(e) => setForm({ ...form, letakTanah: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Luas Tanah (m²)"
              value={form.luas}
              onChange={(e) => setForm({ ...form, luas: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Batas Utara"
              value={form.batasUtara}
              onChange={(e) => setForm({ ...form, batasUtara: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Batas Selatan"
              value={form.batasSelatan}
              onChange={(e) =>
                setForm({ ...form, batasSelatan: e.target.value })
              }
            />

            <input
              className="form-input w-full"
              placeholder="Batas Timur"
              value={form.batasTimur}
              onChange={(e) => setForm({ ...form, batasTimur: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Batas Barat"
              value={form.batasBarat}
              onChange={(e) => setForm({ ...form, batasBarat: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Status Tanah (Hak Milik / Garapan / Waris)"
              value={form.statusTanah}
              onChange={(e) =>
                setForm({ ...form, statusTanah: e.target.value })
              }
            />

            <input
              className="form-input w-full md:col-span-2"
              placeholder="Keperluan (Pengajuan Sertifikat ke BPN)"
              value={form.keperluan || ""}
              onChange={(e) => setForm({ ...form, keperluan: e.target.value })}
            />
          </div>
        );

      /* ================= SURAT KELAHIRAN ================= */
      case "lahir":
        return (
          <div className={grid}>
            <input className="form-input w-full" placeholder="Nama Anak" />
            <input className="form-input w-full" placeholder="Jenis Kelamin" />
            <input
              className="form-input w-full"
              placeholder="Tempat / Tanggal Lahir"
            />
            <input className="form-input w-full" placeholder="Nama Ayah" />
            <input className="form-input w-full" placeholder="Nama Ibu" />

            <textarea
              className="form-textarea w-full md:col-span-2"
              placeholder="Alamat Orang Tua"
            />
          </div>
        );
      //--------- surat ajb tanah === \\
      case "jualBeliHibahTanah":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* JENIS TRANSAKSI */}
            <select
              className="form-input w-full md:col-span-2"
              value={form.jenisTransaksi || ""}
              onChange={(e) =>
                setForm({ ...form, jenisTransaksi: e.target.value })
              }
            >
              <option value="">Pilih Jenis Transaksi</option>
              <option value="jual beli">Jual Beli</option>
              <option value="hibah">Hibah</option>
            </select>

            {/* PIHAK PERTAMA */}
            <input
              className="form-input w-full"
              placeholder="Nama Pihak Pertama (Penjual / Pemberi Hibah)"
              value={form.namaPihakPertama || ""}
              onChange={(e) =>
                setForm({ ...form, namaPihakPertama: e.target.value })
              }
            />

            <input
              className="form-input w-full"
              placeholder="NIK Pihak Pertama"
              value={form.nikPihakPertama || ""}
              onChange={(e) =>
                setForm({ ...form, nikPihakPertama: e.target.value })
              }
            />

            {/* PIHAK KEDUA */}
            <input
              className="form-input w-full"
              placeholder="Nama Pihak Kedua (Pembeli / Penerima Hibah)"
              value={form.namaPihakKedua || ""}
              onChange={(e) =>
                setForm({ ...form, namaPihakKedua: e.target.value })
              }
            />

            <input
              className="form-input w-full"
              placeholder="NIK Pihak Kedua"
              value={form.nikPihakKedua || ""}
              onChange={(e) =>
                setForm({ ...form, nikPihakKedua: e.target.value })
              }
            />

            {/* DATA TANAH */}
            <input
              className="form-input w-full"
              placeholder="Letak Tanah"
              value={form.letakTanah}
              onChange={(e) => setForm({ ...form, letakTanah: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Luas Tanah (m²)"
              value={form.luas}
              onChange={(e) => setForm({ ...form, luas: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Batas Utara"
              value={form.batasUtara}
              onChange={(e) => setForm({ ...form, batasUtara: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Batas Selatan"
              value={form.batasSelatan}
              onChange={(e) =>
                setForm({ ...form, batasSelatan: e.target.value })
              }
            />

            <input
              className="form-input w-full"
              placeholder="Batas Timur"
              value={form.batasTimur}
              onChange={(e) => setForm({ ...form, batasTimur: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Batas Barat"
              value={form.batasBarat}
              onChange={(e) => setForm({ ...form, batasBarat: e.target.value })}
            />

            <input
              className="form-input w-full md:col-span-2"
              placeholder="Status Tanah (Hak Milik / Warisan / Garapan)"
              value={form.statusTanah}
              onChange={(e) =>
                setForm({ ...form, statusTanah: e.target.value })
              }
            />
          </div>
        );

      /* ================= SURAT USAHA ================= */
      case "usaha":
        return (
          <div className={grid}>
            <input
              className="form-input w-full"
              placeholder="Nama Pemilik Usaha"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />
            <input className="form-input w-full" placeholder="Nama Usaha" />
            <input className="form-input w-full" placeholder="Jenis Usaha" />

            <textarea
              className="form-textarea w-full md:col-span-2"
              placeholder="Alamat Usaha"
            />
          </div>
        );

      /* ================= SKTM ================= */
      case "sktm":
        return (
          <div className={grid}>
            <input
              className="form-input w-full"
              placeholder="Nama"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />
            <input className="form-input w-full" placeholder="Pekerjaan" />

            <textarea
              className="form-textarea w-full md:col-span-2"
              placeholder="Alamat"
            />

            <input
              className="form-input w-full md:col-span-2"
              placeholder="Keperluan SKTM"
            />
          </div>
        );

      /* ================= PINDAH DOMISILI ================= */
      case "pindah":
        return (
          <div className={grid}>
            <input className="form-input w-full" placeholder="Nama" />
            <input className="form-input w-full" placeholder="NIK" />

            <textarea
              className="form-textarea w-full md:col-span-2"
              placeholder="Alamat Asal"
            />
            <textarea
              className="form-textarea w-full md:col-span-2"
              placeholder="Alamat Tujuan"
            />

            <input
              className="form-input w-full md:col-span-2"
              placeholder="Alasan Pindah"
            />
          </div>
        );

      /* ================= BELUM MENIKAH ================= */
      case "belumMenikah":
        return (
          <div className={grid}>
            <input className="form-input w-full" placeholder="Nama" />
            <input className="form-input w-full" placeholder="NIK" />
            <input
              className="form-input w-full"
              placeholder="Tempat / Tanggal Lahir"
            />
            <input className="form-input w-full" placeholder="Pekerjaan" />

            <textarea
              className="form-textarea w-full md:col-span-2"
              placeholder="Alamat"
            />
          </div>
        );

      /* ================= AHLI WARIS ================= */
      case "waris":
        return (
          <div className={grid}>
            <input className="form-input w-full" placeholder="Nama Almarhum" />
            <input type="date" className="form-input w-full" />

            <textarea
              className="form-textarea w-full md:col-span-2"
              placeholder="Alamat Terakhir"
            />

            <input
              className="form-input w-full"
              placeholder="Nama Ahli Waris"
            />
            <input
              className="form-input w-full"
              placeholder="Hubungan Keluarga"
            />
          </div>
        );

      /* ================= SURAT TANAH ================= */
      case "suratKetTanah":
        return (
          <div className={grid}>
            <input
              className="form-input w-full"
              placeholder="Nama Pemilik Tanah"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />
            <input className="form-input w-full" placeholder="Letak Tanah" />
            <input className="form-input w-full" placeholder="Luas Tanah" />
            <input className="form-input w-full" placeholder="Status Tanah" />
            <input className="form-input w-full" placeholder="Batas Utara" />
            <input className="form-input w-full" placeholder="Batas Selatan" />
            <input className="form-input w-full" placeholder="Batas Timur" />
            <input className="form-input w-full" placeholder="Batas Barat" />

            <input
              className="form-input w-full md:col-span-2"
              placeholder="Penggunaan Tanah"
            />
          </div>
        );
      //======== Pengantar BPJS =========\\
      case "bpjs":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <input
              className="form-input w-full"
              placeholder="Nama Pasien"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="NIK"
              value={form.nik}
              onChange={(e) => setForm({ ...form, nik: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Tempat / Tanggal Lahir"
              value={form.ttl}
              onChange={(e) => setForm({ ...form, ttl: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Pekerjaan"
              value={form.pekerjaan}
              onChange={(e) => setForm({ ...form, pekerjaan: e.target.value })}
            />

            <textarea
              className="form-textarea w-full md:col-span-2"
              placeholder="Alamat"
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Nomor BPJS"
              value={form.noBpjs || ""}
              onChange={(e) => setForm({ ...form, noBpjs: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Fasilitas Kesehatan Tujuan"
              value={form.faskes || ""}
              onChange={(e) => setForm({ ...form, faskes: e.target.value })}
            />

            <input
              className="form-input w-full md:col-span-2"
              placeholder="Keluhan / Keperluan Berobat"
              value={form.keperluan}
              onChange={(e) => setForm({ ...form, keperluan: e.target.value })}
            />
          </div>
        );
      case "beasiswa":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <input
              className="form-input w-full"
              placeholder="Nama"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="NIK"
              value={form.nik}
              onChange={(e) => setForm({ ...form, nik: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Tempat / Tanggal Lahir"
              value={form.ttl}
              onChange={(e) => setForm({ ...form, ttl: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Nama Sekolah / Kampus"
              value={form.namaSekolah}
              onChange={(e) =>
                setForm({ ...form, namaSekolah: e.target.value })
              }
            />

            <input
              className="form-input w-full"
              placeholder="Kelas / Semester"
              value={form.kelas}
              onChange={(e) => setForm({ ...form, kelas: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="NIM / NISN"
              value={form.nim}
              onChange={(e) => setForm({ ...form, nim: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Jurusan"
              value={form.jurusan}
              onChange={(e) => setForm({ ...form, jurusan: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Nama Orang Tua / Wali"
              value={form.namaOrtu}
              onChange={(e) => setForm({ ...form, namaOrtu: e.target.value })}
            />

            <input
              className="form-input w-full"
              placeholder="Penghasilan Orang Tua"
              value={form.penghasilanOrtu}
              onChange={(e) =>
                setForm({ ...form, penghasilanOrtu: e.target.value })
              }
            />

            <textarea
              className="form-textarea w-full md:col-span-2"
              placeholder="Alamat"
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
            />

            <input
              className="form-input w-full md:col-span-2"
              placeholder="Keperluan Beasiswa"
              value={form.keperluan}
              onChange={(e) => setForm({ ...form, keperluan: e.target.value })}
            />
          </div>
        );

      /* ================= DEFAULT ================= */
      default:
        return (
          <div className={grid}>
            <input
              className="form-input w-full"
              placeholder="NIK"
              value={form.nik}
              onChange={(e) => setForm({ ...form, nik: e.target.value })}
            />
            <input
              className="form-input w-full"
              placeholder="Nama"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />
            <input
              className="form-input w-full"
              placeholder="Tempat / Tanggal Lahir"
              value={form.ttl}
              onChange={(e) => setForm({ ...form, ttl: e.target.value })}
            />
            <input
              className="form-input w-full"
              placeholder="Pekerjaan"
              value={form.pekerjaan}
              onChange={(e) => setForm({ ...form, pekerjaan: e.target.value })}
            />

            <textarea
              className="form-textarea w-full md:col-span-2"
              placeholder="Alamat"
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
            />
          </div>
        );
    }
  };

  const [form, setForm] = useState<FormKTP>({
    /* ===== UMUM ===== */
    jenis: "domisili",
    nik: "",
    nama: "",
    ttl: "",
    alamat: "",
    pekerjaan: "",
    keperluan: "",

    /* ===== LAHIR ===== */
    ttlAnak: "",
    namaAyah: "",
    namaIbu: "",

    /* ===== KEMATIAN ===== */
    htlMeninggal: "",
    sebabMeninggal: "",

    /* ===== PINDAH ===== */
    alamatAsal: "",
    alamatTujuan: "",
    alasanPindah: "",

    /* ===== USAHA ===== */
    namaUsaha: "",
    jenisUsaha: "",
    alamatUsaha: "",

    /* ===== TANAH ===== */
    letakTanah: "",
    luas: "",
    batasUtara: "",
    batasSelatan: "",
    batasTimur: "",
    batasBarat: "",
    statusTanah: "",
    penggunaanTanah: "",

    /* ===== JUAL BELI / HIBAH ===== */
    jenisTransaksi: "",
    namaPihakPertama: "",
    nikPihakPertama: "",
    namaPihakKedua: "",
    nikPihakKedua: "",

    // ==== bpjs ===== //
    noBpjs: "",
    faskes: "",

    /* ===== AHLI WARIS ===== */
    ahliWaris: [],

    namaSekolah: "",
    kelas: "",
    nim: "",
    jurusan: "",
    namaOrtu: "",
    penghasilanOrtu: "",
  });

  const webcamRef = useRef<Webcam>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  function cropImage(base64: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas error");

        // ukuran preview webcam
        const previewW = 420;
        const previewH = 300;

        // frame KTP
        const frameW = 360;
        const frameH = 210;

        const scaleX = img.width / previewW;
        const scaleY = img.height / previewH;

        const cropX = ((previewW - frameW) / 2) * scaleX;
        const cropY = ((previewH - frameH) / 2) * scaleY;
        const cropW = frameW * scaleX;
        const cropH = frameH * scaleY;

        /* ===============================
         🔥 RESIZE AGAR OCR LEBIH AKURAT
      =============================== */

        const TARGET_WIDTH = 1400; // sweet spot OCR
        const ratio = TARGET_WIDTH / cropW;

        canvas.width = TARGET_WIDTH;
        canvas.height = cropH * ratio;

        // 👇 enhance biar teks KTP lebih tajam
        ctx.filter = "grayscale(100%) contrast(130%) brightness(110%)";

        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropW,
          cropH,
          0,
          0,
          canvas.width,
          canvas.height,
        );

        /* ===============================
         🔥 PAKAI JPEG (JANGAN PNG)
      =============================== */

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject("Crop gagal");
            resolve(blob);
          },
          "image/jpeg", // ✅ ubah ke jpeg
          0.9, // kualitas tinggi tapi stabil
        );
      };

      img.onerror = () => reject("Image load error");
    });
  }

  const capture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      alert("Camera belum siap");
      return;
    }

    setLoading(true);
    setPhoto(imageSrc);

    try {
      // 🔥 AUTO CROP HASIL FOTO
      const croppedBlob = await cropImage(imageSrc);

      const file = new File([croppedBlob], "ktp.jpg", {
        type: "image/jpeg",
      });

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();

      if (!json.success) {
        alert("OCR gagal membaca KTP");
        return;
      }

      console.log("OCR RESULT:", json.data);

      // ✅ AUTO ISI FORM
      setForm((prev) => ({
        ...prev,
        nik: json.data.nik || "",
        nama: json.data.nama || "",
        ttl: `${json.data.tempatLahir || ""} ${json.data.tanggalLahir || ""}`.trim(),
        alamat: json.data.alamat || "",
        pekerjaan: json.data.pekerjaan || "",
      }));
    } catch (err) {
      console.error("OCR error:", err);
      alert("Terjadi error saat OCR");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmitSurat = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/anjungan/fe/createSurat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!json.success) {
        alert("Gagal simpan surat");
        return;
      }

      // ✅ lanjut ke print preview
      setIsBtn(8);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-4 bg-blue-200/5">
      {/* Tombol aktivasi suara */}
      {!voiceEnabled && (
        <div className="fixed bottom-2 sm:bottom-[53%] left-[90%] sm:left-[96%] -translate-x-1/2 z-50">
          <button
            onClick={() => {
              setVoiceEnabled(true);
              const msg = new SpeechSynthesisUtterance("Suara diaktifkan");
              msg.lang = "id-ID";
              window.speechSynthesis.speak(msg);
            }}
            className="bg-red-400 text-xs hover:bg-red-500 text-white font-semibold py-2 px-4 rounded shadow"
          >
            🔊 Aktifkan Suara
          </button>
        </div>
      )}

      {/* Header */}
      <div
        ref={headerRef}
        className="container mx-auto px-2 lg:px-8 grid grid-cols-1 gap-12 items-center"
      >
        {/* Foto pejabat dekstop */}
        <div className="hidden sm:flex  flex-row justify-between items-center w-full gap-6 md:gap-0">
          {/* Gubernur */}
          <div
            className="flex flex-col gap-3 items-center w-full md:w-1/4"
            onMouseEnter={() =>
              speakText("Presiden Indonesia. Prabowo Subianto")
            }
            onMouseLeave={stopSpeak}
          >
            <img
              src="/images/anjungan/presidenRI.jpg"
              alt="Foto Gubernur"
              className="w-24 h-24 md:w-24 md:h-24 rounded-full object-cover shadow-md"
            />
            <div className="flex flex-col items-center text-gray-800 py-2 px-3 rounded-md text-center w-full md:w-auto">
              <h3 className="text-sm md:text-base ">Prabowo Subianto</h3>
              <p className="text-xs text-gray-600">Presiden Indonesia</p>
            </div>
          </div>

          {/* Judul Tengah */}
          <div className="flex flex-col items-center text-center w-full md:w-2/4">
            <img src="/images/anjungan/digides.png" className="h-28" />
            <h1 className="text-xl md:text-3xl font-semibold">
              ANJUNGAN DESA MANDIRI
            </h1>
            <p className="text-xs md:text-sm text-gray-600">
              DIGIDES MERAH PUTIH
            </p>
            {/* Logo bar di atas */}
            {/* <div className="flex gap-6 justify-between p-2 w-[260px] mt-2">
              <img
                src="/images/klg/logo-tije.png"
                alt="Logo Tije"
                className="w-12 h-8 object-contain"
              />
              <img
                src="/images/klg/logo-mrt.png"
                alt="Logo MRT"
                className="w-12 h-8 object-contain"
              />
              <img
                src="/images/klg/logo-lrt.png"
                alt="Logo LRT"
                className="w-12 h-8 object-contain"
              />
            </div> */}
          </div>

          {/* Wakil Gubernur */}
          <div
            className="flex flex-col gap-3 items-center w-full md:w-1/4"
            onMouseEnter={() =>
              speakText("Wakil Presiden. Gibran Rakabuming Raka")
            }
            onMouseLeave={stopSpeak}
          >
            <img
              src="/images/anjungan/wapresRi.webp"
              alt="Foto Wakil Gubernur"
              className="w-24 h-24 md:w-24 md:h-24 rounded-full object-cover shadow-md"
            />
            <div className="flex flex-col items-center  text-gray-800 py-2 px-3 rounded-md text-center w-full md:w-auto">
              <h3 className="text-sm md:text-base ">Gibran Rakabuming Raka</h3>
              <p className="text-xs text-gray-600">Wakil Presiden</p>
            </div>
          </div>
        </div>
        {/* Foto pejabat mobile */}
        <div className="flex sm:hidden flex-col  justify-center items-center w-full gap-6 md:gap-0">
          <div className="grid grid-cols-2 gap-2 w-full">
            {/* Gubernur */}
            <div
              className="flex flex-col gap-3 items-center w-full md:w-1/4"
              onMouseEnter={() =>
                speakText("Presiden Indonesia. Prabowo Subianto")
              }
              onMouseLeave={stopSpeak}
            >
              <img
                src="/images/anjungan/presidenRI.jpg"
                alt="Foto Gubernur"
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-md"
              />
              <div className="flex flex-col items-center text-black  rounded-md text-center w-full md:w-auto">
                <h3 className="text-[10px] font-bold md:text-base ">
                  Prabowo Subianto
                </h3>
                <p className="text-[9px] text-gray-600">Presiden Indonesia</p>
              </div>
            </div>
            {/* Wakil Gubernur */}
            <div
              className="flex flex-col gap-3 items-center w-full md:w-1/4"
              onMouseEnter={() =>
                speakText("Wakil Presiden. Gibran Rakabuming Raka")
              }
              onMouseLeave={stopSpeak}
            >
              <img
                src="/images/anjungan/wapresRi.webp"
                alt="Foto Wakil Gubernur"
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-md"
              />
              <div className="flex flex-col items-center  text-black  rounded-md text-center w-full md:w-auto">
                <h3 className="text-[10px] font-bold md:text-base ">
                  Gibran Rakabuming Raka
                </h3>
                <p className="text-[9px] text-gray-600">Wakil Presiden</p>
              </div>
            </div>
          </div>
          {/* Judul Tengah */}
          <div className="flex flex-col items-center text-center w-full md:w-2/4">
            <h1 className="text-xl md:text-3xl font-semibold">
              ANJUNGAN DESA MANDIRI
            </h1>
            <p className="text-xs md:text-sm text-gray-600">
              DIGIDES MERAH PUTIH
            </p>
            {/* Logo bar di atas */}
            {/* <div className="flex gap-6 justify-between p-2 w-[260px] mt-2">
              <img
                src="/images/klg/logo-tije.png"
                alt="Logo Tije"
                className="w-12 h-8 object-contain"
              />
              <img
                src="/images/klg/logo-mrt.png"
                alt="Logo MRT"
                className="w-12 h-8 object-contain"
              />
              <img
                src="/images/klg/logo-lrt.png"
                alt="Logo LRT"
                className="w-12 h-8 object-contain"
              />
            </div> */}
          </div>
        </div>
      </div>

      {/* Background + Menu */}
      <div
        className="w-full mt-2 p-2 bg-[url('/images/anjungan/bg-desa.png')] bg-cover bg-center bg-no-repeat relative"
        style={
          !isMobile
            ? { minHeight: `calc(100vh - ${headerHeight}px)` }
            : { minHeight: "auto" }
        }
      >
        {/* Logo bar */}

        {/* Kontainer menu utama */}
        <div
          className={`flex flex-col items-center w-full ${
            !isMobile
              ? "justify-center  py-10" // center di desktop
              : "justify-start mt-6 pb-20" // biar scroll di mobile
          }`}
        >
          {/* MENU UTAMA */}
          {isBtn == 0 && (
            <div className="sm:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 items-center justify-center">
              {[
                {
                  label: "Administrasi",
                  img: "/images/klg/icon-reg-card.png",
                  click: () => setIsBtn(1),
                  speak: "Ini tombol Layanan Administrasi",
                },
                {
                  label: "Pertanahan & Aset",
                  img: "/images/anjungan/space.png",
                  click: () => setIsBtn(2),
                  speak: "Ini tombol Layanan Pertanahan & Aset",
                },
                {
                  label: "Sosial & Kesejahteraan",
                  img: "/images/anjungan/social.png",
                  click: () => setIsBtn(3),
                  speak: "Ini tombol Layanan Sosial & Kesejahteraan",
                },
                {
                  label: "Ekonomi & UMKM",
                  img: "/images/anjungan/local-economy.png",
                  click: () => setIsBtn(4),
                  speak: "Ini tombol Layanan Ekonomi & UMKM",
                },

                {
                  label: "Informasi Desa",
                  img: "/images/anjungan/informative.png",
                  click: () => setIsBtn(5),
                  speak: "Ini tombol Layanan Sosial & Kesejahteraan",
                },
                {
                  label: "Keamanan & Ketertiban",
                  img: "/images/anjungan/protocol.png",
                  click: () => setIsBtn(6),
                  speak: "Ini tombol Layanan Sosial & Kesejahteraan",
                },
                {
                  label: "Simkopdes.go.id",
                  img: "/images/anjungan/simkopdestr.png",
                  click: () =>
                    window.open("https://simkopdes.go.id/", "_blank"),
                  speak: "Ini tombol Layanan Sosial & Kesejahteraan",
                },
                {
                  label: "Jagadesa.Kejaksaan.go.id",
                  img: "/images/anjungan/jagadesa.png",
                  click: () =>
                    window.open("https://jagadesa.kejaksaan.go.id/", "_blank"),
                  speak: "Ini tombol Layanan Sosial & Kesejahteraan",
                },
              ].map((btn, i) => (
                <div
                  key={i}
                  className="p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:scale-105 transition"
                  onMouseEnter={() => speakText(btn.speak)}
                  onMouseLeave={stopSpeak}
                  onClick={btn.click}
                >
                  <img
                    src={btn.img}
                    alt={btn.label}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                  />
                  <div className="font-bold mt-2 text-sm sm:text-base text-center">
                    {btn.label}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* SUBMENU & FORM DLL (biarkan seperti sebelumnya) */}
          {isBtn == 1 && (
            <div className="sm:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 items-center justify-center">
              {[
                {
                  label: "Surat Keterangan Domisili",
                  img: "/images/anjungan/documentation.png",
                  click: () => {
                    setIsBtn(7);
                    setForm({ ...form, jenis: "domisili" });
                  },
                  speak: "Ini tombol Surat Keterangan Domisili",
                },
                {
                  label: "Surat Pengantar KTP / KK",
                  img: "/images/anjungan/idcard.png",
                  click: () => {
                    setIsBtn(7);
                    setForm({ ...form, jenis: "ktp" });
                  },
                  speak: "Ini tombol Layanan Pertanahan & Aset",
                },
                {
                  label: "Surat Keterangan Lahir",
                  img: "/images/anjungan/birth.png",
                  click: () => {
                    setIsBtn(7);
                    setForm({ ...form, jenis: "lahir" });
                  },
                  speak: "Ini tombol Layanan Sosial & Kesejahteraan",
                },
                {
                  label: "Surat Keterangan Kematian",
                  img: "/images/anjungan/death-certificate.png",
                  click: () => {
                    setIsBtn(7);
                    setForm({ ...form, jenis: "kematian" });
                  },
                  speak: "Ini tombol Layanan Ekonomi & UMKM",
                },

                {
                  label: "Surat Keterangan Pindah",
                  img: "/images/anjungan/change.png",
                  click: () => {
                    setIsBtn(7);
                    setForm({ ...form, jenis: "pindah" });
                  },
                  speak: "Ini tombol  Surat Keterangan Pindah",
                },
                {
                  label: "Surat Keterangan Belum Menikah",
                  img: "/images/anjungan/people.png",
                  click: () => {
                    setIsBtn(7);
                    setForm({ ...form, jenis: "belumMenikah" });
                  },
                  speak: "Ini tombol Surat Keterangan Belum Menikah",
                },
                {
                  label: "Surat Keterangan Usaha (SKU)",
                  img: "/images/anjungan/store.png",
                  click: () => {
                    setIsBtn(7);
                    setForm({ ...form, jenis: "usaha" });
                  },
                  speak: "Ini tombol Keterangan Usaha (SKU)",
                },
                {
                  label: "Surat Keterangan Tidak Mampu (SKTM)",
                  img: "/images/anjungan/poor.png",
                  click: () => {
                    setIsBtn(7);
                    setForm({ ...form, jenis: "sktm" });
                  },
                  speak: "Ini tombol Surat Keterangan Tidak Mampu (SKTM)",
                },
                {
                  label: "Surat Keterangan Ahli Waris",
                  img: "/images/anjungan/heirarchy.png",
                  click: () => {
                    setIsBtn(7);
                    setForm({ ...form, jenis: "waris" });
                  },
                  speak: "Ini tombol Surat Keterangan Ahli Waris",
                },
              ].map((btn, i) => (
                <div
                  key={i}
                  className="p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:scale-105 transition"
                  onMouseEnter={() => speakText(btn.speak)}
                  onMouseLeave={stopSpeak}
                  onClick={btn.click}
                >
                  <img
                    src={btn.img}
                    alt={btn.label}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                  />
                  <div className="font-bold mt-2 text-sm sm:text-sm text-center">
                    {btn.label}
                  </div>
                </div>
              ))}
              {/* Tombol kembali */}
              <div
                className="p-4 flex flex-col items-center cursor-pointer hover:scale-105 transition"
                onMouseEnter={() => speakText("Kembali ke menu utama")}
                onMouseLeave={stopSpeak}
                onClick={() => setIsBtn(0)}
              >
                <img
                  src="/images/klg/kembali.png"
                  alt="Kembali"
                  className="w-16 h-16 object-contain"
                />
                <div className="font-bold mt-2 text-sm sm:text-base text-center">
                  Kembali
                </div>
              </div>
            </div>
          )}
          {/* Submenu Pengganti */}
          {isBtn == 2 && (
            <div className="sm:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 items-center justify-center">
              {[
                {
                  label: "Surat Keterangan Tanah",
                  img: "/images/anjungan/land.png",
                  click: () => {
                    setIsBtn(7);
                    setForm({ ...form, jenis: "suratKetTanah" });
                  },
                  speak: "Ini tombol Surat Keterangan Tanah",
                },
                {
                  label: "Riwayat kepemilikan tanah",
                  img: "/images/anjungan/acquisition.png",
                  click: () => alert("Sedang Dalam Pengembangan"),
                  speak: "Ini tombol Riwayat kepemilikan tanah",
                },
                {
                  label: "Pengantar sertifikat tanah (BPN)",
                  img: "/images/anjungan/supervising.png",
                  click: () => {
                    setIsBtn(7);
                    setForm({ ...form, jenis: "pengantarSertifikatTanah" });
                  },
                  speak: "Ini tombol Pengantar sertifikat tanah (BPN)",
                },
                {
                  label: "Surat jual beli / hibah tanah",
                  img: "/images/anjungan/landsell.png",
                  click: () => {
                    setIsBtn(7);
                    setForm({ ...form, jenis: "jualBeliHibahTanah" });
                  },
                  speak: "Ini tombol Layanan Ekonomi & UMKM",
                },
              ].map((btn, i) => (
                <div
                  key={i}
                  className="p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:scale-105 transition"
                  onMouseEnter={() => speakText(btn.speak)}
                  onMouseLeave={stopSpeak}
                  onClick={btn.click}
                >
                  <img
                    src={btn.img}
                    alt={btn.label}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                  />
                  <div className="font-bold mt-2 text-sm sm:text-base text-center">
                    {btn.label}
                  </div>
                </div>
              ))}
              {/* Tombol kembali */}
              <div
                className="p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:scale-105 transition"
                onMouseEnter={() => speakText("Kembali ke menu utama")}
                onMouseLeave={stopSpeak}
                onClick={() => setIsBtn(0)}
              >
                <img
                  src="/images/klg/kembali.png"
                  alt="Kembali"
                  className="w-16 h-16 object-contain"
                />
                <div className="font-bold mt-2 text-sm sm:text-base text-center">
                  Kembali
                </div>
              </div>
            </div>
          )}
          {/* Submenu Status Pengajuan */}{" "}
          {isBtn == 3 && (
            <div className="sm:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 items-center justify-center">
              {[
                {
                  label: "Pengajuan bantuan sosial",
                  img: "/images/anjungan/activism.png",
                  click: () => alert("Sedang Proses Pengembangan"),
                  speak: "Ini tombol Pengajuan bantuan sosial",
                },
                {
                  label: "Surat pengantar berobat / BPJS",
                  img: "/images/anjungan/healthcare.png",
                  click: () => {
                    setIsBtn(7);
                    setForm({ ...form, jenis: "bpjs" });
                  },
                  speak: "Ini tombol Layanan Pertanahan & Aset",
                },
                {
                  label: "Surat keterangan beasiswa",
                  img: "/images/anjungan/scholarship.png",
                  click: () => {
                    setIsBtn(7);
                    setForm({ ...form, jenis: "beasiswa" });
                  },
                  speak: "Ini tombol Layanan Sosial & Kesejahteraan",
                },
                {
                  label: "Bantuan rumah tidak layak huni",
                  img: "/images/anjungan/damaged-house.png",
                  click: () => {
                    setIsBtn(7);
                    setForm({ ...form, jenis: "beasiswa" });
                  },
                  speak: "Bantuan rumah tidak layak huni",
                },
              ].map((btn, i) => (
                <div
                  key={i}
                  className="p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:scale-105 transition"
                  onMouseEnter={() => speakText(btn.speak)}
                  onMouseLeave={stopSpeak}
                  onClick={btn.click}
                >
                  <img
                    src={btn.img}
                    alt={btn.label}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                  />
                  <div className="font-bold mt-2 text-sm sm:text-sm text-center">
                    {btn.label}
                  </div>
                </div>
              ))}
              {/* Tombol kembali */}
              <div
                className="p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:scale-105 transition"
                onMouseEnter={() => speakText("Kembali ke menu utama")}
                onMouseLeave={stopSpeak}
                onClick={() => setIsBtn(0)}
              >
                <img
                  src="/images/klg/kembali.png"
                  alt="Kembali"
                  className="w-16 h-16 object-contain"
                />
                <div className="font-bold mt-2 text-sm sm:text-base text-center">
                  Kembali
                </div>
              </div>
            </div>
          )}
          {/* Form Pendaftaran */}{" "}
          {isBtn == 4 && (
            <div className="sm:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 items-center justify-center">
              {[
                {
                  label: "Surat izin usaha mikro",
                  img: "/images/anjungan/planning.png",
                  click: () => setIsBtn(1),
                  speak: "Ini tombol Layanan Administrasi",
                },
                {
                  label: "Daftar UMKM Desa",
                  img: "/images/anjungan/entrepreneur.png",
                  click: () => setIsBtn(1),
                  speak: "Ini tombol Layanan Pertanahan & Aset",
                },
                {
                  label: "Akses Bantuan UMKM",
                  img: "/images/anjungan/social.png",
                  click: () => setIsBtn(1),
                  speak: "Ini tombol Layanan Sosial & Kesejahteraan",
                },
              ].map((btn, i) => (
                <div
                  key={i}
                  className="p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:scale-105 transition"
                  onMouseEnter={() => speakText(btn.speak)}
                  onMouseLeave={stopSpeak}
                  onClick={btn.click}
                >
                  <img
                    src={btn.img}
                    alt={btn.label}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                  />
                  <div className="font-bold mt-2 text-sm sm:text-base text-center">
                    {btn.label}
                  </div>
                </div>
              ))}
              {/* Tombol kembali */}
              <div
                className="p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:scale-105 transition"
                onMouseEnter={() => speakText("Kembali ke menu utama")}
                onMouseLeave={stopSpeak}
                onClick={() => setIsBtn(0)}
              >
                <img
                  src="/images/klg/kembali.png"
                  alt="Kembali"
                  className="w-16 h-16 object-contain"
                />
                <div className="font-bold mt-2 text-sm sm:text-base text-center">
                  Kembali
                </div>
              </div>
            </div>
          )}
          {/* Form Kartu rusak hilang */}{" "}
          {isBtn == 5 && (
            <>
              {/* ===================== INFORMATION DESA ===================== */}
              <section
                id="desa-info"
                className="relative py-28 px-6 overflow-hidden
  bg-white/30 backdrop-blur-sm rounded-lg"
              >
                {/* SOFT GOLD GLOW */}
                <div className="absolute -top-32 -left-32 w-[520px] h-[520px] bg-yellow-500/10 rounded-full blur-[180px]" />
                <div className="absolute bottom-0 -right-32 w-[480px] h-[480px] bg-amber-700/10 rounded-full blur-[160px]" />

                <div className="relative max-w-7xl mx-auto">
                  {/* TITLE */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                  >
                    <p className="text-sm tracking-widest uppercase  mb-3">
                      Informasi Wilayah
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold ">
                      Profil Desa & Potensi
                    </h2>
                    <p className="mt-4  max-w-2xl mx-auto">
                      Informasi singkat mengenai kondisi wilayah, potensi
                      ekonomi, dan layanan masyarakat yang tersedia di desa.
                    </p>
                  </motion.div>

                  {/* GRID CONTENT */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* CARD */}
                    {[
                      {
                        title: "Profil Desa",
                        desc: "Desa berkembang dengan potensi pertanian, UMKM, dan pariwisata lokal.",
                        icon: "🏘️",
                      },
                      {
                        title: "Layanan Publik",
                        desc: "Pelayanan administrasi kependudukan, perizinan, dan informasi masyarakat.",
                        icon: "📄",
                      },
                      {
                        title: "Potensi Ekonomi",
                        desc: "Produk unggulan desa meliputi pertanian organik, kerajinan lokal, dan kuliner.",
                        icon: "🌾",
                      },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15 }}
                        whileHover={{ y: -6, scale: 1.02 }}
                        className="relative rounded-3xl p-8
            bg-gradient-to-br from-[#1a140d] to-[#0f0b07]
            border border-[#d4af37]/20
            shadow-xl"
                      >
                        <div className="text-4xl mb-5">{item.icon}</div>

                        <h3 className="text-xl font-semibold text-[#f5e6c8] mb-3">
                          {item.title}
                        </h3>

                        <p className="text-sm leading-relaxed text-[#d6c6a3]/80">
                          {item.desc}
                        </p>

                        {/* GOLD LINE */}
                        <div
                          className="absolute bottom-0 left-0 w-full h-[2px]
            bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-20 text-center"
                    onClick={() => {
                      setIsBtn(0);
                    }}
                  >
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="#"
                      className="inline-flex items-center justify-center px-12 py-4 rounded-full
          bg-gradient-to-r from-[#d4af37] to-[#b8962e]
          text-black font-semibold shadow-[0_0_25px_rgba(212,175,55,0.35)]
          hover:shadow-[0_0_40px_rgba(212,175,55,0.6)]
          transition"
                    >
                      Kembali
                    </motion.a>
                  </motion.div>
                </div>
              </section>
            </>
          )}
          {isBtn == 6 && (
            <div className="sm:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 items-center justify-center">
              {[
                {
                  label: "Surat laporan kehilangan",
                  img: "/images/anjungan/police.png",
                  click: () => setIsBtn(1),
                  speak: "Ini tombol Surat laporan kehilangan",
                },
                {
                  label: "Surat izin keramaian",
                  img: "/images/anjungan/concert.png",
                  click: () => setIsBtn(1),
                  speak: "Ini tombol Surat izin keramaian",
                },
              ].map((btn, i) => (
                <div
                  key={i}
                  className="p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:scale-105 transition"
                  onMouseEnter={() => speakText(btn.speak)}
                  onMouseLeave={stopSpeak}
                  onClick={btn.click}
                >
                  <img
                    src={btn.img}
                    alt={btn.label}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                  />
                  <div className="font-bold mt-2 text-sm sm:text-base text-center">
                    {btn.label}
                  </div>
                </div>
              ))}
              {/* Tombol kembali */}
              <div
                className="p-4 bg-white/30 backdrop-blur-sm rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:scale-105 transition"
                onMouseEnter={() => speakText("Kembali ke menu utama")}
                onMouseLeave={stopSpeak}
                onClick={() => setIsBtn(0)}
              >
                <img
                  src="/images/klg/kembali.png"
                  alt="Kembali"
                  className="w-16 h-16 object-contain"
                />
                <div className="font-bold mt-2 text-sm sm:text-base text-center">
                  Kembali
                </div>
              </div>
            </div>
          )}
          {isBtn == 7 && (
            <>
              <div className="p-6 space-y-4 w-full">
                {/* Upload KTP */}
                <div className="space-y-2">
                  {/* 📸 PREVIEW FOTO */}
                  {photo ? (
                    <div className="space-y-2 ">
                      <div className="flex justify-center">
                        <img
                          src={photo}
                          className="rounded-xl w-[280px] border"
                          alt="Preview KTP"
                        />
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => setPhoto(null)}
                          className="bg-gray-500 text-white px-4 py-2 rounded w-[200px]"
                        >
                          🔄 Ambil Ulang
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 🎥 CAMERA */}
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="relative">
                          <div className="flex justify-center">
                            <Webcam
                              ref={webcamRef}
                              videoConstraints={videoConstraints}
                              screenshotFormat="image/jpeg" // 🔥 WAJIB GANTI
                              screenshotQuality={0.95}
                              className="
    rounded-xl
    w-full
    max-w-[420px]
    aspect-[4/3]
    object-contain
    bg-black
  "
                            />
                          </div>
                          {/* Guide frame */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="border-2 border-green-400 w-[360px] h-[210px] rounded-lg">
                              <p className="text-black-400 text-xs absolute -top-6 left-1/2 -translate-x-1/2">
                                Posisikan KTP di dalam kotak
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={capture}
                          className="bg-green-600 text-white px-4 py-2 rounded w-[380px]"
                        >
                          📸 Ambil Foto KTP
                        </button>
                      </div>
                    </>
                  )}

                  {loading && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-4 animate-in fade-in zoom-in">
                        {/* Spinner */}
                        <div className="w-14 h-14 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />

                        {/* Text */}
                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-800">
                            Memproses OCR KTP...
                          </p>
                          <p className="text-sm text-gray-500 animate-pulse">
                            Mohon tunggu sebentar
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* FORM */}
                {!loading && (
                  <>
                    <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg space-y-6">
                      <h3 className="text-lg font-bold text-gray-800">
                        Isi Form Dibawah
                      </h3>

                      {renderFormByJenis()}
                    </div>

                    {/* PRINT Submit */}
                    <div className="flex gap-4">
                      {" "}
                      <button
                        onClick={() => setIsBtn(1)}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        Back
                      </button>
                      <button
                        onClick={!loading && handleSubmitSurat}
                        disabled={loading}
                        className="
    w-full sm:w-auto
    bg-gradient-to-r from-green-600 to-emerald-500
    hover:scale-[1.02]
    active:scale-[0.98]
    transition
    text-white
    px-6 py-3
    rounded-xl
    shadow-md
    font-semibold
  "
                      >
                        {loading ? "⏳ Menyimpan..." : "🖨️ Submit & Print"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          {isBtn == 8 && (
            <>
              <div className="mb-4 flex gap-4">
                <button
                  onClick={() => setIsBtn(1)}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Back
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Print
                </button>
              </div>

              <SuratPreview form={form} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
