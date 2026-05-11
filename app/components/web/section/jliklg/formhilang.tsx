import UploadInput from "app/components/cms/ui/UploadInput";
import React, { useEffect, useState } from "react";
import Toast from "app/components/cms/ui/Toast";
import { apiUrl, FetchData, GetEncrypt } from "app/lib/helper";
import Select from "react-select";
interface Props {
  onBack: () => void;
  isHilang: string;
}

export default function FormRusakHilang({ onBack, isHilang }: Props) {
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(
    null
  );
  const [nik, setNik] = useState("");
  const [filedt, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestTime, setRequestTime] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

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
  async function handleSubmit() {
    if (!filedt) {
      setToast({
        message: "Wajib Upload Dokumen",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const aesraw = GetEncrypt(
        JSON.stringify({
          nik: nik,
          files: filedt,
          ptoId: lokasi?.pto?.value,
          ptoLokasiId: lokasi?.ptoLokasi?.value,
          requestTime: requestTime,
          type: isHilang,
        })
      );
      const dataapi = await FetchData(
        `api/jli/fe/postklgpengajuan`,
        "POST",
        aesraw,
        true,
        "",
        true
      );
      if (dataapi.code == "200") {
        setSubmitted(false);
      } else {
        setSubmitted(false);
        setToast({ message: dataapi?.message, type: "error" });
      }
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || "Terjadi kesalahan", type: "error" });
    } finally {
      setLoading(false);
    }
  }
  // Load pto
  const [lokasi, setLokasi] = useState<any>({
    pto: null,
    ptoLokasi: null,
    kelId: null,
  });
  const isEmpty = (v: any) => !v || v.trim?.() === "";
  const [ptoOpt, setPtoOpt] = useState([]);
  const [ptoOptLokasi, setPtoLokasiOpt] = useState([]);
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
  // --- State untuk lokasiambil ---

  return (
    <div className="flex items-center justify-center w-full px-4 py-6">
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white/30 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden p-2">
        <div className="w-full">
          <div className="w-full flex justify-center font-bold">
            {isHilang == "Hilang" ? (
              <h2>Pengajuan Kartu Hilang</h2>
            ) : (
              <h2>Pengajuan Kartu Rusak</h2>
            )}
          </div>

          <div className="w-full flex flex-col gap-4 mt-6">
            {/* ============== NIK ============== */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                NIK
              </label>
              <input
                type="text"
                placeholder="Masukkan NIK"
                className="p-2 border rounded-md bg-white/70 focus:outline-none focus:ring-2"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* ============== Upload Input ============== */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                {isHilang == "Hilang"
                  ? "Surat Keterangan Tanda Lapor Kehilangan (SKTLK)"
                  : "Foto Kartu Rusak"}
              </label>

              <UploadInput
                label=""
                onFileReady={(base64) => setFile(base64)}
                initialPreview={null}
              />
            </div>

            {/* ============== Select PTO ============== */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Lokasi PTO
              </label>
              <Select
                options={ptoOpt}
                value={lokasi?.pto || null}
                onChange={(v) => setLokasi({ ...lokasi, pto: v })}
                placeholder="Ketik atau pilih Lokasi ..."
                isSearchable
                isDisabled={false}
                className={`p-2 border rounded-md bg-white/70 ${
                  submitted && isEmpty(lokasi.pto)
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
            </div>

            {/* ============== Select PTO Lokasi ============== */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Halte / Stasiun Pengambilan
              </label>
              <Select
                options={ptoOptLokasi}
                value={lokasi?.ptoLokasi || null}
                onChange={(v) => setLokasi({ ...lokasi, ptoLokasi: v })}
                placeholder="Ketik atau pilih Halte / Statisiun..."
                isSearchable
                isDisabled={false}
                className={`p-2 border rounded-md bg-white/70 ${
                  submitted && isEmpty(lokasi.pto)
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
            </div>

            {/* ============== Button ============== */}
            <div className="w-full flex gap-4 mt-4">
              <button
                onClick={onBack}
                className="w-full sm:w-auto px-4 py-2 bg-gray-400/70 text-white rounded-lg hover:bg-gray-500 transition"
              >
                Kembali
              </button>

              <button
                onClick={handleSubmit}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                {loading ? "Menyimpan..." : "Kirim"}
              </button>
            </div>
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

// Pastikan UploadInput diimport dari komponen Anda
