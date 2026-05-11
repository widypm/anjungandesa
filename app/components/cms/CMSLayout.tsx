"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import {
  FiChevronRight,
  FiChevronDown,
  FiMenu,
  FiHome,
  FiSettings,
  FiFileText,
  FiBell,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { usePageTitle } from "../../lib/PageTitelCmsContext";
import { FetchData, GetDecrypt, GetEncrypt } from "../../lib/helper";
import { useDecryptedLoginState } from "../../lib/authUtils";
import { useDispatch, useSelector } from "react-redux";
import { setLocal } from "app/lib/redux/counterSlice";
import ReactCountryFlag from "react-country-flag";
type MenuItem = {
  id: string;
  title: string;
  slug?: string;
  icon?: string;
  children?: MenuItem[];
  isFe?: boolean;
};

type SidebarItemProps = {
  item: MenuItem;
  level?: number;
  isCollapsed: boolean;
  pathname: string;
  openMenus: string[];
  toggleMenu: (id: string) => void;
  loadingMenuId: string | null;
  setLoadingMenuId: (id: string | null) => void;
};

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/cms/login") return <>{children}</>;
  const { title } = usePageTitle();

  const user = useDecryptedLoginState();
  const searchParams = useSearchParams();

  // gabungkan pathname + querystring

  const [isFestate, setIsFestate] = useState<boolean | null>(false);
  const [curClick, setCurClick] = useState<string | null>("");
  const [qsUpdate, setqsUpdate] = useState<string | null>("");

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loadingMenuId, setLoadingMenuId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [menus, setMenus] = useState<any>([]);
  const [openLang, setOpenLang] = useState<any>(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const [localData, setLocalData] = useState<any>(null); // ⬅️ taruh hasil decrypt di state
  const [lang, setLang] = useState<"ID" | "EN">(user?.data?.langCode);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 500); // Delay 500ms
  };
  const getMenu = async () => {
    try {
      const dataapi = await FetchData(
        `api/general/sidebarpanel`,
        "GET",
        "",
        false,
        user?.data?.token,
        false
      );
      setMenus(dataapi?.data?.body);
    } catch (error) {}
  };
  function normalizeBasePath(path: string, isFe: boolean): string {
    const [base, query] = path.replace(/^\//, "").split("?");
    const normalized =
      "/" +
      base
        .replace(/^\//, "")
        .split(/[?#]/)[0]
        .replace(/\/(list|form)(\/)?$/, "") // hapus /list atau /form di akhir
        .replace(/\/$/, "") // hapus trailing slash
        .toLowerCase();
    // console.log("wewuri", normalized + query?.toLowerCase());
    return isFe ? `${normalized}?${query?.toLowerCase()}` : normalized;
  }
  const handleLogout = async () => {
    try {
      // 1. Hapus token di localStorage/sessionStorage

      // 2. Panggil API logout (jika kamu punya endpoint logout)

      const dataLogout = await FetchData(
        "api/auth/logout",
        "PUT",
        GetEncrypt(JSON.stringify({ id: "1" })),
        false,
        user?.data?.token,
        true
      );

      // 3. Redirect ke halaman login atau root
      if (dataLogout?.code == "200") {
        localStorage.clear();
        setTimeout(() => {
          window.location.assign("/cms/login");
        }, 1000);
      }
    } catch (error) {
      console.error("Logout gagal:", error);
    }
  };
  useEffect(() => {
    getMenu();
  }, []);
  const openMenu = (id: string) => {
    setOpenMenus((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };
  function findParentIds(
    items,
    pathname: string,
    qsUpdate: string,
    parents: string[] = []
  ): string[] {
    for (const item of items) {
      if (
        normalizeBasePath(pathname + qsUpdate, item.isFe) ===
        normalizeBasePath(item.slug || "", item.isFe)
      ) {
        return [...parents, item.id]; // kembalikan parent chain + item ini
      }

      if (item.children?.length) {
        const found = findParentIds(item.children, pathname, qsUpdate, [
          ...parents,
          item.id,
        ]);
        if (found.length) return found;
      }
    }
    return [];
  }

  useEffect(() => {
    if (!menus) return;
    setOpenMenus([]);
    const activeIds = findParentIds(menus, pathname, qsUpdate); // fungsi cari parent chain

    activeIds.forEach((id) => {
      openMenu(id); // buka paksa
    });
  }, [menus, pathname, qsUpdate]);

  useEffect(() => {
    // Reset loader ketika route berubah
    setLoadingMenuId(null);
  }, [pathname]);
  useEffect(() => {
    const queryString = searchParams.toString();
    setqsUpdate("?" + queryString);
    if (
      normalizeBasePath(pathname + "?" + queryString, isFestate) === curClick
    ) {
      setLoadingMenuId(null);
    }
  }, [searchParams]);
  const changeLangUser = async (langs) => {
    const raw = JSON.stringify({
      lang: langs,
    });
    const aesraw = GetEncrypt(raw);
    const data = FetchData(
      "api/general/languser",
      "POST",
      aesraw,
      false,
      user?.data?.token,
      true
    );
    const datajson = await data;
    if (datajson?.code == "200") {
      dispatch(setLocal(GetEncrypt(JSON.stringify(datajson))));
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
    }
  };
  function SidebarItem({
    item,
    level = 0,
    isCollapsed,
    pathname,
    openMenus,
    toggleMenu,
    loadingMenuId,
    setLoadingMenuId,
  }: SidebarItemProps) {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus.includes(item.id);

    return (
      <div style={{ paddingLeft: `${level * 12}px` }} className="mb-1">
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleMenu(item.id)}
              className="flex items-center justify-between w-full px-2 py-2 rounded hover:bg-black/80"
            >
              <div className="flex items-center gap-2">
                {item.icon && <img className="w-4" src={item.icon} />}
                {!isCollapsed && item.title}
              </div>
              {!isCollapsed &&
                (isOpen ? <FiChevronDown /> : <FiChevronRight />)}
            </button>

            {isOpen && (
              <div className="flex flex-col mt-1">
                {item.children?.map((child) => (
                  <SidebarItem
                    key={child.id}
                    item={child}
                    level={level + 1}
                    isCollapsed={isCollapsed}
                    pathname={pathname}
                    openMenus={openMenus}
                    toggleMenu={toggleMenu}
                    loadingMenuId={loadingMenuId}
                    setLoadingMenuId={setLoadingMenuId}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <Link
            href={item.slug || "#"}
            onClick={() => {
              setLoadingMenuId(item.id);
              setCurClick(normalizeBasePath(item.slug || "", item.isFe));
              setIsFestate(item?.isFe);
              if (
                normalizeBasePath(pathname + qsUpdate, item.isFe) ===
                normalizeBasePath(item.slug || "", item.isFe)
              ) {
                setLoadingMenuId(null);
              }
            }}
            className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-black/80 ${
              normalizeBasePath(pathname + qsUpdate, item.isFe) ===
              normalizeBasePath(item.slug || "", item.isFe)
                ? "bg-black/70 font-bold"
                : ""
            }`}
          >
            {item.icon && <img className="w-4" src={item.icon} />}
            {!isCollapsed && (
              <>
                {item.title}
                {loadingMenuId === item.id && (
                  <span className="ml-2 animate-spin border-2 border-t-transparent border-white rounded-full w-3 h-3 inline-block"></span>
                )}
              </>
            )}
          </Link>
        )}
      </div>
    );
  }

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  return (
    <div className="min-h-screen flex font-sans ">
      {/* SIDEBAR */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`transition-all duration-300 bg-card-gradient text-white ${
          isCollapsed ? "w-20" : "w-56"
        } p-2 shadow-lg flex flex-col z-50`}
      >
        {/* Logo & Avatar */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="flex justify-center items-center w-full">
            <img src={"/images/logocms.png"} className="w-12" />
          </div>

          <div className="flex flex-col items-center w-full border-t border-white/20 pt-4">
            <img
              src="/images/profile.png"
              alt="Avatar"
              className="w-10 h-10 rounded-full"
            />
            {!isCollapsed && (
              <>
                <p className="text-sm mt-1">Admin</p>
                <Link
                  href="/cms/profile"
                  className="text-xs underline hover:text-white/80"
                >
                  Edit Profile
                </Link>
              </>
            )}
          </div>
        </div>
        {/* MENU */}
        <nav className="flex flex-col text-sm flex-1">
          {menus?.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              pathname={pathname}
              openMenus={openMenus}
              toggleMenu={toggleMenu}
              loadingMenuId={loadingMenuId}
              setLoadingMenuId={setLoadingMenuId}
            />
          ))}

          {/* Logout */}
          <div className="mt-4 w-full">
            <button
              onClick={handleLogout}
              className="flex items-center font-bold gap-2 px-2 py-2 rounded hover:bg-black/80 text-sm w-full"
            >
              <FiLogOut />
              {!isCollapsed && "Keluar"}
            </button>
          </div>
        </nav>
      </aside>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsCollapsed(!isCollapsed);
              }}
              className="text-gray-700 hover:text-black"
            >
              <FiMenu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <FiBell className="text-gray-600" />
            <div className="relative">
              <button
                onClick={() => setOpenLang(!openLang)}
                className="px-2 py-1 text-sm font-medium border rounded-lg hover:bg-gray-100 flex items-center gap-1"
              >
                <div className="flex gap-1 items-center">
                  <ReactCountryFlag
                    countryCode={lang == "EN" ? "US" : lang.toUpperCase()}
                    svg
                    style={{ width: "1.2em", height: "1.2em" }}
                  />
                  <span>{lang === "ID" ? "ID" : "EN"}</span>
                </div>

                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openLang && (
                <div className="absolute right-0 mt-2 w-28 bg-white border rounded-lg shadow-lg z-10">
                  {lang == "EN" ? (
                    <button
                      onClick={() => {
                        setLang("ID");
                        setOpenLang(false);
                        changeLangUser("ID");
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      <ReactCountryFlag
                        countryCode={"ID"}
                        svg
                        style={{ width: "1em", height: "1em" }}
                      />{" "}
                      Indonesia
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setLang("EN");
                        setOpenLang(false);
                        changeLangUser("EN");
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      <ReactCountryFlag
                        countryCode={"US"}
                        svg
                        style={{ width: "1em", height: "1em" }}
                      />{" "}
                      English
                    </button>
                  )}
                </div>
              )}
            </div>

            <img
              src="/images/profile.png"
              alt="User"
              className="w-8 h-8 rounded-full border"
            />
          </div>
        </header>

        {/* CHILDREN */}
        <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          {loadingMenuId == null ? (
            <React.Fragment>{children}</React.Fragment>
          ) : (
            <React.Fragment>
              <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10 rounded-xl">
                <div className="animate-spin h-8 w-8 rounded-full border-t-2 border-b-2 border-blue-500"></div>
              </div>
            </React.Fragment>
          )}
        </main>
      </div>
    </div>
  );
}
