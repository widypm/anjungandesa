// OrderTableWithFeatures.tsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronRight as FiChevronCollapsed,
  FiCircle,
  FiSave,
  FiXCircle,
  FiEye,
  FiEdit,
  FiTrash2,
  FiArrowLeft,
  FiCopy,
} from "react-icons/fi";
import {
  apiUrl,
  FetchData,
  formatPrice,
  GetEncrypt,
} from "../../../lib/helper";
import { useDecryptedLoginState } from "../../../lib/authUtils";
import { FaCheckCircle } from "react-icons/fa";
import ButtonUi from "./ButtonUi";
import InputField from "./InputField";
import { HeaderTable, Option } from "../../../types";
import { useRouter, useSearchParams } from "next/navigation";
import { usePageTitle } from "../../../lib/PageTitelCmsContext";
import { wordingTr } from "app/lib/translationWording";
import FiIconGeneric from "./FiIcon";

// Define Order Type
type Order = {
  [key: string]: any;
  id: string;
  children?: Order[];
};
type Props = {
  moduleName: string;
  folder: string;
};

const TableWPM: React.FC<Props> = ({ moduleName, folder }) => {
  const [editTable, setEditTable] = useState<boolean>(false);
  const [loadBtn, setLoadBtn] = useState<boolean>(false);
  const [permission, setPermission] = useState<any>({});
  const [searchCol, setSearchCol] = useState<boolean>(true);
  const [isAction, setIsAction] = useState<boolean>(true);
  const [isDrag, setIsDrag] = useState<boolean>(false);
  const [btnAdd, setBtnAdd] = useState<boolean>(true);
  const [searchAdvance, setSearchAdvance] = useState([]);
  const [footerTable, setFooterTable] = useState([]);
  const [btnCopy, setBtnCopy] = useState<boolean>(false);
  const [columns, setColumns] = useState<HeaderTable[]>([]);
  const [data, setData] = useState<Order[]>([]);
  const [sortBy, setSortBy] = useState<keyof Order | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [filterState, setFilterState] = useState<Record<string, string>>({});
  const user = useDecryptedLoginState();
  const [totalRows, setTotalRows] = useState(0);
  const [addRow, setAddRow] = useState(false);
  const [newRow, setNewRow] = useState<Record<string, any>>({});
  const [editRowindex, setEditRowindex] = useState(-1);
  const [editRow, setEditRow] = useState<Record<string, any>>({});
  const [viewData, setViewData] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loadingView, setLoadingView] = useState(false);
  const router = useRouter();
  const [loadingTable, setLoadingTable] = useState(false);
  const searchParams = useSearchParams();
  const [draggedRowId, setDraggedRowId] = useState<number | null>(null);
  const { setTitle, title } = usePageTitle();
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const getTable = async (isDownload: any) => {
    setLoadingTable(true);
    const params = new URLSearchParams();
    //search
    for (const [key, value] of searchParams.entries()) {
      params.append(key, value);
    }

    for (const key in filterState) {
      const value = filterState[key];
      if (value) {
        params.append(key, value);
      }
    }
    // Sorting
    if (sortBy) {
      params.append("sortBy", sortBy + "");
      params.append("order", sortAsc ? "asc" : "desc"); // "asc" or "desc"
    }
    // Pagination
    params.append("page", currentPage.toString());
    params.append("limit", rowsPerPage.toString());
    //isdownload
    if (isDownload) params.append("isdownload", isDownload);
    const uriData = `api/${folder}/${moduleName}/list?${params.toString()}`;

    try {
      if (isDownload) {
        const res = await fetch(
          process.env.NEXT_PUBLIC_DOMAIN_API_FULL + "" + uriData,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user?.data?.token}`,
            },
          }
        );

        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download =
          isDownload === "pdf" ? title + "-data.pdf" : title + "-data.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
        return;
      }
      const dataapi = await FetchData(
        uriData,
        "GET",
        "",
        false,
        user?.data?.token
      );
      // console.log("itni prem", dataapi?.data?.initTable);
      setIsAction(
        dataapi?.data?.initTable?.isAction == undefined
          ? true
          : dataapi?.data?.initTable?.isAction
      );
      setPermission(dataapi?.data?.initTable?.permission);
      setIsDrag(dataapi?.data?.initTable?.isDrag);
      setFooterTable(dataapi?.data?.initTable?.footerTable ?? []);
      setEditTable(dataapi?.data?.initTable?.editTable);
      setBtnAdd(dataapi?.data?.initTable?.buttonAdd);
      setBtnCopy(dataapi?.data?.initTable?.buttonCopy);
      setSearchCol(dataapi?.data?.initTable?.searchTable);
      setTitle(dataapi?.data?.title);
      setColumns(dataapi?.data?.header);
      setData(dataapi?.data?.body);
      setTotalRows(dataapi?.data?.total ?? 0); // tambahkan ini di backend response
      setSearchAdvance(dataapi?.data?.initTable?.formSearch || []);
      const defaultFilters: Record<string, string> = {};
      dataapi?.header.forEach(
        (col: HeaderTable) => (defaultFilters[col.key] = "")
      );
      setFilterState(defaultFilters);
    } catch (error) {
    } finally {
      setLoadingTable(false);
    }
  };
  const toggleSort = (field: keyof Order) => {
    const asc = field === sortBy ? !sortAsc : true;
    setSortBy(field);
    setSortAsc(asc);
  };
  useEffect(() => {
    getTable(false);
  }, [filterState, sortAsc, sortBy, currentPage, rowsPerPage, searchParams]);

  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const currentData = data;

  // state formData → 1 bahasa
  const [formData, setFormData] = useState<Record<string, any>>({});

  // 🔹 Update state & URL query
  const handleChange = (name: string, val: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));

    const params = new URLSearchParams(searchParams.toString());

    if (val === "" || val == null) {
      params.delete(name); // hapus kalau kosong
    } else {
      params.set(name, val);
    }

    router.replace(`?${params.toString()}`);
  };

  // 🔹 Sync query string ke formData saat load/ganti URL

  async function handleView(id: string) {
    setLoadingView(true);
    setShowViewModal(true); // tampilkan modal dulu (optional)

    try {
      const rawQueryString = searchParams.toString(); // tanpa tanda tanya (?)
      const rawQs = rawQueryString.length > 0 ? "?" + rawQueryString : "";
      const uriView = `api/${folder}/${moduleName}/view/${id}${rawQs}`;
      const res = await FetchData(uriView, "GET", "", false, user?.data?.token);

      setViewData(res); // simpan data dari API
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setViewData(null);
    } finally {
      setLoadingView(false);
    }
  }
  function handleEdit(index) {
    setEditRowindex(index);
  }
  function handleDelete(rowId): void {
    const confirmed = window.confirm(
      "Are you sure you want to delete this data?"
    );
    if (!confirmed) return;

    // Lakukan DELETE request
    const deleteRow = async () => {
      try {
        const uriDelete = `api/${folder}/${moduleName}/delete`;
        const idDel = GetEncrypt(JSON.stringify({ id: rowId }));
        await FetchData(uriDelete, "PUT", idDel, false, user?.data?.token);
        getTable(false);
      } catch (err) {
        console.error("Delete failed", err);
      }
    };

    deleteRow();
  }
  function handleCopy(rowId): void {
    const confirmed = window.confirm(
      "Are you sure you want to Copy this data?"
    );
    if (!confirmed) return;

    // Lakukan copy request
    const CopyRow = async () => {
      try {
        const rawQueryString = searchParams.toString();
        const rawQs = rawQueryString.length > 0 ? "?" + rawQueryString : "";
        const uriDelete = `api/${folder}/${moduleName}/copy${rawQs}`;
        const idDel = GetEncrypt(JSON.stringify({ id: rowId }));
        await FetchData(uriDelete, "PUT", idDel, false, user?.data?.token);
        getTable(false);
      } catch (err) {
        console.error("Delete failed", err);
      }
    };

    CopyRow();
  }
  const renderRow = (row: Order, level = 0, index = -1) => {
    // Kalau row belum ada di expandedRows, default true
    const isExpanded = expandedRows[row.id] ?? true;
    const hasChildren = !!row.children?.length;

    // Pastikan kalau default true, langsung masuk ke state biar konsisten
    if (expandedRows[row.id] === undefined) {
      setExpandedRows((prev) => ({ ...prev, [row.id]: true }));
    }

    return (
      <React.Fragment key={row.id}>
        <tr
          key={"rw  " + row.id}
          className="border-t-2 border-gray-200"
          draggable={isDrag}
          onDragStart={() => setDraggedRowId(Number(row.id))}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(Number(row.id))}
        >
          {columns?.map((col, idx) => (
            <td
              key={col.key as string}
              className="py-2 px-2 text-sm"
              style={idx === 0 ? { paddingLeft: `${level * 20 + 16}px` } : {}}
            >
              {idx === 0 && hasChildren && (
                <button
                  onClick={() =>
                    setExpandedRows((prev) => ({
                      ...prev,
                      [row.id]: !prev[row.id],
                    }))
                  }
                  className="text-xs mr-1"
                >
                  {isExpanded ? <FiChevronDown /> : <FiChevronCollapsed />}
                </button>
              )}

              {editRowindex != index ? (
                col.type == "text" ? (
                  <>
                    {typeof row[col.key] == "object"
                      ? String(row[col.key]?.label ?? "")
                      : String(row[col.key] ?? "")}
                  </>
                ) : col.type == "boolean" ? (
                  row[col.key] ? (
                    <div className="text-blue-600">
                      <FaCheckCircle />
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <FiCircle />
                    </div>
                  )
                ) : col.type == "html" ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: String(row[col.key] ?? ""),
                    }}
                    onClick={handleLinkClick}
                  />
                ) : col.type == "number" ? (
                  formatPrice(row[col.key])
                ) : (
                  ""
                )
              ) : (
                <React.Fragment key={index + " " + col.key}>
                  <InputField
                    type={col.typeForm}
                    name={col.key}
                    label={""}
                    value={editRow[col.key] ?? ""}
                    onChange={handleChangeEdit}
                    formValues={editRow}
                    trigerValue={col.trigerValue}
                    uriSelect={col.uriSelect}
                  />
                </React.Fragment>
              )}
            </td>
          ))}
          {isAction && (
            <td className="py-2 px-2 flex items-start text-center text-lg cursor-pointer sticky right-0 bg-white z-10">
              {editRowindex == index ? (
                <div className="flex gap-2 ">
                  <ButtonUi
                    children={""}
                    onClick={async () => {
                      setEditRowindex(-1);
                      setEditRow({});
                    }}
                    variant={"secondary"}
                    icon={<FiXCircle />}
                  />
                  <ButtonUi
                    children={""}
                    onClick={() => postEditrow(row.id)}
                    icon={<FiSave />}
                  />
                </div>
              ) : (
                <div className="flex space-x-2">
                  {permission?.view && (
                    <FiEye
                      className="text-green-500 hover:text-green-700 cursor-pointer"
                      onClick={() => handleView(row.id)}
                    />
                  )}
                  {permission?.edit && (
                    <>
                      {!row?.noEdit && (
                        <>
                          <FiEdit
                            className="text-blue-500 hover:text-blue-700 cursor-pointer"
                            onClick={() => {
                              if (editTable) {
                                handleEdit(index);
                                setEditRow(row);
                              } else {
                                const rawQueryString = searchParams.toString();
                                const rawQs =
                                  rawQueryString.length > 0
                                    ? "&" + rawQueryString
                                    : "";
                                router.push(
                                  `/cms/module/${moduleName}/${folder}/form?id=${row.id}${rawQs}`
                                );
                              }
                            }}
                          />
                        </>
                      )}

                      {btnCopy && (
                        <FiCopy
                          className="text-yellow-500 hover:text-yellow-700 cursor-pointer"
                          onClick={() => {
                            handleCopy(row.id);
                          }}
                        />
                      )}
                      {row?.btnRow?.length && (
                        <React.Fragment>
                          {row?.btnRow?.map((rw, i) => (
                            <React.Fragment>
                              <FiIconGeneric
                                title={rw?.label}
                                onClick={() =>
                                  handleBtnCustome(row, rw?.uriAction)
                                }
                                className="text-yellow-500 hover:text-yellow-700 cursor-pointer"
                                icon={rw?.icon}
                              />
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      )}
                    </>
                  )}
                  {permission?.delete && (
                    <React.Fragment>
                      {!row?.noEdit && (
                        <FiTrash2
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                          onClick={() => {
                            handleDelete(row.id);
                          }}
                        />
                      )}
                    </React.Fragment>
                  )}
                </div>
              )}
            </td>
          )}
        </tr>

        {isExpanded &&
          row.children?.map((child, i) => renderRow(child, level + 1, i))}
      </React.Fragment>
    );
  };
  const footerTableRow = (row: Order, level = 0, index = -1) => {
    return (
      <React.Fragment key={row.id}>
        <tr key={"rw  " + row.id} className="border-t-2 border-gray-200">
          {columns?.map((col, idx) => (
            <td
              key={col.key as string}
              className="py-2 px-2 text-sm font-bold"
              style={idx === 0 ? { paddingLeft: `${level * 20 + 16}px` } : {}}
            >
              {editRowindex != index ? (
                col.type == "text" ? (
                  <>
                    {typeof row[col.key] == "object"
                      ? String(row[col.key]?.label ?? "")
                      : String(row[col.key] ?? "")}
                  </>
                ) : col.type == "boolean" ? (
                  row[col.key] ? (
                    <div className="text-blue-600">
                      <FaCheckCircle />
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <FiCircle />
                    </div>
                  )
                ) : col.type == "html" ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: String(row[col.key] ?? ""),
                    }}
                    onClick={handleLinkClick}
                  />
                ) : (
                  ""
                )
              ) : (
                <></>
              )}
            </td>
          ))}
        </tr>
      </React.Fragment>
    );
  };
  const formAddrow = () => {
    return (
      <React.Fragment key={"-1"}>
        <tr className="border-t-2 border-gray-200 bg-sky-100">
          {columns?.map((col, idx) => (
            <td
              key={col.key as string}
              className="p-2 text-sm"
              style={idx === 0 ? { paddingLeft: `${0 * 20 + 16}px` } : {}}
            >
              {/* isi input */}
              <InputField
                type={col.typeForm}
                name={col.key}
                label={""}
                value={newRow[col.key] ?? ""}
                onChange={handleChangeNew}
                formValues={newRow}
                trigerValue={col.trigerValue}
                uriSelect={col.uriSelect}
              />
            </td>
          ))}
          <td className="py-2 px-2 flex items-start  text-lg cursor-pointer sticky right-0 z-10">
            <div className="flex gap-2 ">
              <ButtonUi
                children={""}
                onClick={async () => {
                  setAddRow(false);
                  setNewRow({});
                }}
                variant={"secondary"}
                icon={<FiXCircle />}
              />
              <ButtonUi children={""} onClick={postAddrow} icon={<FiSave />} />
            </div>
          </td>
        </tr>
      </React.Fragment>
    );
  };
  const handleChangeNew = (name: string, value: any) => {
    setNewRow((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleChangeEdit = (name: string, value: any) => {
    setEditRow((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const addData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // simulasi API
    setAddRow(true);
    setNewRow({});
  };
  const postAddrow = async () => {
    try {
      const uriPost: string = `api/${folder}/${moduleName}/form/0`;
      const aesraw = GetEncrypt(JSON.stringify({ row: newRow }));
      const dataapi = await FetchData(
        uriPost,
        "POST",
        aesraw,
        true,
        user?.data?.token,
        true
      );
      getTable(false);
      setAddRow(false);
      setNewRow({});
    } catch (error) {
      //console.log("err", newRow);
    }
  };
  const postEditrow = async (id) => {
    try {
      const rawQueryString = searchParams.toString(); // tanpa tanda tanya (?)
      const rawQs = rawQueryString.length > 0 ? "?" + rawQueryString : "";
      const uriPost: string =
        "api/" + folder + "/" + moduleName + "/form/" + id + rawQs;
      const aesraw = GetEncrypt(JSON.stringify({ row: editRow }));
      const dataapi = await FetchData(
        uriPost,
        "PUT",
        aesraw,
        true,
        user?.data?.token,
        true
      );
      getTable(false);
      setEditRowindex(-1);
      setEditRow({});
    } catch (error) {
      //console.log("err", newRow);
    }
  };
  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Cari elemen <a>
    if (target.tagName === "A") {
      const anchor = target as HTMLAnchorElement;
      const href = anchor.getAttribute("href");

      // Jika internal link (bukan http:// atau https://)
      if (href && !href.startsWith("http")) {
        e.preventDefault();
        router.push(href);
      }
    }
  };
  // Untuk flatten data dari nested tree
  const handleDrop = async (targetRowId: number) => {
    if (draggedRowId === null || draggedRowId === targetRowId) return;

    try {
      const uriPost: string = "api/" + folder + "/" + moduleName + "/reorder";
      const aesraw = GetEncrypt(
        JSON.stringify({
          draggedId: draggedRowId,
          targetId: targetRowId,
        })
      );
      const dataapi = await FetchData(
        uriPost,
        "POST",
        aesraw,
        true,
        user?.data?.token,
        true
      );
      if (dataapi.code === 200) {
        getTable(false);
      }
      console.log("Minimal payload sent to API");
    } catch (error) {
      console.error("Failed to update order", error);
    }

    setDraggedRowId(null);
  };
  const handleBtnCustome = async (param: any, uri: string) => {
    try {
      const uriPost: string = uri;
      const aesraw = GetEncrypt(JSON.stringify(param));
      const dataapi = await FetchData(
        uriPost,
        "POST",
        aesraw,
        true,
        user?.data?.token,
        true
      );
      if (dataapi.code === 200) {
        getTable(false);
      }
      console.log("Minimal payload sent to API");
    } catch (error) {
      console.error("Failed to update order", error);
    }
  };
  function CollapsibleField({ label, value }: { label: string; value: any }) {
    const [isOpen, setIsOpen] = useState(true);

    const isPrimitive =
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null ||
      value === undefined;

    if (isPrimitive) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 shadow-sm">
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
            {label.replace(/([A-Z])/g, " $1")}
          </div>

          <div className="text-sm text-gray-700 break-words">
            {(() => {
              if (value === null || value === undefined || value === "")
                return "-";

              const strVal = String(value).toLowerCase();

              // cek extension gambar
              const isImage =
                strVal.endsWith(".jpg") ||
                strVal.endsWith(".jpeg") ||
                strVal.endsWith(".png") ||
                strVal.endsWith(".gif") ||
                strVal.endsWith(".webp");

              if (isImage) {
                return (
                  <img
                    src={apiUrl(
                      "api/files/" + encodeURIComponent(String(value))
                    )}
                    alt={label}
                    className="w-24 h-24 object-cover rounded border"
                    onClick={() =>
                      setZoomSrc(
                        apiUrl("api/files/" + encodeURIComponent(String(value)))
                      )
                    }
                  />
                );
              }

              return String(value);
            })()}
            {zoomSrc && (
              <div
                className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                onClick={() => setZoomSrc(null)}
              >
                <img
                  src={zoomSrc}
                  className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 shadow-sm">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {label.replace(/([A-Z])/g, " $1")}
          </div>
          <span className="text-gray-400 text-xs">{isOpen ? "▲" : "▼"}</span>
        </div>

        {isOpen && (
          <div className="pl-4 mt-2 space-y-2">
            {Object.entries(value).map(([childKey, childValue]) => (
              <CollapsibleField
                key={childKey}
                label={childKey}
                value={childValue}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
  async function postDetailAppTolak(id, action) {
    try {
      const uriPost: string = `api/${folder}/${moduleName}/verifikasi`;
      const aesraw = GetEncrypt(JSON.stringify({ id: id, action: action }));
      const dataapi = await FetchData(
        uriPost,
        "POST",
        aesraw,
        true,
        user?.data?.token,
        true
      );
      getTable(false);
      setAddRow(false);
      setNewRow({});
      setShowViewModal(false);
    } catch (error) {
      //console.log("err", newRow);
    }
  }

  return (
    <React.Fragment>
      {loadingTable && (
        <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10 rounded-xl">
          <div className="animate-spin h-8 w-8 rounded-full border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div className="rounded-2xl shadow-xl">
        {searchAdvance.length ? (
          <div className="grid md:grid-cols-12 gap-2 mb-2">
            {searchAdvance.map((field, index) => {
              return (
                <React.Fragment key={index + "frm-" + field.name}>
                  {field.type != "hide" && (
                    <div
                      className={(field?.cols ?? "col-span-6") + " "}
                      key={index + "-" + field.name}
                    >
                      <InputField
                        name={field.name}
                        label={field.label}
                        type={field.type}
                        value={formData[field.name] ?? field?.value}
                        onChange={(name: string, val: any, notCopy: boolean) =>
                          handleChange(name, val)
                        }
                        fieldAddRow={field.fieldAddRow}
                        uriSelect={field.uriSelect}
                        disabled={field.disabled ?? false}
                        formValues={formData}
                        trigerValue={field.trigerValue}
                        info={field?.info}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <></>
        )}
        {btnAdd && (
          <div className="w-full flex justify-end mb-2 gap-2">
            <ButtonUi
              variant="secondary"
              onClick={async () => {
                router.back();
              }}
              icon={<FiArrowLeft />}
            >
              {wordingTr(user?.data?.langCode, "back")}
            </ButtonUi>
            {permission?.add && (
              <ButtonUi
                icon={<FiSave />}
                onClick={async () => {
                  if (editTable) {
                    console.log("newrow");
                    addData();
                  } else {
                    setLoadBtn(true);
                    const rawQueryString = searchParams.toString(); // tanpa tanda tanya (?)
                    const rawQs =
                      rawQueryString.length > 0 ? "?" + rawQueryString : "";
                    router.push(
                      `/cms/module/${moduleName}/${folder}/form${rawQs}`
                    );

                    await new Promise((resolve) => setTimeout(resolve, 200)); // simulasi API
                  }
                }}
                variant="primary"
                children={wordingTr(user?.data?.langCode, "add")}
                load={loadBtn}
              />
            )}
          </div>
        )}

        <div className="overflow-x-auto scrollbar-hide rounded-2xl">
          <table className="min-w-full text-left text-gray-900">
            <thead>
              <tr className="bg-card-gradient text-white ">
                {columns?.map((col, i) => (
                  <th
                    key={col.key as string}
                    className={`py-2 px-2 font-semibold text-sm cursor-pointer select-none ${
                      i === 0 ? "rounded-tl-2xl" : ""
                    }`}
                    onClick={() => col.sort && toggleSort(col.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{col.label}</span>
                      {col.sort && (
                        <FiChevronDown
                          className={`text-xs transition-transform ${
                            sortBy === col.key
                              ? sortAsc
                                ? "rotate-180"
                                : ""
                              : "opacity-30"
                          }`}
                        />
                      )}
                    </div>
                  </th>
                ))}
                {isAction && (
                  <th className="py-2 px-2 font-semibold text-sm text-center rounded-tr-2xl sticky right-0 bg-card-gradient z-20">
                    {wordingTr(user?.data?.langCode, "action")}
                  </th>
                )}
              </tr>
              {searchCol && (
                <tr className="bg-white text-gray-700">
                  {columns?.map((col) => (
                    <th key={col.key as string} className="py-2 px-2">
                      {!col.noSearch && (
                        <input
                          type="text"
                          placeholder="Search"
                          className="text-xs w-full px-2 py-1 border rounded"
                          value={filterState[col.key] ?? ""}
                          onChange={(e) =>
                            setFilterState((prev) => ({
                              ...prev,
                              [col.key]: e.target.value,
                            }))
                          }
                        />
                      )}
                    </th>
                  ))}
                  <th className="py-2 px-2 text-center text-lg cursor-pointer sticky right-0 bg-white z-10"></th>
                </tr>
              )}
            </thead>
            <tbody className="bg-white bg-opacity-90 rounded-b-2xl">
              {addRow && formAddrow()}
              {currentData?.length ? (
                <React.Fragment>
                  {currentData?.map((row, i) => renderRow(row, 0, i))}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <tr>
                    <td
                      colSpan={columns?.length + 1}
                      className="text-center p-2"
                    >
                      {wordingTr(user?.data?.langCode, "data_not_avilable")}
                    </td>
                  </tr>
                </React.Fragment>
              )}
              {footerTable.length ? (
                <React.Fragment>
                  {footerTable.map((rw, i) => (
                    <>{footerTableRow(rw, 0, 0)}</>
                  ))}
                </React.Fragment>
              ) : (
                <></>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center p-2 text-sm bg-gray-100">
          <div>
            {wordingTr(user?.data?.langCode, "page")} {currentPage}{" "}
            {wordingTr(user?.data?.langCode, "of")}{" "}
            {totalPages ? totalPages : 1}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                getTable("pdf");
              }}
              className="flex items-center gap-2 text-white  rounded hover:bg-red-200"
            >
              <img src={"/images/file.png"} className="w-6 h-6" />
            </button>
            <button
              onClick={() => {
                getTable("xls");
              }}
              className="flex items-center gap-2  text-white rounded hover:bg-green-600"
            >
              <img src={"/images/xls.png"} className="w-6 h-6" />
            </button>
            {totalPages ? (
              <React.Fragment>
                <select
                  id="rowsPerPage"
                  className="px-2 py-1 border rounded text-sm"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setCurrentPage(1); // reset ke halaman pertama
                    setRowsPerPage(parseInt(e.target.value, 10));
                  }}
                >
                  {[5, 10, 20, 50, 80].map((limit) => (
                    <option key={limit} value={limit}>
                      {limit}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-black bg-gray-400 hover:bg-gray-300 disabled:opacity-30"
                >
                  <FiChevronLeft />
                </button>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-gray-400 !text-black-500 hover:bg-gray-300 disabled:opacity-30"
                >
                  <FiChevronRight />
                </button>
              </React.Fragment>
            ) : (
              <React.Fragment></React.Fragment>
            )}
          </div>
        </div>
      </div>
      {showViewModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl p-6 relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              📝 {wordingTr(user?.data?.langCode, "detailed_data")}
            </h2>

            {loadingView ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : viewData ? (
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(viewData?.data || {}).map(([key, value]) => (
                    <CollapsibleField key={key} label={key} value={value} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-red-500 text-sm">
                {wordingTr(user?.data?.langCode, "failed_to_load")}
              </p>
            )}
            {viewData?.message == "approve" && (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => {
                    postDetailAppTolak(viewData?.data.id, 2);
                  }}
                  className="flex items-center justify-center gap-2 px-2 py-2 rounded-md font-bold text-sm transition-all duration-300 bg-btn-gradientsecondary hover:bg-gray-100 shadow hover:opacity-90"
                >
                  Tolak
                </button>
                <button
                  onClick={() => {
                    postDetailAppTolak(viewData?.data.id, 1);
                  }}
                  className="flex items-center justify-center gap-2 px-2 py-2 rounded-md font-bold text-sm transition-all duration-300 bg-btn-gradientprimary text-white font-bold shadow hover:opacity-90"
                >
                  Setuju
                </button>
              </div>
            )}
            {viewData?.message == "selesai" && (
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => {
                    postDetailAppTolak(viewData?.data.id, 1);
                  }}
                  className="flex items-center justify-center gap-2 px-2 py-2 rounded-md font-bold text-sm transition-all duration-300 bg-btn-gradientprimary text-white font-bold shadow hover:opacity-90"
                >
                  Selesai
                </button>
              </div>
            )}

            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition duration-150"
              title="Tutup"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default TableWPM;
