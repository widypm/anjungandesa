-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT,
    "roleId" INTEGER NOT NULL,
    "token" TEXT,
    "tokenAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isLogin" BOOLEAN NOT NULL DEFAULT false,
    "loginDate" DATETIME,
    "logOutDate" DATETIME,
    "deletedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    "langCode" TEXT,
    CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_langCode_fkey" FOREIGN KEY ("langCode") REFERENCES "Lang" ("code") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "companyId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "updateAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "Role_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RolePermision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT,
    "roleId" INTEGER NOT NULL,
    "menuId" INTEGER NOT NULL,
    "view" BOOLEAN NOT NULL DEFAULT false,
    "create" BOOLEAN NOT NULL DEFAULT true,
    "update" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "updateAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "RolePermision_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RolePermision_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RolePermision_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "auditlog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT,
    "userId" INTEGER NOT NULL,
    "user" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "urlApi" TEXT NOT NULL,
    "urlFe" TEXT NOT NULL,
    "methodApi" TEXT NOT NULL,
    "bodyApi" TEXT NOT NULL,
    "menuId" INTEGER NOT NULL,
    "menuLabel" TEXT NOT NULL,
    "pageId" INTEGER NOT NULL,
    "PageLabel" TEXT NOT NULL,
    "createBy" TEXT NOT NULL,
    "updateBy" TEXT NOT NULL,
    "updateAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "auditlog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lang" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "companyId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "Lang_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Media" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT,
    "menuId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "langCode" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "title" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "Media_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Media_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT,
    "parentId" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "publishAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "unPublishAt" DATETIME,
    "typeMenuId" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "Menu_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Menu_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Menu" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Menu_typeMenuId_fkey" FOREIGN KEY ("typeMenuId") REFERENCES "MenuType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MenuType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "updateAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "MenuType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MenuTranslation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT,
    "menuId" INTEGER NOT NULL,
    "langCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subTitle" TEXT,
    "linkType" TEXT DEFAULT 'URL',
    "slug" TEXT,
    "pageId" INTEGER,
    "categoryId" INTEGER,
    "description" TEXT,
    "overview" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "MenuTranslation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MenuTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MenuTranslation_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MenuTranslation_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MenuTranslation_langCode_fkey" FOREIGN KEY ("langCode") REFERENCES "Lang" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MediaPage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT,
    "pageId" INTEGER,
    "categoryId" INTEGER,
    "type" TEXT NOT NULL,
    "langCode" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "title" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "MediaPage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MediaPage_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MediaPage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Page" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT,
    "pageType" TEXT NOT NULL DEFAULT 'PAGE',
    "order" INTEGER NOT NULL DEFAULT 0,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "publishAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "unPublishAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "Page_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PageCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT,
    "pageId" INTEGER NOT NULL,
    "categoryId" INTEGER,
    "langCode" TEXT,
    CONSTRAINT "PageCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PageCategory_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PageCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PageCategory_langCode_fkey" FOREIGN KEY ("langCode") REFERENCES "Lang" ("code") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PageTranslation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT,
    "pageId" INTEGER,
    "categoryId" INTEGER,
    "view" INTEGER NOT NULL DEFAULT 0,
    "langCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subTitle" TEXT,
    "slug" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "ogType" TEXT,
    "canonicalUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "PageTranslation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PageTranslation_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PageTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PageTranslation_langCode_fkey" FOREIGN KEY ("langCode") REFERENCES "Lang" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WordingPage" (
    "companyId" TEXT,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wordingGeneralId" INTEGER,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "langCode" TEXT NOT NULL,
    "pageId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "WordingPage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WordingPage_wordingGeneralId_fkey" FOREIGN KEY ("wordingGeneralId") REFERENCES "WordingGeneral" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WordingPage_langCode_fkey" FOREIGN KEY ("langCode") REFERENCES "Lang" ("code") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WordingPage_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WordingGeneral" (
    "companyId" TEXT,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "WordingGeneral_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SettingApp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "SettingApp_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "Category_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Template" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "Template_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Section" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" TEXT,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "pageId" INTEGER NOT NULL,
    "pageIdData" INTEGER,
    "categoryId" INTEGER,
    "templateId" INTEGER NOT NULL,
    "langCode" TEXT NOT NULL,
    "title" TEXT,
    "subTitle" TEXT,
    "image" TEXT,
    "secondImage" TEXT,
    "slug" TEXT,
    "description" TEXT,
    "overview" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "Section_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Section_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Section_pageIdData_fkey" FOREIGN KEY ("pageIdData") REFERENCES "Page" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Section_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Section_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Section_langCode_fkey" FOREIGN KEY ("langCode") REFERENCES "Lang" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cashFlowCategory" TEXT,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "Account_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Account_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "businessPartnerId" TEXT,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "source" TEXT NOT NULL,
    "statusJournal" TEXT DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    "typeTransactionId" TEXT,
    CONSTRAINT "JournalEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JournalEntry_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "BusinessPartner" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JournalEntry_typeTransactionId_fkey" FOREIGN KEY ("typeTransactionId") REFERENCES "TypeTransaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JournalLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journalId" TEXT NOT NULL,
    "description" TEXT,
    "accountId" TEXT NOT NULL,
    "debit" DECIMAL NOT NULL DEFAULT 0.0,
    "credit" DECIMAL NOT NULL DEFAULT 0.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "JournalLine_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "JournalEntry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JournalLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "Vendor_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "date" DATETIME NOT NULL,
    "amount" DECIMAL NOT NULL,
    "accountId" TEXT NOT NULL,
    "reference" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "Payment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT,
    "vendorId" TEXT,
    "number" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total" DECIMAL NOT NULL DEFAULT 0.0,
    "journalId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "JournalEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccountBalance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "period" DATETIME NOT NULL,
    "debit" DECIMAL NOT NULL DEFAULT 0.0,
    "credit" DECIMAL NOT NULL DEFAULT 0.0,
    "balance" DECIMAL NOT NULL DEFAULT 0.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "AccountBalance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AccountBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TypeTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "debitAccountId" TEXT NOT NULL,
    "creditAccountId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    "createBy" TEXT,
    "updateBy" TEXT,
    CONSTRAINT "TypeTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TypeTransaction_debitAccountId_fkey" FOREIGN KEY ("debitAccountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TypeTransaction_creditAccountId_fkey" FOREIGN KEY ("creditAccountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessPartner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "taxId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BusinessPartner_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgramPaket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "target" TEXT,
    "satuan" TEXT,
    "lokasi" TEXT,
    "jenisPaket" TEXT,
    "metode" TEXT,
    "sumberDana" TEXT,
    "parentId" INTEGER,
    "pagu" DECIMAL NOT NULL DEFAULT 0,
    "realisasi" DECIMAL NOT NULL DEFAULT 0,
    "blokir" DECIMAL NOT NULL DEFAULT 0,
    "keu" DECIMAL NOT NULL DEFAULT 0,
    "fisik" DECIMAL NOT NULL DEFAULT 0,
    "thang" INTEGER NOT NULL DEFAULT 2025,
    "unitKerjaId" INTEGER,
    CONSTRAINT "ProgramPaket_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProgramPaket" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProgramPaket_unitKerjaId_fkey" FOREIGN KEY ("unitKerjaId") REFERENCES "UnitKerja" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Paket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "thang" INTEGER NOT NULL DEFAULT 2025,
    "programPaketKode" TEXT NOT NULL,
    "kdunit" TEXT,
    "kdsatker" TEXT,
    "kdprogram" TEXT,
    "kdgiat" TEXT,
    "kdoutput" TEXT,
    "kdsoutput" TEXT,
    "kdkmpnen" TEXT,
    "kdskmpnen" TEXT,
    "nmpaket" TEXT,
    "kdlokasi" TEXT,
    "kdkabkota" TEXT,
    "metode" TEXT,
    "kdpengadaan" TEXT,
    "vol" INTEGER,
    "sat" TEXT,
    "tgl_mulai" DATETIME,
    "tgl_selesai" DATETIME,
    "pagu_51" DECIMAL NOT NULL DEFAULT 0,
    "pagu_52" DECIMAL NOT NULL DEFAULT 0,
    "pagu_53" DECIMAL NOT NULL DEFAULT 0,
    "pagu_rpm" DECIMAL NOT NULL DEFAULT 0,
    "pagu_sbsn" DECIMAL NOT NULL DEFAULT 0,
    "pagu_phln" DECIMAL NOT NULL DEFAULT 0,
    "pagu_total" DECIMAL NOT NULL DEFAULT 0,
    "real_51" DECIMAL NOT NULL DEFAULT 0,
    "real_52" DECIMAL NOT NULL DEFAULT 0,
    "real_53" DECIMAL NOT NULL DEFAULT 0,
    "real_rpm" DECIMAL NOT NULL DEFAULT 0,
    "real_sbsn" DECIMAL NOT NULL DEFAULT 0,
    "real_phln" DECIMAL NOT NULL DEFAULT 0,
    "real_total" DECIMAL NOT NULL DEFAULT 0,
    "progres_keuangan" DECIMAL NOT NULL DEFAULT 0,
    "progres_fisik" DECIMAL NOT NULL DEFAULT 0,
    "progres_keu_jan" DECIMAL NOT NULL DEFAULT 0,
    "progres_keu_feb" DECIMAL NOT NULL DEFAULT 0,
    "progres_keu_mar" DECIMAL NOT NULL DEFAULT 0,
    "progres_keu_apr" DECIMAL NOT NULL DEFAULT 0,
    "progres_keu_mei" DECIMAL NOT NULL DEFAULT 0,
    "progres_keu_jun" DECIMAL NOT NULL DEFAULT 0,
    "progres_keu_jul" DECIMAL NOT NULL DEFAULT 0,
    "progres_keu_agu" DECIMAL NOT NULL DEFAULT 0,
    "progres_keu_sep" DECIMAL NOT NULL DEFAULT 0,
    "progres_keu_okt" DECIMAL NOT NULL DEFAULT 0,
    "progres_keu_nov" DECIMAL NOT NULL DEFAULT 0,
    "progres_keu_des" DECIMAL NOT NULL DEFAULT 0,
    "progres_fisik_jan" DECIMAL NOT NULL DEFAULT 0,
    "progres_fisik_feb" DECIMAL NOT NULL DEFAULT 0,
    "progres_fisik_mar" DECIMAL NOT NULL DEFAULT 0,
    "progres_fisik_apr" DECIMAL NOT NULL DEFAULT 0,
    "progres_fisik_mei" DECIMAL NOT NULL DEFAULT 0,
    "progres_fisik_jun" DECIMAL NOT NULL DEFAULT 0,
    "progres_fisik_jul" DECIMAL NOT NULL DEFAULT 0,
    "progres_fisik_agu" DECIMAL NOT NULL DEFAULT 0,
    "progres_fisik_sep" DECIMAL NOT NULL DEFAULT 0,
    "progres_fisik_okt" DECIMAL NOT NULL DEFAULT 0,
    "progres_fisik_nov" DECIMAL NOT NULL DEFAULT 0,
    "progres_fisik_des" DECIMAL NOT NULL DEFAULT 0,
    "ren_keu_jan" DECIMAL NOT NULL DEFAULT 0,
    "ren_keu_feb" DECIMAL NOT NULL DEFAULT 0,
    "ren_keu_mar" DECIMAL NOT NULL DEFAULT 0,
    "ren_keu_apr" DECIMAL NOT NULL DEFAULT 0,
    "ren_keu_mei" DECIMAL NOT NULL DEFAULT 0,
    "ren_keu_jun" DECIMAL NOT NULL DEFAULT 0,
    "ren_keu_jul" DECIMAL NOT NULL DEFAULT 0,
    "ren_keu_agu" DECIMAL NOT NULL DEFAULT 0,
    "ren_keu_sep" DECIMAL NOT NULL DEFAULT 0,
    "ren_keu_okt" DECIMAL NOT NULL DEFAULT 0,
    "ren_keu_nov" DECIMAL NOT NULL DEFAULT 0,
    "ren_keu_des" DECIMAL NOT NULL DEFAULT 0,
    "ren_fis_jan" DECIMAL NOT NULL DEFAULT 0,
    "ren_fis_feb" DECIMAL NOT NULL DEFAULT 0,
    "ren_fis_mar" DECIMAL NOT NULL DEFAULT 0,
    "ren_fis_apr" DECIMAL NOT NULL DEFAULT 0,
    "ren_fis_mei" DECIMAL NOT NULL DEFAULT 0,
    "ren_fis_jun" DECIMAL NOT NULL DEFAULT 0,
    "ren_fis_jul" DECIMAL NOT NULL DEFAULT 0,
    "ren_fis_agu" DECIMAL NOT NULL DEFAULT 0,
    "ren_fis_sep" DECIMAL NOT NULL DEFAULT 0,
    "ren_fis_okt" DECIMAL NOT NULL DEFAULT 0,
    "ren_fis_nov" DECIMAL NOT NULL DEFAULT 0,
    "ren_fis_des" DECIMAL NOT NULL DEFAULT 0,
    CONSTRAINT "Paket_programPaketKode_fkey" FOREIGN KEY ("programPaketKode") REFERENCES "ProgramPaket" ("kode") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaketDetail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "programPaketKode" TEXT NOT NULL,
    "thang" INTEGER NOT NULL DEFAULT 0,
    "kdjendok" TEXT NOT NULL,
    "kdsatker" TEXT NOT NULL,
    "kddept" TEXT NOT NULL,
    "kdunit" TEXT NOT NULL,
    "kdprogram" TEXT NOT NULL,
    "kdgiat" TEXT NOT NULL,
    "kdoutput" TEXT NOT NULL,
    "kdlokasi" TEXT NOT NULL,
    "kdkabkota" TEXT NOT NULL,
    "kddekon" TEXT NOT NULL,
    "kdsoutput" TEXT NOT NULL,
    "kdkmpnen" TEXT NOT NULL,
    "kdskmpnen" TEXT NOT NULL,
    "kdakun" TEXT NOT NULL,
    "kdkppn" TEXT NOT NULL,
    "kdbeban" TEXT NOT NULL,
    "kdjnsban" TEXT NOT NULL,
    "kdctarik" TEXT NOT NULL,
    "register" TEXT,
    "carahitung" TEXT,
    "header1" TEXT,
    "header2" TEXT,
    "kdheader" TEXT,
    "noitem" TEXT,
    "nmitem" TEXT NOT NULL,
    "vol1" DECIMAL NOT NULL DEFAULT 0,
    "sat1" TEXT,
    "vol2" DECIMAL NOT NULL DEFAULT 0,
    "sat2" TEXT,
    "vol3" DECIMAL NOT NULL DEFAULT 0,
    "sat3" TEXT,
    "vol4" DECIMAL NOT NULL DEFAULT 0,
    "sat4" TEXT,
    "volkeg" DECIMAL NOT NULL DEFAULT 0,
    "satkeg" TEXT,
    "hargasat" DECIMAL NOT NULL DEFAULT 0,
    "jumlah" DECIMAL NOT NULL DEFAULT 0,
    "jumlah2" DECIMAL NOT NULL DEFAULT 0,
    "paguphln" DECIMAL NOT NULL DEFAULT 0,
    "pagurmp" DECIMAL NOT NULL DEFAULT 0,
    "pagurkp" DECIMAL NOT NULL DEFAULT 0,
    "kdblokir" TEXT,
    "BLOKIRPHLN" DECIMAL NOT NULL DEFAULT 0,
    "BLOKIRRMP" DECIMAL NOT NULL DEFAULT 0,
    "BLOKIRRKP" DECIMAL NOT NULL DEFAULT 0,
    "RPHBLOKIR" DECIMAL NOT NULL DEFAULT 0,
    "KDCOPY" TEXT,
    "KDABT" TEXT,
    "KDSBU" TEXT,
    "VOLSBK" DECIMAL NOT NULL DEFAULT 0,
    "VOLRKAKL" DECIMAL NOT NULL DEFAULT 0,
    "BLNKONTRAK" DECIMAL NOT NULL DEFAULT 0,
    "NOKONTRAK" TEXT,
    "TGKONTRAK" DATETIME,
    "NILKONTRAK" DECIMAL NOT NULL DEFAULT 0,
    "JANUARI" DECIMAL NOT NULL DEFAULT 0,
    "PEBRUARI" DECIMAL NOT NULL DEFAULT 0,
    "MARET" DECIMAL NOT NULL DEFAULT 0,
    "APRIL" DECIMAL NOT NULL DEFAULT 0,
    "MEI" DECIMAL NOT NULL DEFAULT 0,
    "JUNI" DECIMAL NOT NULL DEFAULT 0,
    "JULI" DECIMAL NOT NULL DEFAULT 0,
    "AGUSTUS" DECIMAL NOT NULL DEFAULT 0,
    "SEPTEMBER" DECIMAL NOT NULL DEFAULT 0,
    "OKTOBER" DECIMAL NOT NULL DEFAULT 0,
    "NOPEMBER" DECIMAL NOT NULL DEFAULT 0,
    "DESEMBER" DECIMAL NOT NULL DEFAULT 0,
    "JMLTUNDA" DECIMAL NOT NULL DEFAULT 0,
    "KDLUNCURAN" TEXT,
    "JMLABT" DECIMAL NOT NULL DEFAULT 0,
    "NOREV" TEXT,
    "KDUBAH" TEXT,
    "KURS" DECIMAL NOT NULL DEFAULT 0,
    "INDEXKPJM" TEXT,
    "KDIB" TEXT,
    CONSTRAINT "PaketDetail_programPaketKode_fkey" FOREIGN KEY ("programPaketKode") REFERENCES "ProgramPaket" ("kode") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UnitKerja" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stafName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "provinsi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "kota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "provinsiId" TEXT NOT NULL,
    CONSTRAINT "kota_provinsiId_fkey" FOREIGN KEY ("provinsiId") REFERENCES "provinsi" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "kecamatan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "kotaId" TEXT NOT NULL,
    CONSTRAINT "kecamatan_kotaId_fkey" FOREIGN KEY ("kotaId") REFERENCES "kota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "kelurahan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "kecamatanId" TEXT NOT NULL,
    CONSTRAINT "kelurahan_kecamatanId_fkey" FOREIGN KEY ("kecamatanId") REFERENCES "kecamatan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "klg" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "tempatLahir" TEXT NOT NULL,
    "tanggalLahir" DATETIME NOT NULL,
    "ktpProvId" TEXT NOT NULL,
    "ktpKotaId" TEXT NOT NULL,
    "ktpKecId" TEXT NOT NULL,
    "ktpKelId" TEXT NOT NULL,
    "ktpRt" TEXT,
    "ktpRw" TEXT,
    "ktpAlamat" TEXT NOT NULL,
    "domisiliProvId" TEXT,
    "domisiliKotaId" TEXT,
    "domisiliKecId" TEXT,
    "domisiliKelId" TEXT,
    "domisiliRt" TEXT,
    "domisiliRw" TEXT,
    "domisiliAlamat" TEXT,
    "fotoKtp" TEXT,
    "fotoPasPhoto" TEXT,
    "fotoPasKk" TEXT,
    "berkas1" TEXT,
    "berkas2" TEXT,
    "berkas3" TEXT,
    "berkas4" TEXT,
    "berkas5" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "statusId" TEXT NOT NULL,
    "ptoLokasiId" TEXT,
    "ptoId" TEXT,
    "lokasiKelurahan" INTEGER,
    "kategoryId" TEXT NOT NULL,
    "sandi" TEXT,
    "oldData" INTEGER NOT NULL,
    CONSTRAINT "klg_ktpProvId_fkey" FOREIGN KEY ("ktpProvId") REFERENCES "provinsi" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "klg_ktpKotaId_fkey" FOREIGN KEY ("ktpKotaId") REFERENCES "kota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "klg_ktpKecId_fkey" FOREIGN KEY ("ktpKecId") REFERENCES "kecamatan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "klg_ktpKelId_fkey" FOREIGN KEY ("ktpKelId") REFERENCES "kelurahan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "klg_domisiliProvId_fkey" FOREIGN KEY ("domisiliProvId") REFERENCES "provinsi" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "klg_domisiliKotaId_fkey" FOREIGN KEY ("domisiliKotaId") REFERENCES "kota" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "klg_domisiliKecId_fkey" FOREIGN KEY ("domisiliKecId") REFERENCES "kecamatan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "klg_domisiliKelId_fkey" FOREIGN KEY ("domisiliKelId") REFERENCES "kelurahan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "klg_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "KlgStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "klg_ptoLokasiId_fkey" FOREIGN KEY ("ptoLokasiId") REFERENCES "PtoLokasi" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "klg_ptoId_fkey" FOREIGN KEY ("ptoId") REFERENCES "Pto" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "klg_kategoryId_fkey" FOREIGN KEY ("kategoryId") REFERENCES "KlgKategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KlgStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "description" TEXT,
    "order" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KlgKategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER,
    "fileA" TEXT,
    "fileB" TEXT,
    "fileC" TEXT,
    "fileD" TEXT,
    "logo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "KlgStatusLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "klgId" TEXT NOT NULL,
    "oldStatusId" TEXT,
    "newStatusId" TEXT NOT NULL,
    "changedBy" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KlgStatusLog_klgId_fkey" FOREIGN KEY ("klgId") REFERENCES "klg" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KlgStatusLog_oldStatusId_fkey" FOREIGN KEY ("oldStatusId") REFERENCES "KlgStatus" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "KlgStatusLog_newStatusId_fkey" FOREIGN KEY ("newStatusId") REFERENCES "KlgStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "PtoAssignmentCounter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lastPtoId" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PtoAssignmentCounter_lastPtoId_fkey" FOREIGN KEY ("lastPtoId") REFERENCES "Pto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PtoLokasi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "ptoId" TEXT NOT NULL,
    CONSTRAINT "PtoLokasi_ptoId_fkey" FOREIGN KEY ("ptoId") REFERENCES "Pto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReKlg" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "klgId" TEXT NOT NULL,
    "ptoLokasiId" TEXT,
    "fotoKartuRusak" TEXT,
    "fotoSuratHilang" TEXT,
    "berkas1" TEXT,
    "berkas2" TEXT,
    "berkas3" TEXT,
    "berkas4" TEXT,
    "berkas5" TEXT,
    "status" TEXT NOT NULL,
    "ptoId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReKlg_klgId_fkey" FOREIGN KEY ("klgId") REFERENCES "klg" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReKlg_ptoLokasiId_fkey" FOREIGN KEY ("ptoLokasiId") REFERENCES "PtoLokasi" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ReKlg_ptoId_fkey" FOREIGN KEY ("ptoId") REFERENCES "Pto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Surat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jenis" TEXT NOT NULL,
    "nik" TEXT,
    "nama" TEXT,
    "ttl" TEXT,
    "alamat" TEXT,
    "pekerjaan" TEXT,
    "letakTanah" TEXT,
    "luas" TEXT,
    "batasUtara" TEXT,
    "batasSelatan" TEXT,
    "batasTimur" TEXT,
    "batasBarat" TEXT,
    "statusTanah" TEXT,
    "penggunaanTanah" TEXT,
    "namaUsaha" TEXT,
    "jenisUsaha" TEXT,
    "alamatUsaha" TEXT,
    "lamaUsaha" TEXT,
    "htlMeninggal" TEXT,
    "ttlMeninggal" TEXT,
    "sebabMeninggal" TEXT,
    "noKK" TEXT,
    "alamatAsal" TEXT,
    "alamatTujuan" TEXT,
    "alasanPindah" TEXT,
    "tglPindah" TEXT,
    "ttlAnak" TEXT,
    "ttlAnakKe" TEXT,
    "namaAyah" TEXT,
    "namaIbu" TEXT,
    "sekolah" TEXT,
    "kelas" TEXT,
    "keperluan" TEXT,
    "diagnosa" TEXT,
    "faskes" TEXT,
    "noBpjs" TEXT,
    "namaSekolah" TEXT,
    "namaPenjual" TEXT,
    "namaPembeli" TEXT,
    "jenisTransaksi" TEXT,
    "nilaiTransaksi" TEXT,
    "namaPihakPertama" TEXT,
    "nikPihakPertama" TEXT,
    "namaPihakKedua" TEXT,
    "nikPihakKedua" TEXT,
    "ahliWaris" JSONB,
    "status" TEXT NOT NULL DEFAULT 'SUBMIT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Media_menuId_type_langCode_key" ON "Media"("menuId", "type", "langCode");

-- CreateIndex
CREATE UNIQUE INDEX "MenuTranslation_menuId_langCode_key" ON "MenuTranslation"("menuId", "langCode");

-- CreateIndex
CREATE UNIQUE INDEX "MediaPage_pageId_type_langCode_key" ON "MediaPage"("pageId", "type", "langCode");

-- CreateIndex
CREATE UNIQUE INDEX "PageTranslation_pageId_langCode_key" ON "PageTranslation"("pageId", "langCode");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramPaket_kode_key" ON "ProgramPaket"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "UnitKerja_kode_key" ON "UnitKerja"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "klg_nik_key" ON "klg"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "KlgStatus_code_key" ON "KlgStatus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "KlgKategory_code_key" ON "KlgKategory"("code");

-- CreateIndex
CREATE INDEX "Surat_jenis_idx" ON "Surat"("jenis");

