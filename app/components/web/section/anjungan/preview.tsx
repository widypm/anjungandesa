"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

/* ===================== TYPE ===================== */
type AhliWaris = {
  nama: string;
  nik: string;
  hubungan: string;
  alamat: string;
};

type FormData = {
  jenis: string;

  nik?: string;
  nama?: string;
  ttl?: string;
  alamat?: string;
  pekerjaan?: string;
  jk?: string;

  // Kelahiran
  ttlAnak?: string;
  ttlAnakKe?: string;
  namaAyah?: string;
  namaIbu?: string;

  // Kematian
  htlMeninggal?: string;
  ttlMeninggal?: string;
  sebabMeninggal?: string;

  // Pindah
  noKK?: string;
  alamatAsal?: string;
  alamatTujuan?: string;
  alasanPindah?: string;
  tglPindah?: string;

  // Usaha
  namaUsaha?: string;
  jenisUsaha?: string;
  alamatUsaha?: string;
  lamaUsaha?: string;

  // Tanah
  letakTanah?: string;
  luas?: string;
  batasUtara?: string;
  batasSelatan?: string;
  batasTimur?: string;
  batasBarat?: string;
  statusTanah?: string;
  penggunaanTanah?: string;

  // Waris
  ahliWaris?: AhliWaris[];

  /* ===== JUAL BELI / HIBAH ===== */
  jenisTransaksi?: string;
  namaPihakPertama?: string;
  nikPihakPertama?: string;
  namaPihakKedua?: string;
  nikPihakKedua?: string;

  /// ====== bpjs ===//
  noBpjs?: string;
  faskes?: string;
  /* ===== BEASISWA ===== */
  namaSekolah?: string;
  kelas?: string;
  nim?: string;
  jurusan?: string;
  namaOrtu?: string;
  penghasilanOrtu?: string;
};

type Props = {
  form: FormData;
};

/* ===================== HEADER ===================== */
const SuratHeader = () => (
  <>
    <div className="surat-header">
      <img
        src="/images/anjungan/logo-ponorogo.png"
        alt="Lambang Kabupaten Ponorogo"
        className="surat-logo"
      />
      <div className="surat-header-text">
        <p className="surat-header-top">PEMERINTAH KABUPATEN PONOROGO</p>
        <h1>KECAMATAN BALONG</h1>
        <h2>DESA KARANGPATIHAN</h2>
        <p>Jalan Werkudoro No. 27 A, Karangpatihan, Balong, Ponorogo</p>
        <p>Kode Pos 63461</p>
      </div>
    </div>
    <div className="surat-divider" />
  </>
);

/* ===================== MAIN ===================== */
export default function SuratPreview({ form }: Props) {
  const today = new Date().toLocaleDateString("id-ID");

  const renderSurat = () => {
    switch (form.jenis) {
      /* ================= DOMISILI ================= */
      case "domisili":
        return (
          <div id="print-area" className="a4">
            <SuratHeader />

            <h4 className="title">SURAT KETERANGAN DOMISILI</h4>
            <p className="nomor">Nomor: 470 / ...... / 2026</p>

            <p className="paragraph">
              Yang bertanda tangan di bawah ini Kepala Desa Sukamaju, Kecamatan
              Maju Jaya, Kabupaten Sejahtera, dengan ini menerangkan bahwa:
            </p>

            <table className="table">
              <tbody>
                <tr>
                  <td className="label">Nama</td>
                  <td>:</td>
                  <td>{form.nama || "-"}</td>
                </tr>
                <tr>
                  <td className="label">NIK</td>
                  <td>:</td>
                  <td>{form.nik || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Tempat / Tgl Lahir</td>
                  <td>:</td>
                  <td>{form.ttl || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Pekerjaan</td>
                  <td>:</td>
                  <td>{form.pekerjaan || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Alamat</td>
                  <td>:</td>
                  <td>{form.alamat || "-"}</td>
                </tr>
              </tbody>
            </table>

            <p className="paragraph">
              Adalah benar yang bersangkutan merupakan penduduk Desa Sukamaju
              dan berdomisili di alamat tersebut di atas.
            </p>

            <p className="paragraph">
              Surat keterangan ini dibuat untuk dipergunakan sebagaimana
              mestinya.
            </p>

            <Signature date={today} />
          </div>
        );

      /* ================= KTP ================= */
      case "ktp":
        return (
          <div id="print-area" className="a4">
            <SuratHeader />

            <h4 className="title">SURAT PENGANTAR PERMOHONAN KTP</h4>
            <p className="nomor">Nomor: 470 / ...... / 2026</p>

            <p className="paragraph">
              Yang bertanda tangan di bawah ini Kepala Desa Sukamaju, Kecamatan
              Maju Jaya, Kabupaten Sejahtera, dengan ini menerangkan bahwa:
            </p>

            <table className="table">
              <tbody>
                <tr>
                  <td className="label">Nama</td>
                  <td>:</td>
                  <td>{form.nama || "-"}</td>
                </tr>
                <tr>
                  <td className="label">NIK</td>
                  <td>:</td>
                  <td>{form.nik || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Tempat / Tgl Lahir</td>
                  <td>:</td>
                  <td>{form.ttl || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Pekerjaan</td>
                  <td>:</td>
                  <td>{form.pekerjaan || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Alamat</td>
                  <td>:</td>
                  <td>{form.alamat || "-"}</td>
                </tr>
              </tbody>
            </table>

            <p className="paragraph">
              Adalah benar penduduk Desa Sukamaju dan yang bersangkutan
              bermaksud mengajukan permohonan pembuatan Kartu Tanda Penduduk
              (KTP) ke Dinas Kependudukan dan Pencatatan Sipil Kabupaten
              Sejahtera.
            </p>

            <p className="paragraph">
              Demikian surat pengantar ini dibuat untuk dapat dipergunakan
              sebagaimana mestinya.
            </p>

            <Signature date={today} />
          </div>
        );

      /* ================= KEMATIAN ================= */
      case "kematian":
        return (
          <div id="print-area" className="a4">
            <SuratHeader />

            <h4 className="title">SURAT KETERANGAN KEMATIAN</h4>
            <p className="nomor">Nomor: 474.3 / ...... / 2026</p>

            <p className="paragraph">
              Yang bertanda tangan di bawah ini Kepala Desa Sukamaju, Kecamatan
              Maju Jaya, Kabupaten Sejahtera, dengan ini menerangkan bahwa:
            </p>

            <table className="table">
              <tbody>
                <tr>
                  <td className="label">Nama</td>
                  <td>:</td>
                  <td>{form.nama || "-"}</td>
                </tr>
                <tr>
                  <td className="label">NIK</td>
                  <td>:</td>
                  <td>{form.nik || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Tanggal Meninggal</td>
                  <td>:</td>
                  <td>{form.htlMeninggal || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Sebab Meninggal</td>
                  <td>:</td>
                  <td>{form.sebabMeninggal || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Alamat Terakhir</td>
                  <td>:</td>
                  <td>{form.alamat || "-"}</td>
                </tr>
              </tbody>
            </table>

            <p className="paragraph">
              Adalah benar yang bersangkutan telah meninggal dunia sebagaimana
              data tersebut di atas dan merupakan penduduk Desa Sukamaju.
            </p>

            <p className="paragraph">
              Surat keterangan ini dibuat sebagai persyaratan pengurusan Akta
              Kematian dan keperluan administrasi lainnya.
            </p>

            <Signature date={today} />
          </div>
        );

      /* ================= USAHA ================= */
      case "usaha":
        return (
          <div id="print-area" className="a4">
            <SuratHeader />

            <h4 className="title">SURAT KETERANGAN USAHA</h4>
            <p className="nomor">Nomor: 510 / ...... / 2026</p>

            <p className="paragraph">Dengan ini menerangkan bahwa:</p>

            <table className="table">
              <tbody>
                <tr>
                  <td className="label">Nama Pemilik</td>
                  <td>:</td>
                  <td>{form.nama || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Nama Usaha</td>
                  <td>:</td>
                  <td>{form.namaUsaha || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Jenis Usaha</td>
                  <td>:</td>
                  <td>{form.jenisUsaha || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Alamat Usaha</td>
                  <td>:</td>
                  <td>{form.alamatUsaha || "-"}</td>
                </tr>
              </tbody>
            </table>

            <p className="paragraph">
              Berdasarkan keterangan yang ada pada kami, benar bahwa yang
              bersangkutan memiliki dan menjalankan usaha tersebut di wilayah
              Desa Sukamaju.
            </p>

            <p className="paragraph">
              Surat ini dibuat untuk keperluan administrasi, permodalan, maupun
              keperluan lain yang sah.
            </p>

            <Signature date={today} />
          </div>
        );
      // ========== lahir ===============//
      case "lahir":
        return (
          <div id="print-area" className="a4">
            <SuratHeader />

            <h4 className="title">SURAT KETERANGAN LAHIR</h4>
            <p className="nomor">Nomor: 474.1 / ...... / 2026</p>

            <p className="paragraph">
              Yang bertanda tangan di bawah ini Kepala Desa Sukamaju, Kecamatan
              Maju Jaya, Kabupaten Sejahtera, dengan ini menerangkan bahwa:
            </p>

            <table className="table">
              <tbody>
                <tr>
                  <td className="label">Nama Anak</td>
                  <td>:</td>
                  <td>{form.nama || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Tempat / Tgl Lahir</td>
                  <td>:</td>
                  <td>{form.ttlAnak || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Nama Ayah</td>
                  <td>:</td>
                  <td>{form.namaAyah || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Nama Ibu</td>
                  <td>:</td>
                  <td>{form.namaIbu || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Alamat Orang Tua</td>
                  <td>:</td>
                  <td>{form.alamat || "-"}</td>
                </tr>
              </tbody>
            </table>

            <p className="paragraph">
              Adalah benar telah lahir seorang anak sebagaimana data tersebut di
              atas dan merupakan penduduk Desa Sukamaju.
            </p>

            <p className="paragraph">
              Surat keterangan ini dibuat untuk keperluan pengurusan Akta
              Kelahiran dan administrasi lainnya.
            </p>

            <Signature date={today} />
          </div>
        );
      // ==============pindah ======//
      case "pindah":
        return (
          <div id="print-area" className="a4">
            <SuratHeader />

            <h4 className="title">SURAT KETERANGAN PINDAH DOMISILI</h4>
            <p className="nomor">Nomor: 470 / ...... / 2026</p>

            <p className="paragraph">Dengan ini menerangkan bahwa:</p>

            <table className="table">
              <tbody>
                <tr>
                  <td className="label">Nama</td>
                  <td>:</td>
                  <td>{form.nama || "-"}</td>
                </tr>
                <tr>
                  <td className="label">NIK</td>
                  <td>:</td>
                  <td>{form.nik || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Alamat Asal</td>
                  <td>:</td>
                  <td>{form.alamatAsal || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Alamat Tujuan</td>
                  <td>:</td>
                  <td>{form.alamatTujuan || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Alasan Pindah</td>
                  <td>:</td>
                  <td>{form.alasanPindah || "-"}</td>
                </tr>
              </tbody>
            </table>

            <p className="paragraph">
              Yang bersangkutan benar telah mengajukan permohonan pindah
              domisili sebagaimana alamat tersebut di atas.
            </p>

            <Signature date={today} />
          </div>
        );
      // ====== belum nikah ===========//
      case "belumMenikah":
        return (
          <div id="print-area" className="a4">
            <SuratHeader />

            <h4 className="title">SURAT KETERANGAN BELUM MENIKAH</h4>
            <p className="nomor">Nomor: 474.2 / ...... / 2026</p>

            <p className="paragraph">Dengan ini menerangkan bahwa:</p>

            <table className="table">
              <tbody>
                <tr>
                  <td className="label">Nama</td>
                  <td>:</td>
                  <td>{form.nama || "-"}</td>
                </tr>
                <tr>
                  <td className="label">NIK</td>
                  <td>:</td>
                  <td>{form.nik || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Tempat / Tgl Lahir</td>
                  <td>:</td>
                  <td>{form.ttl || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Pekerjaan</td>
                  <td>:</td>
                  <td>{form.pekerjaan || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Alamat</td>
                  <td>:</td>
                  <td>{form.alamat || "-"}</td>
                </tr>
              </tbody>
            </table>

            <p className="paragraph">
              Berdasarkan data dan keterangan yang ada pada kami, yang
              bersangkutan sampai dengan surat ini diterbitkan{" "}
              <b>belum pernah menikah</b>.
            </p>

            <Signature date={today} />
          </div>
        );
      // ============ sktm ===========//
      case "sktm":
        return (
          <div id="print-area" className="a4">
            <SuratHeader />

            <h4 className="title">SURAT KETERANGAN TIDAK MAMPU</h4>
            <p className="nomor">Nomor: 460 / ...... / 2026</p>

            <p className="paragraph">Dengan ini menerangkan bahwa:</p>

            <table className="table">
              <tbody>
                <tr>
                  <td className="label">Nama</td>
                  <td>:</td>
                  <td>{form.nama || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Pekerjaan</td>
                  <td>:</td>
                  <td>{form.pekerjaan || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Alamat</td>
                  <td>:</td>
                  <td>{form.alamat || "-"}</td>
                </tr>
              </tbody>
            </table>

            <p className="paragraph">
              Yang bersangkutan benar termasuk dalam kategori keluarga tidak
              mampu dan layak mendapatkan bantuan sesuai ketentuan yang berlaku.
            </p>

            <Signature date={today} />
          </div>
        );
      ///============waris============///
      case "waris":
        return (
          <div id="print-area" className="a4">
            <SuratHeader />

            <h4 className="title">SURAT KETERANGAN AHLI WARIS</h4>
            <p className="nomor">Nomor: 474.4 / ...... / 2026</p>

            <p className="paragraph">
              Almarhum / Almarhumah: <b>{form.nama || "-"}</b>
            </p>

            <table className="table">
              <thead>
                <tr>
                  <td>No</td>
                  <td>Nama</td>
                  <td>NIK</td>
                  <td>Hubungan</td>
                  <td>Alamat</td>
                </tr>
              </thead>
              <tbody>
                {form.ahliWaris?.length ? (
                  form.ahliWaris.map((a, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{a.nama}</td>
                      <td>{a.nik}</td>
                      <td>{a.hubungan}</td>
                      <td>{a.alamat}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
                      -
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <Signature date={today} />
          </div>
        );
      // ================= pengantarSertiBPN =======//
      case "pengantarSertifikatTanah":
        return (
          <div id="print-area" className="a4">
            <SuratHeader />

            <h4 className="title">
              SURAT PENGANTAR PERMOHONAN SERTIFIKAT TANAH
            </h4>
            <p className="nomor">Nomor: 593 / ...... / 2026</p>

            <p className="paragraph">
              Yang bertanda tangan di bawah ini Kepala Desa Sukamaju, Kecamatan
              Maju Jaya, Kabupaten Sejahtera, dengan ini menerangkan bahwa:
            </p>

            <table className="table">
              <tbody>
                <tr>
                  <td className="label">Nama Pemohon</td>
                  <td>:</td>
                  <td>{form.nama || "-"}</td>
                </tr>
                <tr>
                  <td className="label">NIK</td>
                  <td>:</td>
                  <td>{form.nik || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Alamat</td>
                  <td>:</td>
                  <td>{form.alamat || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Letak Tanah</td>
                  <td>:</td>
                  <td>{form.letakTanah || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Luas Tanah</td>
                  <td>:</td>
                  <td>{form.luas || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Batas Utara</td>
                  <td>:</td>
                  <td>{form.batasUtara || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Batas Selatan</td>
                  <td>:</td>
                  <td>{form.batasSelatan || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Batas Timur</td>
                  <td>:</td>
                  <td>{form.batasTimur || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Batas Barat</td>
                  <td>:</td>
                  <td>{form.batasBarat || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Status Tanah</td>
                  <td>:</td>
                  <td>{form.statusTanah || "-"}</td>
                </tr>
              </tbody>
            </table>

            <p className="paragraph">
              Bahwa tanah tersebut di atas benar berada di wilayah Desa Sukamaju
              dan dikuasai oleh yang bersangkutan serta tidak dalam sengketa
              dengan pihak manapun.
            </p>

            <p className="paragraph">
              Surat pengantar ini dibuat sebagai kelengkapan administrasi
              permohonan penerbitan sertifikat hak atas tanah pada Kantor Badan
              Pertanahan Nasional (BPN) Kabupaten Sejahtera.
            </p>

            <p className="paragraph">
              Demikian surat pengantar ini dibuat untuk dapat dipergunakan
              sebagaimana mestinya.
            </p>

            <Signature date={today} />
          </div>
        );
      // ======== Tanah AJB ====== //
      case "jualBeliHibahTanah":
        return (
          <div id="print-area" className="a4">
            <SuratHeader />

            <h4 className="title">
              SURAT KETERANGAN{" "}
              {form.jenisTransaksi?.toUpperCase() || "JUAL BELI / HIBAH"} TANAH
            </h4>
            <p className="nomor">Nomor: 593 / ...... / 2026</p>

            <p className="paragraph">
              Yang bertanda tangan di bawah ini Kepala Desa Sukamaju, Kecamatan
              Maju Jaya, Kabupaten Sejahtera, dengan ini menerangkan bahwa telah
              terjadi <b>{form.jenisTransaksi || "jual beli / hibah"}</b> tanah
              antara:
            </p>

            <table className="table">
              <tbody>
                <tr>
                  <td className="label">Pihak Pertama</td>
                  <td>:</td>
                  <td>{form.namaPihakPertama || "-"}</td>
                </tr>
                <tr>
                  <td className="label">NIK</td>
                  <td>:</td>
                  <td>{form.nikPihakPertama || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Pihak Kedua</td>
                  <td>:</td>
                  <td>{form.namaPihakKedua || "-"}</td>
                </tr>
                <tr>
                  <td className="label">NIK</td>
                  <td>:</td>
                  <td>{form.nikPihakKedua || "-"}</td>
                </tr>
              </tbody>
            </table>

            <p className="paragraph">
              Adapun objek tanah yang menjadi{" "}
              <b>{form.jenisTransaksi || "transaksi"}</b>
              adalah sebagai berikut:
            </p>

            <table className="table">
              <tbody>
                <tr>
                  <td className="label">Letak Tanah</td>
                  <td>:</td>
                  <td>{form.letakTanah || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Luas Tanah</td>
                  <td>:</td>
                  <td>{form.luas || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Batas Utara</td>
                  <td>:</td>
                  <td>{form.batasUtara || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Batas Selatan</td>
                  <td>:</td>
                  <td>{form.batasSelatan || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Batas Timur</td>
                  <td>:</td>
                  <td>{form.batasTimur || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Batas Barat</td>
                  <td>:</td>
                  <td>{form.batasBarat || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Status Tanah</td>
                  <td>:</td>
                  <td>{form.statusTanah || "-"}</td>
                </tr>
              </tbody>
            </table>

            <p className="paragraph">
              Bahwa tanah tersebut benar berada di wilayah Desa Sukamaju, tidak
              dalam sengketa, dan telah disepakati oleh kedua belah pihak tanpa
              adanya paksaan dari pihak manapun.
            </p>

            <p className="paragraph">
              Surat keterangan ini dibuat sebagai dasar administrasi desa dan
              dapat dipergunakan untuk keperluan pengurusan lebih lanjut sesuai
              dengan ketentuan peraturan perundang-undangan yang berlaku.
            </p>

            <Signature date={today} />
          </div>
        );

      /* ================= TANAH ================= */
      case "suratKetTanah":
        return (
          <div id="print-area" className="a4">
            <SuratHeader />

            <h4 className="title">SURAT KETERANGAN TANAH</h4>
            <p className="nomor">Nomor: 593 / ...... / 2026</p>

            <p className="paragraph">
              Yang bertanda tangan di bawah ini Kepala Desa Sukamaju, Kecamatan
              Maju Jaya, Kabupaten Sejahtera, dengan ini menerangkan bahwa:
            </p>

            <table className="table">
              <tbody>
                <tr>
                  <td className="label">Nama Pemilik Tanah</td>
                  <td>:</td>
                  <td>{form.nama || "-"}</td>
                </tr>
                <tr>
                  <td className="label">NIK</td>
                  <td>:</td>
                  <td>{form.nik || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Alamat Pemilik</td>
                  <td>:</td>
                  <td>{form.alamat || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Letak Tanah</td>
                  <td>:</td>
                  <td>{form.letakTanah || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Luas Tanah</td>
                  <td>:</td>
                  <td>{form.luas || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Batas Utara</td>
                  <td>:</td>
                  <td>{form.batasUtara || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Batas Selatan</td>
                  <td>:</td>
                  <td>{form.batasSelatan || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Batas Barat</td>
                  <td>:</td>
                  <td>{form.batasBarat || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Batas Timur</td>
                  <td>:</td>
                  <td>{form.batasTimur || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Status Tanah</td>
                  <td>:</td>
                  <td>{form.statusTanah || "Hak Milik / Garapan"}</td>
                </tr>
                <tr>
                  <td className="label">Penggunaan Tanah</td>
                  <td>:</td>
                  <td>{form.penggunaanTanah || "-"}</td>
                </tr>
              </tbody>
            </table>

            <p className="paragraph">
              Berdasarkan keterangan dan penguasaan fisik yang ada, benar bahwa
              tanah tersebut di atas dikuasai dan dimiliki oleh yang
              bersangkutan serta tidak dalam sengketa dengan pihak manapun.
            </p>

            <p className="paragraph">
              Surat keterangan ini dibuat untuk keperluan pengurusan pertanahan,
              pendaftaran, pengajuan sertifikat, maupun keperluan administrasi
              lainnya yang sah sesuai dengan peraturan yang berlaku.
            </p>

            <Signature date={today} />
          </div>
        );
      // ============== bpjs ========//
      case "bpjs":
        return (
          <div id="print-area" className="a4">
            <SuratHeader />

            <h4 className="title">SURAT PENGANTAR BEROBAT / BPJS</h4>
            <p className="nomor">Nomor: 440 / ...... / 2026</p>

            <p className="paragraph">
              Yang bertanda tangan di bawah ini Kepala Desa Sukamaju, Kecamatan
              Maju Jaya, Kabupaten Sejahtera, dengan ini menerangkan bahwa:
            </p>

            <table className="table">
              <tbody>
                <tr>
                  <td className="label">Nama</td>
                  <td>:</td>
                  <td>{form.nama || "-"}</td>
                </tr>
                <tr>
                  <td className="label">NIK</td>
                  <td>:</td>
                  <td>{form.nik || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Tempat / Tgl Lahir</td>
                  <td>:</td>
                  <td>{form.ttl || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Pekerjaan</td>
                  <td>:</td>
                  <td>{form.pekerjaan || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Alamat</td>
                  <td>:</td>
                  <td>{form.alamat || "-"}</td>
                </tr>
                <tr>
                  <td className="label">No. BPJS</td>
                  <td>:</td>
                  <td>{form.noBpjs || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Faskes Tujuan</td>
                  <td>:</td>
                  <td>{form.faskes || "-"}</td>
                </tr>
              </tbody>
            </table>

            <p className="paragraph">
              Bahwa yang bersangkutan benar merupakan penduduk Desa Sukamaju dan
              bermaksud melakukan pengobatan menggunakan fasilitas BPJS
              Kesehatan sebagaimana mestinya.
            </p>

            <p className="paragraph">
              Surat pengantar ini dibuat sebagai kelengkapan administrasi
              pelayanan kesehatan dan dapat dipergunakan sebagaimana mestinya.
            </p>

            <Signature date={today} />
          </div>
        );
      case "beasiswa":
        return (
          <div id="print-area" className="a4">
            <SuratHeader />

            <h4 className="title">SURAT KETERANGAN BEASISWA</h4>
            <p className="nomor">Nomor: 421 / ...... / 2026</p>

            <p className="paragraph">
              Yang bertanda tangan di bawah ini Kepala Desa Sukamaju, Kecamatan
              Maju Jaya, Kabupaten Sejahtera, dengan ini menerangkan bahwa:
            </p>

            <table className="table">
              <tbody>
                <tr>
                  <td className="label">Nama</td>
                  <td>:</td>
                  <td>{form.nama || "-"}</td>
                </tr>
                <tr>
                  <td className="label">NIK</td>
                  <td>:</td>
                  <td>{form.nik || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Tempat / Tgl Lahir</td>
                  <td>:</td>
                  <td>{form.ttl || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Sekolah / Kampus</td>
                  <td>:</td>
                  <td>{form.namaSekolah || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Kelas / Semester</td>
                  <td>:</td>
                  <td>{form.kelas || "-"}</td>
                </tr>
                <tr>
                  <td className="label">NIM / NISN</td>
                  <td>:</td>
                  <td>{form.nim || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Jurusan</td>
                  <td>:</td>
                  <td>{form.jurusan || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Nama Orang Tua</td>
                  <td>:</td>
                  <td>{form.namaOrtu || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Penghasilan Orang Tua</td>
                  <td>:</td>
                  <td>{form.penghasilanOrtu || "-"}</td>
                </tr>
                <tr>
                  <td className="label">Alamat</td>
                  <td>:</td>
                  <td>{form.alamat || "-"}</td>
                </tr>
              </tbody>
            </table>

            <p className="paragraph">
              Berdasarkan data dan keterangan yang ada pada kami, benar bahwa
              yang bersangkutan merupakan penduduk Desa Sukamaju dan sedang
              menempuh pendidikan serta membutuhkan dukungan bantuan beasiswa.
            </p>

            <p className="paragraph">
              Surat keterangan ini dibuat sebagai salah satu persyaratan
              pengajuan beasiswa dan dapat dipergunakan sebagaimana mestinya.
            </p>

            <Signature date={today} />
          </div>
        );

      default:
        return null;
    }
  };

  return <>{renderSurat()}</>;
}

/* ===================== SIGNATURE ===================== */
const SIGNATURE_QR_VALUE =
  "anjungan desa mandiri - SIGNATURE - | Kepala Desa Karang Patihan Ponorogo";

const Signature = ({ date }: { date: string }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(SIGNATURE_QR_VALUE, {
      width: 132,
      margin: 1,
    })
      .then(setQrCodeUrl)
      .catch((error) => {
        console.error("Failed to generate signature QR", error);
      });
  }, []);

  return (
    <div className="signature">
      <p>Karang Patihan, {date}</p>
      <p>Kepala Desa Karang Patihan Ponorogo</p>
      {qrCodeUrl ? (
        <img
          src={qrCodeUrl}
          alt="QR Signature Kepala Desa"
          className="mx-auto my-3 h-24 w-24"
        />
      ) : (
        <div className="mx-auto my-3 h-24 w-24 border border-black/30" />
      )}
      <p>
        <b>( EKO MULYADI,S.I.P , M.Pd )</b>
      </p>
    </div>
  );
};
