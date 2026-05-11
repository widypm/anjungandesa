"use client";

import { apiUrl } from "app/lib/helper";
import { useEffect, useState } from "react";
import Select from "react-select";

type Option = { value: string; label: string };

export default function AddressSelector({
  labelPrefix,
  value,
  onChange,
  disabled = false,
  showError = false,
}: {
  labelPrefix: string;
  value?: {
    prov?: Option | null;
    kota?: Option | null;
    kec?: Option | null;
    kel?: Option | null;
    alamat?: string;
    rt?: string;
    rw?: string;
  };
  onChange?: (val: any) => void;
  disabled?: boolean;
  showError?: boolean; // << tambahan
}) {
  const [provinsi, setProvinsi] = useState<Option[]>([]);
  const [kota, setKota] = useState<Option[]>([]);
  const [kecamatan, setKecamatan] = useState<Option[]>([]);
  const [kelurahan, setKelurahan] = useState<Option[]>([]);

  // Load provinsi
  useEffect(() => {
    fetch(apiUrl("/api/jli/fe/daerah?type=provinsi"))
      .then((r) => r.json())
      .then((data) =>
        setProvinsi(data.map((d: any) => ({ value: d.id, label: d.nama })))
      );
  }, []);

  // Load kota
  useEffect(() => {
    if (value?.prov?.value) {
      fetch(apiUrl(`/api/jli/fe/daerah?type=kota&parentId=${value.prov.value}`))
        .then((r) => r.json())
        .then((data) =>
          setKota(data.map((d: any) => ({ value: d.id, label: d.nama })))
        );
    } else {
      setKota([]);
    }
  }, [value?.prov]);

  // Load kecamatan
  useEffect(() => {
    if (value?.kota?.value) {
      fetch(
        apiUrl(`/api/jli/fe/daerah?type=kecamatan&parentId=${value.kota.value}`)
      )
        .then((r) => r.json())
        .then((data) =>
          setKecamatan(data.map((d: any) => ({ value: d.id, label: d.nama })))
        );
    } else {
      setKecamatan([]);
    }
  }, [value?.kota]);

  // Load kelurahan
  useEffect(() => {
    if (value?.kec?.value) {
      fetch(
        apiUrl(`/api/jli/fe/daerah?type=kelurahan&parentId=${value.kec.value}`)
      )
        .then((r) => r.json())
        .then((data) =>
          setKelurahan(data.map((d: any) => ({ value: d.id, label: d.nama })))
        );
    } else {
      setKelurahan([]);
    }
  }, [value?.kec]);

  const update = (key: string, val: any) => {
    let updated = { ...value };

    if (key === "prov") {
      updated = { prov: val, kota: null, kec: null, kel: null, alamat: "" };
    } else if (key === "kota") {
      updated = { ...value, kota: val, kec: null, kel: null };
    } else if (key === "kec") {
      updated = { ...value, kec: val, kel: null };
    } else if (key === "kel") {
      updated = { ...value, kel: val };
    }

    onChange?.(updated);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Provinsi */}
      <div>
        <label className="block text-sm font-medium mb-1">Provinsi</label>
        <Select
          options={provinsi}
          value={value?.prov || null}
          onChange={(v) => update("prov", v)}
          placeholder="Ketik atau pilih provinsi..."
          isSearchable
          isDisabled={disabled}
          className={`p-2 border rounded-md bg-white/70 w-full
    ${showError && !value.prov ? "border-red-500" : "border-gray-300"}`}
        />
      </div>

      {/* Kota */}
      <div>
        <label className="block text-sm font-medium mb-1">Kota</label>
        <Select
          options={kota}
          value={value?.kota || null}
          onChange={(v) => update("kota", v)}
          placeholder="Ketik atau pilih kota..."
          isSearchable
          isDisabled={disabled || !value?.prov}
          className={`p-2 border rounded-md bg-white/70 w-full
    ${showError && !value.kota ? "border-red-500" : "border-gray-300"}`}
        />
      </div>

      {/* Kecamatan */}
      <div>
        <label className="block text-sm font-medium mb-1">Kecamatan</label>
        <Select
          options={kecamatan}
          value={value?.kec || null}
          onChange={(v) => update("kec", v)}
          placeholder="Ketik atau pilih kecamatan..."
          isSearchable
          isDisabled={disabled || !value?.kota}
          className={`p-2 border rounded-md bg-white/70 w-full
    ${showError && !value.kec ? "border-red-500" : "border-gray-300"}`}
        />
      </div>

      {/* Kelurahan */}
      <div>
        <label className="block text-sm font-medium mb-1">Kelurahan</label>
        <Select
          options={kelurahan}
          value={value?.kel || null}
          onChange={(v) => update("kel", v)}
          placeholder="Ketik atau pilih kelurahan..."
          isSearchable
          isDisabled={disabled || !value?.kec}
          className={`p-2 border rounded-md bg-white/70 w-full
    ${showError && !value.kel ? "border-red-500" : "border-gray-300"}`}
        />
      </div>
      {/* RT */}
      <div>
        <label className="block text-sm font-medium mb-1">RT</label>
        <input
          type="text"
          onChange={(e) => update("rt", e.target.value)}
          placeholder="Masukkan RT"
          className="p-2 border border-gray-300 rounded-md bg-white/70"
        />
      </div>
      {/* RW */}
      <div>
        <label className="block text-sm font-medium mb-1">RW</label>
        <input
          type="text"
          className="p-2 border border-gray-300 rounded-md bg-white/70"
          onChange={(e) => update("rw", e.target.value)}
          placeholder="Masukkan RW"
        />
      </div>
    </div>
  );
}
