import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CryptoJS from "crypto-js";
import { detailPermission } from "../lib/checkPermission";
const passwords = process.env.NEXT_PUBLIC_API_PASS_AES ?? ""; // Must be 256 bytes (32 characters)
export function GetEncrypt(data: any) {
  const text = typeof data === "string" ? data : JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(text, passwords).toString();
  return encrypted;
}
export function GetDecrypt(ciphertext: any) {
  // console.log(ciphertext);
  const bytes = CryptoJS.AES.decrypt(ciphertext, passwords);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
}
export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function apiUrl(path: string) {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_DOMAIN_API_FULL ?? "";
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export function GetCapitalFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const FetchData = async (
  uri: string,
  methods: string,
  bodys: any,
  isjson: boolean,
  token: string,
  notif?: boolean,
  Cache?: boolean
) => {
  const myHeaders = new Headers({
    Authorization: "Bearer " + token,
    "Content-Type": "text/plain",
  });

  const requestOptions: RequestInit = {
    method: methods,
    headers: myHeaders,
    redirect: "follow",
    cache: Cache ? "default" : "no-store",
    ...(methods === "POST" || methods === "PUT" ? { body: bodys } : {}),
  };

  try {
    const apiBase =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_DOMAIN_API_FULL ?? "";
    const finalUri = Cache
      ? uri
      : `${uri}${uri.includes("?") ? "&" : "?"}t=${Date.now()}`;
    // console.log("finaluri", finalUri);
    const response = await fetch(
      `${apiBase}${finalUri.startsWith("/") ? "" : "/"}${finalUri}`,
      requestOptions
    );
    const raw = isjson ? await response.text() : await response.text(); // sama saja, karena tetap didecrypt manual
    // console.log("inpage", raw);
    const datajson: any = JSON.parse(GetDecrypt(raw));
    // console.log("rspA=" + uri, datajson);
    if (datajson?.code != "200") {
      toast(datajson?.message, {
        autoClose: 3000,
        type: "error",
        position: "bottom-center",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      if (datajson?.code == "401") {
        localStorage.clear();
        // console.log("wdy", "logout");
        setTimeout(() => {
          // window.location.assign("/cms/login");
        }, 3000);
      } else if (datajson?.code == "403") {
      }
      return datajson;
    } else {
      if (datajson?.code == "200") {
        // console.log("success");
        if (notif) {
          // console.log("success22");
          toast(datajson?.message, {
            autoClose: 3000,
            type: "success",
            position: "bottom-center",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
        }
      } else {
        toast(datajson?.message, {
          autoClose: 3000,
          type: "error",
          position: "bottom-center",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
      return datajson;
    }
  } catch (error) {
    // console.log("Debug", process.env.NEXT_PUBLIC_DOMAIN_API_FULL + uri);
    console.error("FetchData Error", uri, error);
    return true;
  }
};
export const Logout = async (
  uri: string,
  mth: string,
  bodys: any,
  token: string,
  navigate: any,
  dispatch: any
) => {
  if (mth != "no") {
    const logout = await FetchData("/cms/logout", mth, bodys, false, token);
    if (logout?.code == "200") {
      localStorage.clear();
      RouteChange(navigate, "/dashboard", true);
    }
  }
  return true;
};
export const GetLocaData = (key: string) => {
  const datajson = JSON.parse(
    localStorage.getItem(key) ? GetDecrypt(localStorage.getItem(key)) : "{}"
  );
  return datajson;
};
export const RouteChange = (
  navigate: any,
  paths: string,
  reload: boolean,
  params?: {}
) => {
  if (reload) {
    navigate.reload();
  } else {
    navigate.push(paths, params);
  }
};
export const GetQueryParam = (i: number) => {
  let datajson = window.location.pathname.split("/").slice(1);
  return datajson[i];
};
export const CheckEmail = (inputEmail: string) => {
  return String(inputEmail)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
export const formatCurrency = (value: any) => {
  const numericValue = value.toString()?.replace(/[^0-9]/g, ""); // Menghapus karakter non-angka
  if (numericValue === "") return "";
  const formattedValue = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numericValue);
  return formattedValue.replace(/\s/g, ""); // Menghapus spasi tambahan
};
export function GetQueryStr(a: any) {
  return new URLSearchParams(window.location.search).get(a);
}
export function GetWordingByKey(data: any, key: string) {
  var findData = data?.findIndex((item: any) => item?.key == key);
  if (findData < 0 || data == null || data == undefined) {
    return "";
  } else {
    return data[findData].value;
  }
}
export const GetSorter = (sortBy: any, sort: any) => (a: any, b: any) => {
  try {
    return a[sortBy].toLowerCase() > b[sortBy].toLowerCase()
      ? sort
        ? 1
        : -1
      : sort
      ? -1
      : 1;
  } catch (error) {}
};
export function GetSearchArry(nameKey: any, myArray: any, field: any) {
  for (let i = 0; i < myArray.length; i++) {
    if (myArray[i][field] === nameKey) {
      return myArray[i];
    }
  }
}
export function StripHtmlTags(html: string): string {
  return html.replace(/<\/?[^>]+(>|$)/g, "");
}
export function DebugLog(msg: any) {
  console.log("wdyDebug:", msg);
}
export const getPermission = (arry: any[], module: string) => {
  // console.log("moso sih", arry);
  return detailPermission(arry, module);
};
export function NumberClear(cur: string) {
  cur = cur.replaceAll(".", "").replaceAll(",", ".");
  return cur;
}
export function formatAmountNoDecimals(number: any) {
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(number)) {
    number = number.replace(rgx, "$1" + "." + "$2");
  }
  return number;
}
export function formatAmount(number: any) {
  // remove all the characters except the numeric values
  const num = number.toString();
  var numberD = num.split(",");
  number = numberD[0];
  // return number;
  number = number.replace(/[A-Za-z]/g, "");
  number = number.replace(/[.]/g, "");
  number = number.replace(/[!$%^&*()_+|~=`{}[:;<>?.@#\]]/g, "");
  // console.log("wdypm", number.substring(1).replace(/[-]/g, ""));
  var numbersubstr = number.substring(1).replace(/[-]/g, "");
  var minus = "";
  if (number.substring(0, 1) == "-") {
    number = numbersubstr;
    minus = "-";
  }
  // console.log("wdy", number);

  // return number + (numberD.length > 1 ? "," + numberD[1] : "");
  // set the default value
  if (number.length == 0) number = "0";
  // else if (number.length == 1) number = "0.0" + number;
  // else if (number.length == 2) number = "0." + number;
  else
    number =
      number.substring(0, number.length - 0) +
      "." +
      number.substring(number.length - 0, number.length);
  number =
    // number.substring(0, number.length - 2) +
    // "." +
    // number.substring(number.length - 2, number.length);

    // set the precision
    number = new Number(number);
  number = number.toFixed(0); // only works with the "."
  // number = number.toFixed(2); // only works with the "."

  // change the splitter to ","
  number = number.replace(/\./g, ",");

  // format the amount
  var x = number.split(",");
  var x1 = x[0];
  var x2 = x.length > 1 ? "," + x[1] : "";
  // return formatAmountNoDecimals(x1);
  if (numberD.length > 1) {
    numberD = "," + numberD[1];
  } else {
    numberD = "";
  }
  numberD = numberD.replace(/[A-Za-z]/g, "");
  numberD = numberD.replace(/[.]/g, "");
  numberD = numberD.replace(/[-!$%^&*()_+|~=`{}[:;<>?.@#\]]/g, "");

  return (
    minus + "" + (number == 0 ? "0" : formatAmountNoDecimals(x1)) + numberD
  );
}
export const GFormatDate = function (date: string) {
  return new Date(date).toLocaleDateString("en-GB");
};
export function CheckURL(url: any) {
  return (url + "").match(/\.(jpeg|jpg|gif|png|svg)$/) != null;
}
export const getPagination = (
  limit: number,
  totalData: number,
  currenPage: number,
  totalPage: number
) => {
  return {
    limit_data: limit,
    total_data: totalData,
    start_paging: currenPage,
    end_paging: totalPage,
    prev_jump: currenPage > 1 ? 1 : 0,
    prev: currenPage > 1 ? currenPage - 1 : 0,
    next: currenPage < totalPage ? currenPage + 1 : 0,
    next_jump: currenPage < totalPage ? totalPage : 0,
  };
};
export const getBearerToken = (req: any): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null; // No token or incorrect format
  }

  return authHeader.split(" ")[1]; // Extract token after "Bearer"
};
export function isImageUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return /\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i.test(url.pathname);
  } catch {
    return false; // Bukan URL valid
  }
}
export function arrayContains<T>(arr: T[], value: T): boolean {
  return arr.includes(value);
}
export function removeArrayValue<T>(arr: T[], value: T): T[] {
  return arr.filter((item) => item !== value);
}
export function isNumeric(value: string): boolean {
  return !isNaN(Number(value.replaceAll(".", "").replace(",", ".")));
}
export function getAgeFromDate(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  // Koreksi jika belum ulang tahun di tahun ini
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
export function getJumlahHariSejak(tanggal: Date | string): number {
  const now = new Date();
  const startDate = new Date(tanggal);

  // Hilangkan jam (set jam ke 00:00:00)
  const nowDateOnly = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startDateOnly = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );

  const oneDayMs = 1000 * 60 * 60 * 24;
  const diffMs = nowDateOnly.getTime() - startDateOnly.getTime();

  const totalHari = Math.floor(diffMs / oneDayMs);
  return totalHari >= 0 ? totalHari + 1 : 0;
}
export const generatePassword = (length = 12): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
export function formatDateToInput(date?: Date | string | null) {
  if (!date) return ""; // kalau null/undefined, balikin string kosong biar ga error

  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) {
    return ""; // kalau bukan valid Date, balikin string kosong
  }

  return d.toISOString().split("T")[0]; // format jadi "YYYY-MM-DD"
}
export function formatDateTimeIndo(
  d?: Date | string | number,
  onlyDate: boolean = false
) {
  if (!d) return ""; // kalau kosong, return string kosong

  const date = d instanceof Date ? d : new Date(d);

  if (isNaN(date.getTime())) {
    // Invalid date
    return "";
  }

  const options: Intl.DateTimeFormatOptions = onlyDate
    ? {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }
    : {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // 24 jam
        timeZone: "Asia/Jakarta",
      };

  const formatted = new Intl.DateTimeFormat("id-ID", options).format(date);

  if (onlyDate) {
    return formatted; // hanya tanggal
  }

  // Hati-hati: di sebagian browser, pemisah jam bisa titik atau koma
  return formatted.replace(/\./g, ":") + " WIB";
}
export function parseDateTimeIndo(indoString: string): Date | null {
  try {
    // Hapus ' WIB' jika ada
    const cleaned = indoString.replace(" WIB", "").trim();

    // Pisah tanggal dan waktu
    const [datePart, timePart] = cleaned.split(" ");
    const [day, month, year] = datePart.split("/").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    // Buat objek Date dengan zona waktu Jakarta
    const date = new Date(Date.UTC(year, month - 1, day, hour - 7, minute));

    return date;
  } catch (error) {
    console.error("Gagal parse tanggal:", error);
    return null;
  }
}
export const cleanContent = (html: string) => {
  return html?.replace(/<script[^>]*flmngr[^>]*><\/script>/gi, "");
};
export function toPrismaDateTime(
  input: string | Date | null | undefined
): Date | null {
  if (!input) return null;

  const date = input instanceof Date ? input : new Date(input);

  // Pastikan date valid (bukan Invalid Date)
  return isNaN(date.getTime()) ? null : date;
}
export function findMediaUrlByType(mediaPages = [], type) {
  return mediaPages.find((mp) => mp.type === type)?.url ?? "-";
}
export function renderHtmlLinks({
  withNumber,
  urlNumber,
  formUrl,
  id,
  addNewPostLabel = "Add New Post",
  lengthLabel,
}) {
  const safeId = String(id); // pastikan jadi string
  // console.log("idssss", id + "-" + addNewPostLabel);
  return `
    <div class="flex gap-2">
      ${
        withNumber
          ? `<a href="${urlNumber}${safeId}">
              <div class="underline decoration-sky-500 font-bold flex justify-center items-center rounded-full w-6 h-6 bg-yellow-100 p-2">
                ${lengthLabel}
              </div>
            </a>`
          : ""
      }
      <div class="underline decoration-sky-500 font-bold">
        <a href="${formUrl}${safeId}">${addNewPostLabel}</a>
      </div>
    </div>
  `;
}
export function findImage(dataAll: any, langCode: string, code: string) {
  return dataAll?.find(
    (item: any) => item?.type === code && item?.langCode === langCode
  );
}
export function formatPrice(
  value: number,
  options?: { currency?: string; withCurrency?: boolean }
): string {
  const { currency = "IDR", withCurrency = true } = options || {};

  return new Intl.NumberFormat("id-ID", {
    style: withCurrency ? "currency" : "decimal",
    currency,
    minimumFractionDigits: 0,
  }).format(value);
}
