import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff, FiInfo, FiMove } from "react-icons/fi";
import Select from "react-select";
import {
  FetchData,
  formatPrice,
  generatePassword,
  GetEncrypt,
} from "../../../lib/helper";
import AsyncSelect from "react-select/async";
import { FieldType } from "../../../types";
import { Editor } from "@tinymce/tinymce-react";
import Script from "next/script";
import UploadFlmngr from "./UploadFlmngrWrapper";
import { useDecryptedLoginState } from "../../../lib/authUtils";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
type Option = { label: string; value: any };

type Props = {
  type: FieldType;
  label: string;
  name: string;
  value?: any;
  options?: Option[]; // fallback options
  fetchOptions?: (inputValue?: string) => Promise<Option[]>; // 🆕 fetch options from API
  onChange: (name: string, value: any, notCopy?: boolean) => void;
  formatOptionLabel?: (data: Option) => React.ReactNode;
  fieldAddRow?: any[];
  uriSelect?: string;
  disabled?: boolean;
  formValues?: Record<string, any>; // ⬅️ Tambahkan ini
  trigerValue?: string[];
  info?: string;
};

export default function InputField({
  type,
  label,
  name,
  value,
  options = [],
  fetchOptions,
  onChange,
  formatOptionLabel,
  fieldAddRow,
  uriSelect,
  disabled,
  formValues,
  trigerValue,
  info,
}: Props) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectOptions, setSelectOptions] = useState<Option[]>(options);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [hasFetchedOptions, setHasFetchedOptions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [expanded, setExpanded] = useState<number[]>([]);

  const toggleExpand = (idx: number) => {
    setExpanded((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };
  // 🆕 Fetch options on mount if it's select and fetchOptions is provided
  useEffect(() => {
    if (
      (type === "select-single" || type === "select-multi") &&
      fetchOptions &&
      !hasFetchedOptions
    ) {
      setLoadingOptions(true);
      fetchOptions()
        .then((fetched) => {
          setSelectOptions(fetched);
          setHasFetchedOptions(true); // 🆕 jangan fetch ulang
        })
        .finally(() => setLoadingOptions(false));
    }
  }, [type, fetchOptions, hasFetchedOptions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(name, file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const parsePrice = (val: string): number => {
    // Buang semua karakter kecuali angka
    const clean = val.replace(/\D/g, "");
    return parseInt(clean, 10) || 0;
  };
  const user = useDecryptedLoginState();
  // Fungsi bertingkat: terima uri dulu, lalu return fungsi loadOptions
  const fetchOptionsData =
    (url: string, params: Record<string, any> = {}) =>
    async (inputValue: string) => {
      try {
        const searchParams = new URLSearchParams();
        if (inputValue) {
          searchParams.set("search", inputValue);
        }
        for (const key in params) {
          if (params[key] !== undefined && params[key] !== null) {
            searchParams.append(key, params[key]);
          }
        }
        const response = await FetchData(
          `${url}?${searchParams.toString()}`,
          "GET",
          "",
          false,
          user?.data?.token
        );
        return response?.data ?? [];
      } catch (err) {
        console.error("Error fetching options:", err);
        return [];
      }
    };
  const isFieldHidden = (field: any, formValues: any) => {
    if (!field.hideFields) return false;

    return field.hideFields.some((condition: any) => {
      const names = Array.isArray(condition.name)
        ? condition.name
        : [condition.name];
      return names.some((n: string) =>
        condition.value.includes(
          typeof formValues[n] == "object" ? formValues[n].value : formValues[n]
        )
      );
    });
  };

  const isFieldDisabled = (field: any, formValues: any) => {
    if (!field.disableFields) return false;

    return field.disableFields.some((condition: any) => {
      const names = Array.isArray(condition.name)
        ? condition.name
        : [condition.name];
      return names.some((n: string) =>
        condition.value.includes(
          typeof formValues[n] == "object" ? formValues[n].value : formValues[n]
        )
      );
    });
  };
  const handleDrop = (targetIdx: number) => {
    if (draggedIndex === null || draggedIndex === targetIdx) return;
    const updated = [...value];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIdx, 0, moved);
    onChange(name, updated);
    setDraggedIndex(null);
  };

  return (
    <React.Fragment key={name}>
      {type != "hide" && (
        <div className="">
          {label != "" && (
            <div className="block mb-1 flex gap-2 items-center justify-between font-medium text-gray-700">
              <div className="flex items-center gap-2">
                {label}
                {info && (
                  <div className="relative inline-block group">
                    <FiInfo
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      size={14}
                    />
                    <div
                      className="absolute hidden group-hover:block -top-12 left-1/2 
               bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-md
               max-w-[250px] whitespace-normal break-words leading-snug text-left
               w-max z-40"
                    >
                      {info}
                    </div>
                  </div>
                )}
              </div>
              {type == "password-repassword" && (
                <button
                  type="button"
                  onClick={() => {
                    const newPassword = generatePassword();
                    onChange(name, {
                      password: newPassword,
                      repassword: newPassword,
                    });
                  }}
                  className="text-blue-500 hover:text-blue-700 text-xs font-semibold"
                  title="Generate Password"
                >
                  Generate
                </button>
              )}
              {(type == "addRowTable" || type == "addRowCard") && (
                <button
                  type="button"
                  onClick={() =>
                    onChange(name, [
                      ...(value || []),
                      Object.fromEntries(
                        fieldAddRow.map((f) => [f.name, f.value])
                      ),
                    ])
                  }
                  className="mt-2 px-3 py-1 font-bold mb-2  rounded text-sm bg-gray-100 hover:bg-gray-200"
                >
                  + Add Item
                </button>
              )}
            </div>
          )}

          {type === "textarea" ? (
            <textarea
              name={name}
              value={value}
              onChange={(e) => onChange(name, e.target.value)}
              className={`w-full border rounded p-2 ${
                disabled ? " !bg-gray-200" : " "
              }`}
              disabled={disabled}
            />
          ) : type === "text-editor" ? (
            <Editor
              disabled={disabled}
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              value={value}
              onEditorChange={(content) => onChange(name, content)}
              licenseKey="gpl"
              init={{
                height: 300,
                // menubar: false,
                menubar: "file edit view insert format tools table help",
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "charmap",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "code",
                  "help",
                  "wordcount",
                  "image",
                  "link",
                  "file-manager",
                ],
                toolbar:
                  "code undo redo | formatselect | bold italic underline | " +
                  "alignleft aligncenter alignright alignjustify | " +
                  "bullist numlist outdent indent | removeformat | flmngr | file-manager ",

                Flmngr: {
                  apiKey: "FLMNFLMN", // Default free key
                  urlFileManager: process.env.NEXT_PUBLIC_FLMANAGER_URI ?? "",
                  urlFiles:
                    process.env.NEXT_PUBLIC_FLMANAGER_FILE ??
                    "/" + "uploads/FileManager",
                },
                flmngr: {
                  apiKey: "FLMNFLMN",
                  uploadUrl: "", // <--- kosongkan untuk menonaktifkan upload
                },
              }}
            />
          ) : type === "checkbox" ? (
            <input
              type="checkbox"
              name={name}
              checked={!!value}
              onChange={(e) => onChange(name, e.target.checked)}
              className={`h-4 w-4 ${disabled ? " !bg-gray-200" : " "}`}
              disabled={disabled}
            />
          ) : type === "switch" ? (
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => onChange(name, e.target.checked)}
                className={`sr-only peer ${disabled ? " !bg-gray-200" : " "}`}
                disabled={disabled}
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 relative transition">
                <div
                  className={
                    (!value ? "left-1 " : "right-1 ") +
                    "absolute  top-1 w-4 h-4 bg-white rounded-full transform transition-transform peer-checked:translate-x-5"
                  }
                ></div>
              </div>
            </label>
          ) : type === "select-single" || type === "select-multi" ? (
            <AsyncSelect
              isMulti={type === "select-multi"}
              name={name}
              value={value}
              loadOptions={fetchOptionsData(
                uriSelect || "",
                (() => {
                  if (!trigerValue || !Array.isArray(trigerValue)) return {};

                  const params: Record<string, any> = {};
                  for (const trigName of trigerValue) {
                    const val = formValues?.[trigName];
                    if (typeof val === "object" && val?.value !== undefined) {
                      params[trigName] = val.value;
                    } else if (val !== undefined) {
                      params[trigName] = val;
                    }
                  }
                  return params;
                })()
              )}
              isLoading={loadingOptions}
              defaultOptions={true} // penting!
              onChange={(selected) => onChange(name, selected)}
              className="text-sm"
              formatOptionLabel={formatOptionLabel}
              isClearable
              isDisabled={disabled}
              // 🔽 Tambahkan ini
              menuPortalTarget={
                typeof window !== "undefined" ? document.body : null
              }
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          ) : type === "file" ? (
            <>
              <input
                type="file"
                name={name}
                onChange={handleFileChange}
                className={`w-full ${disabled ? " !bg-gray-200" : " "}`}
                disabled={disabled}
              />
              {filePreview && (
                <img
                  src={filePreview}
                  alt="preview"
                  className="mt-2 h-32 object-contain border"
                />
              )}
            </>
          ) : type === "price" ? (
            <input
              type="text"
              name={name}
              value={formatPrice(value ?? "")}
              onChange={(e) => {
                const rawValue = parsePrice(e.target.value);
                onChange(name, rawValue);
              }}
              className={`w-full border rounded p-1 px-2 text-right ${
                disabled ? " !bg-gray-200" : " "
              }`}
              disabled={disabled}
            />
          ) : type === "password" || type === "password-repassword" ? (
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name={name}
                  value={value?.password || ""}
                  onChange={(e) =>
                    onChange(name, { ...value, password: e.target.value })
                  }
                  className={`w-full border rounded p-1 pl-2 pr-10 ${
                    disabled ? " !bg-gray-200" : " "
                  }`}
                  placeholder="Password"
                  disabled={disabled}
                />
                <div
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>
              {type === "password-repassword" && (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name={`${name}_confirm`}
                    value={value?.repassword || ""}
                    onChange={(e) =>
                      onChange(name, { ...value, repassword: e.target.value })
                    }
                    className={`w-full border rounded p-2 pr-10 ${
                      disabled ? " !bg-gray-200" : " "
                    }`}
                    placeholder="Ulangi Password"
                    disabled={disabled}
                  />
                  <div
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </div>
                </div>
              )}
              {type === "password-repassword" &&
                value?.password &&
                value?.repassword &&
                value.password !== value.repassword && (
                  <p className="text-xs text-red-500 mt-1">
                    Password tidak cocok
                  </p>
                )}
            </div>
          ) : type === "autocomplete" ? (
            <AsyncSelect
              cacheOptions
              defaultOptions
              value={value}
              loadOptions={(inputValue) =>
                fetchOptions ? fetchOptions(inputValue) : Promise.resolve([])
              }
              onChange={(selected) => onChange(name, selected)}
              className="text-sm"
              formatOptionLabel={formatOptionLabel}
              isDisabled={disabled}
            />
          ) : type === "upload-fm" ? (
            <React.Fragment>
              {disabled ? (
                <div className={`${disabled ? " !bg-gray-200" : " "}`}></div>
              ) : (
                <UploadFlmngr
                  name={name}
                  value={value}
                  onChange={(name, val) => {
                    onChange(name, val);
                  }}
                />
              )}
            </React.Fragment>
          ) : type === "addRowTable" ? (
            <div className="overflow-x-auto">
              <table className="w-full border border-sky-200 rounded shadow bg-white">
                <thead className="bg-sky-50 text-sky-700">
                  <tr>
                    <th className="px-3 py-2 text-left w-12">#</th>
                    {fieldAddRow.map((field, i) => (
                      <th key={i} className="px-3 py-2 text-left">
                        {field.label}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center w-16">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {(value || []).map((item: any, idx: number) => (
                    <tr
                      key={idx}
                      className="border-t border-sky-100 hover:bg-sky-50 transition"
                    >
                      <td className="px-3 py-2 font-medium text-sky-600">
                        {idx + 1}
                      </td>

                      {fieldAddRow.map((field, i) => {
                        const hidden = isFieldHidden(field, item);
                        if (hidden) return null;

                        return (
                          <td key={i} className="px-3 py-2">
                            <InputField
                              type={field.type}
                              name={field.name}
                              label=""
                              value={item[field.name]}
                              onChange={(subName, subVal) => {
                                const updated = [...value];
                                const updatedItem = { ...updated[idx] };

                                // Replace value
                                const currentField = fieldAddRow?.find(
                                  (f) => f.name === subName
                                );
                                let finalValue = subVal;
                                if (
                                  currentField?.replaceValue &&
                                  typeof subVal === "string"
                                ) {
                                  const { from, to } =
                                    currentField.replaceValue;
                                  finalValue = subVal.split(from).join(to);
                                }
                                updatedItem[subName] = finalValue;

                                // SameValue processing
                                if (currentField?.sameValue?.length > 0) {
                                  for (const sameFieldName of currentField.sameValue) {
                                    const targetField = fieldAddRow?.find(
                                      (f) => f.name === sameFieldName
                                    );
                                    let copiedValue = finalValue;
                                    if (
                                      targetField?.replaceValue &&
                                      typeof copiedValue === "string"
                                    ) {
                                      const { from, to } =
                                        targetField.replaceValue;
                                      copiedValue = copiedValue
                                        .split(from)
                                        .join(to);
                                    }
                                    updatedItem[sameFieldName] = copiedValue;
                                  }
                                }

                                updated[idx] = updatedItem;
                                let noCopy = field.allLang ? false : true;
                                onChange(name, updated, noCopy);
                              }}
                              uriSelect={field.uriSelect}
                              disabled={field.disabled ?? false}
                              formValues={item}
                              trigerValue={field.trigerValue}
                            />
                          </td>
                        );
                      })}

                      {/* Tombol Hapus */}
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = value.filter((_, i) => i !== idx);
                            onChange(name, updated);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Tampilkan total sum price */}
                <tfoot className="bg-sky-100 font-semibold text-sky-700">
                  <tr>
                    <td className="px-3 py-2 text-right" colSpan={1}>
                      Total
                    </td>
                    {fieldAddRow.map((field, i) => {
                      if (field.type === "price") {
                        const total = (value || []).reduce(
                          (acc: number, item: any) => {
                            const num = parseFloat(item[field.name]) || 0;
                            return acc + num;
                          },
                          0
                        );

                        return (
                          <td key={i} className="px-3 py-2 text-right">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              minimumFractionDigits: 0,
                            }).format(total)}
                          </td>
                        );
                      }
                      return <td key={i}></td>;
                    })}
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : type === "addRowCard" ? (
            <div className="space-y-3 flex flex-col gap-2">
              <AnimatePresence>
                {(value || []).map((item: any, idx: number) => {
                  const isOpen = expanded.includes(idx);

                  return (
                    <motion.div
                      key={idx}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="border border-sky-200 rounded shadow-xl overflow-hidden bg-white"
                    >
                      {/* Header Item */}
                      <div
                        draggable
                        onDragStart={() => setDraggedIndex(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(idx)}
                        className="flex justify-between items-center bg-sky-50 px-3 py-2 cursor-pointer"
                        onClick={() => toggleExpand(idx)}
                      >
                        <div className="flex gap-2 items-center">
                          {" "}
                          <FiMove />
                          <span className="font-medium text-sky-700">
                            {`Item ${idx + 1} ${
                              typeof item[fieldAddRow[0].name] == "string"
                                ? item[fieldAddRow[0].name]
                                  ? " - " + item[fieldAddRow[0].name]
                                  : ""
                                : " " +
                                  (item[fieldAddRow[0].name]?.label
                                    ? " - " + item[fieldAddRow[0].name].label
                                    : "")
                            }`}
                          </span>
                        </div>
                        <span className="text-sm text-sky-500">
                          {isOpen ? "▲ Collapse" : "▼ Expand"}
                        </span>
                      </div>

                      {/* Isi Form */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="p-3 grid grid-cols-12 gap-2 relative"
                          >
                            {fieldAddRow?.map((field, i) => {
                              const fieldValue = item;
                              const hidden = isFieldHidden(field, fieldValue);
                              if (hidden) return null;

                              return (
                                <div
                                  key={i + "-" + field.name}
                                  className={field.cols ?? "col-span-6"}
                                >
                                  <InputField
                                    type={field.type}
                                    name={field.name}
                                    label={field.label}
                                    value={item[field.name]}
                                    onChange={(subName, subVal) => {
                                      const updated = [...value];
                                      const updatedItem = { ...updated[idx] };

                                      // Replace value
                                      const currentField = fieldAddRow?.find(
                                        (f) => f.name === subName
                                      );
                                      let finalValue = subVal;
                                      if (
                                        currentField?.replaceValue &&
                                        typeof subVal === "string"
                                      ) {
                                        const { from, to } =
                                          currentField.replaceValue;
                                        finalValue = subVal
                                          .split(from)
                                          .join(to);
                                      }
                                      updatedItem[subName] = finalValue;

                                      // SameValue processing
                                      if (currentField?.sameValue?.length > 0) {
                                        for (const sameFieldName of currentField.sameValue) {
                                          const targetField = fieldAddRow?.find(
                                            (f) => f.name === sameFieldName
                                          );
                                          let copiedValue = finalValue;
                                          if (
                                            targetField?.replaceValue &&
                                            typeof copiedValue === "string"
                                          ) {
                                            const { from, to } =
                                              targetField.replaceValue;
                                            copiedValue = copiedValue
                                              .split(from)
                                              .join(to);
                                          }
                                          updatedItem[sameFieldName] =
                                            copiedValue;
                                        }
                                      }

                                      updated[idx] = updatedItem;
                                      let noCopy = field.allLang ? false : true;
                                      onChange(name, updated, noCopy);
                                    }}
                                    uriSelect={field.uriSelect}
                                    disabled={field.disabled ?? false}
                                    formValues={item}
                                    trigerValue={field.trigerValue}
                                  />
                                </div>
                              );
                            })}

                            {/* Tombol Hapus */}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = value.filter(
                                  (_, i) => i !== idx
                                );
                                onChange(name, updated);
                              }}
                              className="absolute top-2 right-2 text-red-500 text-sm"
                            >
                              ✕
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <input
              type={type}
              name={name}
              value={value}
              onChange={(e) => onChange(name, e.target.value)}
              className={`w-full border rounded p-1 px-2 ${
                disabled ? " !bg-gray-200" : " "
              }`}
              disabled={disabled}
            />
          )}
        </div>
      )}
    </React.Fragment>
  );
}
