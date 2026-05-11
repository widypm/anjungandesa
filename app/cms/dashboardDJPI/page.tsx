"use client";
import { useEffect, useState } from "react";
import { usePageTitle } from "../../lib/PageTitelCmsContext";
import dynamic from "next/dynamic";
const TableWPM = dynamic(() => import("../../components/cms/ui/Table"), {
  ssr: false, // <== penting
});
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  ChartOptions,
  TooltipItem,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { FetchData, formatPrice } from "app/lib/helper";
import { useSearchParams } from "next/navigation";
import { useDecryptedLoginState } from "app/lib/authUtils";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  ChartDataLabels
);
export default function CMSDashboard() {
  const { setTitle } = usePageTitle();

  // useEffect(() => {
  //   setTitle("Dashboard");
  // }, [setTitle]);
  const [showPercentages, setShowPercentages] = useState(true);
  const [dataPge, setDataPage] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const user = useDecryptedLoginState();

  // Sample data for Pie chart

  const pieOptions2: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom", // ✅ TypeScript menerima literal 'top'
      },
      title: {
        display: true,
        text: "Diagram Paket",
      },
      tooltip: {
        enabled: true,
        callbacks: {
          // Tambahkan tipe context agar TS aman
          label: function (context: TooltipItem<"pie">) {
            const label = context.label || "";
            const value = context.formattedValue || "";
            return `${label}: ${value}`;
          },
        },
      },
      datalabels: {
        color: "white", // warna angka
        anchor: "end", // posisi label relatif terhadap bar
        align: "start", // di atas bar
        rotation: -90, // putar vertikal (90 derajat kebalikan)
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value: number, context) => {
          const dataset = context.chart.data.datasets[0].data as number[];
          const total = dataset.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(2) + "%";
          return percentage;
        },
      },
    },
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "bottom" },
      title: { display: true, text: "Diagram Pagu Vs Realisasi" },
      datalabels: {
        color: "black",
        anchor: "center" as const, // label di tengah batang
        align: "end" as const,
        rotation: -90,
        font: { weight: "bold" as const, size: 12 },
        formatter: (value: number, context) => {
          const dataset = context.chart.data.datasets[0].data as number[];
          const total = dataset.reduce((a, b) => a + b, 0);
          return (
            formatPrice(value) +
            " - (" +
            ((value / total) * 100).toFixed(2) +
            "%)"
          );
        },
        clamp: false, // biarkan overlap batang, tidak dipaksa keluar
        offset: 0,
      },
    },
    scales: {
      x: { beginAtZero: true, title: { display: true, text: "Bulan" } },
      y: { beginAtZero: true, title: { display: true, text: "Nilai" } },
    },
  };
  const barOptions2: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Diagram Progress" },
      datalabels: {
        color: "black",
        anchor: "center" as const, // label di tengah batang
        align: "end" as const,
        rotation: -90,
        font: { weight: "bold" as const, size: 12 },
        formatter: (value: number, context) => {
          const dataset = context.chart.data.datasets[0].data as number[];
          const total = dataset.reduce((a, b) => a + b, 0);
          return (
            formatPrice(value) +
            " - (" +
            ((value / total) * 100).toFixed(2) +
            "%)"
          );
        },
        clamp: false, // biarkan overlap batang, tidak dipaksa keluar
        offset: 0,
      },
    },
    scales: {
      x: { beginAtZero: true, title: { display: true, text: "Bulan" } },
      y: { beginAtZero: true, title: { display: true, text: "Nilai" } },
    },
  };

  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);

      try {
        const rawQueryString = searchParams.toString(); // tanpa tanda tanya (?)
        const rawQs = rawQueryString.length > 0 ? "?" + rawQueryString : "";
        const dataapi = await FetchData(
          `api/djpi/dashboard${rawQs}`,
          "GET",
          "",
          false,
          user?.data?.token
        );
        // console.log("SUPERDATA", dataapi?.data?.pieSumPaket);
        setTitle(dataapi?.data?.title);
        setDataPage(dataapi?.data);
      } catch (err) {
        console.error("Failed to fetch form:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFormData();
  }, []);
  return (
    <div className="min-h-screen  text-gray-800">
      <div className="w-full px-12">
        <header className="mb-6 flex items-center justify-between">
          {/* Kiri */}
          <div className="flex flex-col items-center w-1/4">
            <img
              src="/images/dirjend.png"
              alt="Foto Kiri"
              className="w-20 h-20 rounded-full object-cover shadow-md"
            />
            <h3 className="mt-2 text-base font-semibold">
              IR. Rachman Arief Dienaputra, M.ENG{" "}
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Direktur Jendral Pembiayaan Infrastruktur Pekerjaan Umum
            </p>
          </div>

          {/* Tengah */}
          <div className="flex flex-col items-center text-center w-2/4">
            <h1 className="text-xl font-semibold">
              DASHBOARD DIGITALISASI PELAKSANAAN ANGGARAN DJPI
            </h1>
            <p className="text-sm text-gray-600">
              Monitoring Pelaksaan Anggaran
            </p>
          </div>

          {/* Kanan */}
          <div className="flex flex-col items-center w-1/4">
            <img
              src="/images/sdirjend.png"
              alt="Foto Kanan"
              className="w-20 h-20 rounded-full object-cover shadow-md"
            />
            <h3 className="mt-2 text-base font-semibold">
              Reni Ahiantini, S.T, M.SC
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Sekretaris Direktur Jendral Pembiayaan Infrastruktur Pekerjaan
              Umum
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card: Total, Users, Orders (simple stat cards) */}
          <div className="col-span-1 md:col-span-1 bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">Total Data Paket</div>
            <div className="text-2xl font-bold">
              {dataPge?.totalPaket ? (
                formatPrice(dataPge?.totalPaket, { withCurrency: false })
              ) : (
                <div className="flex justify-center items-center h-64">
                  {/* Spinner Tailwind */}
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                </div>
              )}
            </div>
            <div className="text-sm text-green-600">Data hari ini</div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">Total Data Blokir</div>
            <div className="text-2xl font-bold">
              {dataPge?.totalBlokir ? (
                formatPrice(dataPge?.totalBlokir, { withCurrency: false })
              ) : (
                <div className="flex justify-center items-center h-64">
                  {/* Spinner Tailwind */}
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                </div>
              )}
            </div>
            <div className="text-sm text-red-500">Data hari ini</div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-center items-center">
            <div className="text-2xl font-bold text-sky-500">
              <a href="/cms/module/unitkerja/djpi/list">Lihat Selengkapnya</a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Summary Data Paket</h2>
            {dataPge?.pieSumPaket ? (
              <Pie data={dataPge.pieSumPaket} options={pieOptions2} />
            ) : (
              <div className="flex justify-center items-center h-64">
                {/* Spinner Tailwind */}
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
              </div>
            )}
          </div>

          <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Jenis Paket</h2>
            {dataPge?.barSumJenisPaket ? (
              <Bar data={dataPge?.barSumJenisPaket} options={barOptions} />
            ) : (
              <div className="flex justify-center items-center h-64">
                {/* Spinner Tailwind */}
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
              </div>
            )}
          </div>
          <div className="col-span-1 lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Progress Bulanan</h2>
            {dataPge?.barSumPaket ? (
              <Bar data={dataPge?.barSumPaket} options={barOptions2} />
            ) : (
              <div className="flex justify-center items-center h-64">
                {/* Spinner Tailwind */}
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-6 text-xs text-gray-500">
          Generated example • Ubah data dan styling sesuai kebutuhan.
        </footer>
      </div>
    </div>
  );
}
