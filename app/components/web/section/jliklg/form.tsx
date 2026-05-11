"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaIdCard,
  FaFileUpload,
  FaSearchLocation,
  FaLock,
} from "react-icons/fa";
import AddressSelector from "../../address/addressSelector";
import Toast from "app/components/cms/ui/Toast";
import { apiUrl, FetchData, GetEncrypt } from "app/lib/helper";
import UploadInput from "app/components/cms/ui/UploadInput";
import Select from "react-select";
import { InputActionMeta } from "react-select";

type Props = {
  dataGol: any;
  back: () => void;
};

export default function FormPendaftaran({ dataGol, back }: Props) {
  const [step, setStep] = useState(1);
  const [sameAsKtp, setSameAsKtp] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(
    null
  );
  const isEmpty = (v: any) => !v || v.trim?.() === "";
  const [submitted, setSubmitted] = useState(false);
  const [ptoOpt, setPtoOpt] = useState([]);
  const [ptoOptLokasi, setPtoLokasiOpt] = useState([]);

  // --- State untuk data diri ---
  const [dataDiri, setDataDiri] = useState({
    nik: "",
    namaLengkap: "",
    tempatLahir: "",
    tanggalLahir: "",
    gender: "",
  });
  // --- State untuk lokasiambil ---
  const [lokasi, setLokasi] = useState<any>({
    pto: null,
    ptoLokasi: null,
    kelId: null,
  });
  // --- State untuk keamanan ---
  const [keamanan, setKeamanan] = useState<any>({
    password: "",
    rePassword: "",
  });
  // simpan hasil pilihan AddressSelector KTP dan Domisili
  const [alamatKtp, setAlamatKtp] = useState<any>({
    prov: null,
    kota: null,
    kec: null,
    kel: null,
    rt: "",
    rw: "",
    alamat: "",
  });

  const [alamatDom, setAlamatDom] = useState<any>({
    prov: null,
    kota: null,
    kec: null,
    kel: null,
    rt: "",
    rw: "",
    alamat: "",
  });

  const [uploadId, setUploadId] = useState<any>({});
  const [loading, setLoading] = useState(false);
  // kalau checkbox dicentang → copy data dari KTP
  const handleCheckbox = (checked: boolean) => {
    setSameAsKtp(checked);
    if (checked) setAlamatDom({ ...alamatKtp });
  };
  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  const validateFields = () => {
    if (!dataDiri.nik.trim()) return "NIK wajib diisi";
    if (dataDiri.nik.trim().length !== 16) return "NIK harus 16 digit";

    if (!dataDiri.namaLengkap.trim()) return "Nama Lengkap wajib diisi";
    if (!dataDiri.tempatLahir.trim()) return "Tempat Lahir wajib diisi";
    if (!dataDiri.tanggalLahir) return "Tanggal Lahir wajib diisi";

    if (
      !alamatKtp.prov ||
      !alamatKtp.kota ||
      !alamatKtp.kec ||
      !alamatKtp.kel ||
      !alamatKtp.alamat.trim()
    )
      return "Lengkapi alamat KTP";

    if (
      !alamatDom.prov ||
      !alamatDom.kota ||
      !alamatDom.kec ||
      !alamatDom.kel ||
      !alamatDom.alamat.trim()
    )
      return "Lengkapi alamat Domisili";

    return null;
  };
  const [requestTime, setRequestTime] = useState<number | null>(null);

  useEffect(() => {
    async function fetchRequestTime() {
      try {
        const dataapi = await FetchData(
          `api/jli/fe/gettime`,
          "GET",
          "",
          false,
          ""
        );
        setRequestTime(dataapi?.data?.requestTime);
      } catch (err) {
        console.error("Gagal memuat request time:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRequestTime();
  }, []);
  // Load pto
  useEffect(() => {
    fetch(apiUrl("/api/jli/fe/getpto?type=pto"))
      .then((r) => r.json())
      .then((data) =>
        setPtoOpt(data.map((d: any) => ({ value: d.id, label: d.name })))
      );
  }, []);

  // Load ptolokasi
  useEffect(() => {
    if (lokasi?.pto?.value) {
      fetch(
        apiUrl(
          `/api/jli/fe/getpto?type=ptolokasi&parentId=${lokasi?.pto?.value}`
        )
      )
        .then((r) => r.json())
        .then((data) =>
          setPtoLokasiOpt(
            data.map((d: any) => ({ value: d.id, label: d.name }))
          )
        );
    } else {
      setPtoLokasiOpt([]);
    }
  }, [lokasi?.pto?.value]);

  const handleSubmit = async () => {
    setSubmitted(true); // aktifkan error border
    const errorMsg = validateFields();
    if (errorMsg) {
      // alert(errorMsg);
      setToast({ message: errorMsg, type: "error" });
      return;
    }
    setLoading(true);
    try {
      const aesraw = GetEncrypt(
        JSON.stringify({
          klgKategory: dataGol?.id,
          nik: dataDiri.nik,
          nama: dataDiri.namaLengkap,
          tempatLahir: dataDiri.tempatLahir,
          tanggalLahir: dataDiri.tanggalLahir,
          ktpProvId: alamatKtp.prov.value,
          ktpKotaId: alamatKtp.kota.value,
          ktpKecId: alamatKtp.kec.value,
          ktpKelId: alamatKtp.kel.value,
          ktpAlamat: alamatKtp.alamat,
          domisiliProvId: alamatDom.prov.value,
          domisiliKotaId: alamatDom.kota.value,
          domisiliKecId: alamatDom.kec.value,
          domisiliKelId: alamatDom.kel.value,
          domisiliAlamat: alamatDom.alamat,
          statusId: "1", // contoh default status
          requestTime: requestTime,
          jenisKelamin: dataDiri.gender,
        })
      );

      const dataapi = await FetchData(
        `api/jli/fe/postklg`,
        "POST",
        aesraw,
        true,
        "",
        true
      );
      if (dataapi?.code == "200") {
        // router.push("/cms/module/" + moduleName + "/list");
        // setToast({ message: "Data berhasil disimpan!", type: "success" });

        // alert("Data berhasil disimpan!");
        setSubmitted(false);
        nextStep(); // lanjut ke step berikutnya
      } else {
        setSubmitted(false);
        setToast({ message: "Nik Sudah terdaftar", type: "error" });
      }
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Terjadi kesalahan", type: "error" });
    } finally {
      setLoading(false);
    }
  };
  async function handleSubmitUploadId() {
    if (dataGol?.fileA != "0") {
      if (!uploadId.fileA) {
        setToast({
          message: "Wajib Upload Dokumen" + dataGol?.fileA,
          type: "error",
        });
        return;
      }
    }
    if (dataGol?.fileB != "0") {
      if (!uploadId.fileB) {
        setToast({
          message: "Wajib Upload Dokumen" + dataGol?.fileB,
          type: "error",
        });
        return;
      }
    }
    if (dataGol?.fileC != "0") {
      if (!uploadId.fileC) {
        setToast({
          message: "Wajib Upload Dokumen" + dataGol?.fileC,
          type: "error",
        });
        return;
      }
    }
    if (dataGol?.fileD != "0") {
      if (!uploadId.fileD) {
        setToast({
          message: "Wajib Upload Dokumen" + dataGol?.fileD,
          type: "error",
        });
        return;
      }
    }
    if (dataGol?.fileE != "0") {
      if (!uploadId.fileE) {
        setToast({
          message: "Wajib Upload Dokumen" + dataGol?.fileE,
          type: "error",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const aesraw = GetEncrypt(
        JSON.stringify({
          nik: dataDiri.nik,
          fileA: uploadId.fileA,
          fileB: uploadId.fileB,
          fileC: uploadId.fileC,
          fileD: uploadId.fileD,
          fileE: uploadId.fileE,
          requestTime: requestTime,
        })
      );
      const dataapi = await FetchData(
        `api/jli/fe/postklguploadid`,
        "POST",
        aesraw,
        true,
        "",
        true
      );
      if (dataapi.code == "200") {
        // router.push("/cms/module/" + moduleName + "/list");
        // setToast({ message: "Upload berhasil disimpan!", type: "success" });
        // alert("Data berhasil disimpan!");
        setSubmitted(false);
        nextStep();
      } else {
        setSubmitted(false);
        setToast({ message: "Terjadi Kendala", type: "error" });
      }
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Terjadi kesalahan", type: "error" });
    } finally {
      setLoading(false);
    }
  }
  async function handleSubmitLokasi() {
    if (alamatKtp.prov.value == "31") {
      setSubmitted(false);
      nextStep();
      return;
    }
    if (!lokasi.pto || !lokasi.ptoLokasi) {
      setToast({
        message: "Wajib Pilih lokasi pengambilan kartu",
        type: "error",
      });
      return;
    }
    setLoading(true);
    try {
      const aesraw = GetEncrypt(
        JSON.stringify({
          nik: dataDiri.nik,
          prov: alamatKtp?.prov?.value,
          pto: lokasi?.pto,
          ptoLokasi: lokasi?.ptoLokasi,
          requestTime: requestTime,
        })
      );
      const dataapi = await FetchData(
        `api/jli/fe/postklglokasi`,
        "POST",
        aesraw,
        true,
        "",
        true
      );
      if (dataapi.code == "200") {
        // router.push("/cms/module/" + moduleName + "/list");
        // setToast({ message: "Upload berhasil disimpan!", type: "success" });
        // alert("Data berhasil disimpan!");
        setSubmitted(false);
        nextStep();
      }
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Terjadi kesalahan", type: "error" });
    } finally {
      setLoading(false);
    }
  }
  async function handleSubmitFinal() {
    if (!keamanan.password || !keamanan.rePassword) {
      setToast({
        message: "Wajib Membuat Sandi.",
        type: "error",
      });
      return;
    }
    setLoading(true);
    try {
      const aesraw = GetEncrypt(
        JSON.stringify({
          nik: dataDiri?.nik,
          prov: alamatKtp?.prov,
          ptoSelected: lokasi?.pto?.value,
          password: keamanan?.password,
          rePassword: keamanan?.rePassword,
          requestTime: requestTime,
        })
      );
      const dataapi = await FetchData(
        `api/jli/fe/postklgsubmit`,
        "POST",
        aesraw,
        true,
        "",
        true
      );
      if (dataapi.code == "200") {
        // router.push("/cms/module/" + moduleName + "/list");
        setToast({ message: "Data berhasil disimpan.", type: "success" });
        // alert("Data berhasil disimpan!");
        nextStep();
      }
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Terjadi kesalahan", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center w-full px-4 py-6">
      <div
        className="flex flex-col md:flex-row w-full max-w-6xl bg-white/30 
                   backdrop-blur-md rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Sidebar Step */}
        <div
          className="w-full md:w-1/3 bg-white/40 backdrop-blur-lg 
                     p-4 sm:p-6 flex flex-col "
        >
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-800 text-center">
            Langkah Pendaftaran
          </h2>

          <div className="mb-4 text-center">
            <div className="flex items-center justify-center h-[60px] mb-2">
              <img
                src={dataGol?.src}
                alt={dataGol?.text}
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
              />
            </div>
            <div className="text-xs sm:text-sm text-center px-1 leading-snug">
              {dataGol?.text}
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-3 sm:gap-4 w-full justify-center items-center">
            <StepItem icon={<FaUser />} title="Data Diri" active={step === 1} />
            <StepItem
              icon={<FaIdCard />}
              title="Dokumen Identitas"
              active={step === 2}
            />

            <StepItem
              icon={<FaSearchLocation />}
              title="Lokasi Pengambilan"
              active={step === 3}
            />
            <StepItem icon={<FaLock />} title="Keamanan" active={step === 4} />
          </div>
        </div>

        {/* Form Content */}
        <div className="w-full md:w-2/3 p-5 sm:p-8 flex flex-col justify-between">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {step === 1 && (
              <>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 border-b pb-1">
                  Data Diri
                </h3>

                {/* ================= Data Diri ================= */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {/* NIK */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      NIK
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan NIK"
                      className={`p-2 border rounded-md bg-white/70 focus:outline-none focus:ring-2 ${
                        submitted && isEmpty(dataDiri.nik)
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      value={dataDiri.nik}
                      onChange={(e) =>
                        setDataDiri({ ...dataDiri, nik: e.target.value })
                      }
                    />
                  </div>

                  {/* Nama Lengkap */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      className={`p-2 border rounded-md bg-white/70 focus:outline-none focus:ring-2 ${
                        submitted && isEmpty(dataDiri.namaLengkap)
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      value={dataDiri.namaLengkap}
                      onChange={(e) =>
                        setDataDiri({
                          ...dataDiri,
                          namaLengkap: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Tempat Lahir */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Tempat Lahir
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan tempat lahir"
                      className={`p-2 border rounded-md bg-white/70 ${
                        submitted && isEmpty(dataDiri.tempatLahir)
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      value={dataDiri.tempatLahir}
                      onChange={(e) =>
                        setDataDiri({
                          ...dataDiri,
                          tempatLahir: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Tanggal Lahir */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      className={`p-2 border rounded-md bg-white/70 ${
                        submitted && !dataDiri.tanggalLahir
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      value={dataDiri.tanggalLahir}
                      onChange={(e) =>
                        setDataDiri({
                          ...dataDiri,
                          tanggalLahir: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Jenis Kelamin
                    </label>
                    <select
                      value={dataDiri.gender}
                      onChange={(e) =>
                        setDataDiri({ ...dataDiri, gender: e.target.value })
                      }
                      className={`p-2 border rounded-md bg-white/70 ${
                        submitted && !dataDiri.gender
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">-- pilih jenis kelamin --</option>
                      <option value="PEREMPUAN">PEREMPUAN</option>
                      <option value="LAKI-LAKI">LAKI-LAKI</option>
                    </select>
                  </div>
                </div>

                {/* ================= Alamat KTP ================= */}
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Alamat KTP
                  </h4>

                  <AddressSelector
                    labelPrefix="KTP"
                    value={alamatKtp}
                    onChange={setAlamatKtp}
                    showError={
                      submitted &&
                      (!alamatKtp.provinsi ||
                        !alamatKtp.kabupaten ||
                        !alamatKtp.kecamatan ||
                        !alamatKtp.kelurahan)
                    }
                  />

                  {/* Alamat */}
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mt-2 w-full">
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Alamat Jalan KTP
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan alamat"
                        className={`p-2 border rounded-md bg-white/70 w-full ${
                          submitted && isEmpty(alamatKtp.alamat)
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        value={alamatKtp.alamat}
                        onChange={(e) =>
                          setAlamatKtp({ ...alamatKtp, alamat: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* ================= Alamat Domisili ================= */}
                <div className="mt-6 border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">
                      Alamat Domisili
                    </h4>
                    <label className="flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={sameAsKtp}
                        onChange={(e) => handleCheckbox(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span>Sama dengan alamat KTP</span>
                    </label>
                  </div>

                  <AddressSelector
                    labelPrefix="Domisili"
                    value={alamatDom}
                    onChange={(val) => {
                      setAlamatDom(val);
                      if (sameAsKtp) setSameAsKtp(false);
                    }}
                    disabled={sameAsKtp}
                    showError={
                      submitted &&
                      !sameAsKtp &&
                      (!alamatDom.provinsi ||
                        !alamatDom.kabupaten ||
                        !alamatDom.kecamatan ||
                        !alamatDom.kelurahan)
                    }
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mt-2">
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Alamat Jalan Domisili
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan alamat domisili"
                        className={`p-2 border rounded-md bg-white/70 w-full ${
                          submitted && isEmpty(alamatDom.alamat)
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        value={alamatDom.alamat}
                        onChange={(e) =>
                          setAlamatDom({ ...alamatDom, alamat: e.target.value })
                        }
                        disabled={sameAsKtp}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-lg font-semibold text-gray-800">
                  Upload Dokumen
                </h3>
                <div className="space-y-3">
                  {dataGol?.fileA != "0" && (
                    <UploadInput
                      label={dataGol?.fileA}
                      onFileReady={(base64) =>
                        setUploadId((prev) => ({ ...prev, fileA: base64 }))
                      }
                      initialPreview={uploadId?.fileA}
                    />
                  )}
                  {dataGol?.fileB != "0" && (
                    <UploadInput
                      label={dataGol?.fileB}
                      onFileReady={(base64) =>
                        setUploadId((prev) => ({ ...prev, fileB: base64 }))
                      }
                      initialPreview={uploadId?.fileB}
                    />
                  )}
                  {dataGol?.fileC != "0" && (
                    <UploadInput
                      label={dataGol?.fileC}
                      onFileReady={(base64) =>
                        setUploadId((prev) => ({ ...prev, fileC: base64 }))
                      }
                      initialPreview={uploadId?.fileC}
                    />
                  )}
                  {dataGol?.fileD != "0" && (
                    <UploadInput
                      label={dataGol?.fileD}
                      onFileReady={(base64) =>
                        setUploadId((prev) => ({ ...prev, fileD: base64 }))
                      }
                      initialPreview={uploadId?.fileD}
                    />
                  )}
                  {dataGol?.fileE != "0" && (
                    <UploadInput
                      label={dataGol?.fileE}
                      onFileReady={(base64) =>
                        setUploadId((prev) => ({ ...prev, fileE: base64 }))
                      }
                      initialPreview={uploadId?.fileE}
                    />
                  )}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Lokasi Pengambilan
                </h3>
                <div className="space-y-3">
                  {alamatKtp?.prov?.value == "31" ? (
                    <>
                      <div>lokasi pengambilan kartu di kelurahan</div>
                    </>
                  ) : (
                    <>
                      <Select
                        options={ptoOpt}
                        value={lokasi?.pto || null}
                        onChange={(v) => setLokasi({ ...lokasi, pto: v })}
                        placeholder="Ketik atau pilih Lokasi ..."
                        isSearchable
                        isDisabled={false}
                        className={`p-2 border rounded-md bg-white/70 sm:col-span-2 
    ${submitted && isEmpty(lokasi.pto) ? "border-red-500" : "border-gray-300"}`}
                      />
                      <Select
                        options={ptoOptLokasi}
                        value={lokasi?.ptoLokasi || null}
                        onChange={(v) => setLokasi({ ...lokasi, ptoLokasi: v })}
                        placeholder="Ketik atau pilih Halte / Statsiun..."
                        isSearchable
                        isDisabled={false}
                        className={`p-2 border rounded-md bg-white/70 sm:col-span-2 
    ${submitted && isEmpty(lokasi.pto) ? "border-red-500" : "border-gray-300"}`}
                      />
                    </>
                  )}
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Lokasi Pengambilan
                </h3>
                <div className="space-y-3 ">
                  <input
                    type="password"
                    placeholder="Kata Sandi"
                    className={`p-2 border rounded-md bg-white/70 focus:outline-none focus:ring-2 
    ${
      submitted && isEmpty(keamanan.password)
        ? "border-red-500"
        : "border-gray-300"
    }`}
                    value={keamanan.password}
                    onChange={(e) =>
                      setKeamanan({ ...keamanan, password: e.target.value })
                    }
                  />
                  <input
                    type="password"
                    placeholder="Ulangi Kata Sandi"
                    className={`p-2 border rounded-md bg-white/70 focus:outline-none focus:ring-2 
    ${
      submitted && isEmpty(keamanan.rePassword)
        ? "border-red-500"
        : "border-gray-300"
    }`}
                    value={keamanan.rePassword}
                    onChange={(e) =>
                      setKeamanan({ ...keamanan, rePassword: e.target.value })
                    }
                  />
                </div>
              </>
            )}
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
            <button
              onClick={step > 1 ? prevStep : back}
              className="w-full sm:w-auto px-4 py-2 bg-gray-400/70 text-white rounded-lg hover:bg-gray-500 transition"
            >
              Kembali
            </button>

            {step < 4 ? (
              <button
                onClick={() => {
                  if (step == 1) {
                    handleSubmit();
                  } else if (step == 2) {
                    handleSubmitUploadId();
                  } else if (step == 3) {
                    handleSubmitLokasi();
                  }
                }}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Lanjut"}
              </button>
            ) : (
              <button
                onClick={() => {
                  handleSubmitFinal();
                }}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Kirim Formulir
              </button>
            )}
          </div>
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type as any}
          onClose={() => setToast(null)}
          position="bottom-center"
        />
      )}
    </div>
  );
}

// Komponen Sidebar Step
function StepItem({
  icon,
  title,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  active: boolean;
}) {
  return (
    <div
      className={`flex flex-col justify-center  items-center gap-2 p-3 rounded-lg text-center transition w-[170px] sm:w-[180px]
        ${
          active
            ? "bg-blue-600 text-white shadow-md scale-[1.02]"
            : "bg-white/60 text-gray-700"
        }
      `}
    >
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          active ? "border-white bg-blue-500" : "border-gray-400"
        }`}
      >
        {icon}
      </div>
      <span className="text-xs sm:text-sm font-medium">{title}</span>
    </div>
  );
}
