"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardSuratPro() {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [chart, setChart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = async () => {
    setLoading(true);

    const res = await fetch(
      `/api/anjungan/dashboard${statusFilter ? `?status=${statusFilter}` : ""}`,
    );

    const json = await res.json();

    setData(json.data || []);
    setStats(json.stats || {});
    setChart(json.chart || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/anjungan/surat/update-status", {
      method: "POST",
      body: JSON.stringify({ id, status }),
    });
    loadData();
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Surat Desa</h1>

      {/* ================= CARD STATS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total",
            value: stats.total,
            color: "from-indigo-500 to-blue-500",
          },
          {
            label: "Submit",
            value: stats.submit,
            color: "from-yellow-400 to-orange-400",
          },
          {
            label: "Approved",
            value: stats.approved,
            color: "from-emerald-500 to-green-500",
          },
          {
            label: "Rejected",
            value: stats.rejected,
            color: "from-rose-500 to-red-500",
          },
        ].map((c, i) => (
          <div
            key={i}
            className={`rounded-2xl p-6 text-white shadow-xl bg-gradient-to-r ${c.color} hover:scale-[1.03] transition`}
          >
            <p className="text-sm opacity-80">{c.label}</p>
            <p className="text-3xl font-bold">{c.value || 0}</p>
          </div>
        ))}
      </div>

      {/* ================= CHART ================= */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-blue-100">
        <h2 className="font-semibold mb-4 text-gray-700">Grafik Jenis Surat</h2>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chart}>
            <XAxis dataKey="jenis" />
            <Tooltip />
            <Bar dataKey="_count" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ================= FILTER ================= */}
      <div className="flex gap-3 flex-wrap">
        {["", "SUBMIT", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-semibold shadow transition
          ${
            statusFilter === s
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
              : "bg-white text-gray-700 hover:bg-blue-50"
          }`}
          >
            {s || "SEMUA"}
          </button>
        ))}
      </div>

      {/* ================= LOADING ================= */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative">
            <div className="w-20 h-20 border-[6px] border-blue-200 rounded-full"></div>
            <div className="w-20 h-20 border-[6px] border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 shadow-[0_0_25px_rgba(37,99,235,0.5)]"></div>
          </div>
          <p className="mt-6 text-lg font-semibold text-blue-600 animate-pulse">
            Memuat Dashboard Surat Desa...
          </p>
        </div>
      )}

      {/* ================= TABLE ================= */}
      {!loading && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <tr>
                <th className="p-3 text-left">Jenis</th>
                <th className="p-3 text-left">Nama</th>
                <th className="p-3 text-left">NIK</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-blue-50/60 transition"
                >
                  <td className="p-3 font-semibold text-gray-700">
                    {item.jenis}
                  </td>

                  <td className="p-3">{item.nama}</td>
                  <td className="p-3">{item.nik}</td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold shadow
                    ${
                      item.status === "APPROVED"
                        ? "bg-green-100 text-green-700 shadow-green-200"
                        : item.status === "REJECTED"
                          ? "bg-red-100 text-red-700 shadow-red-200"
                          : "bg-yellow-100 text-yellow-700 shadow-yellow-200"
                    }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => updateStatus(item.id, "APPROVED")}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow hover:scale-105 transition"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => updateStatus(item.id, "REJECTED")}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 text-white shadow hover:scale-105 transition"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              Tidak ada data surat
            </div>
          )}
        </div>
      )}
    </div>
  );
}
