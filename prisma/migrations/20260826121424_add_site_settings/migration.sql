-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "accentColor" TEXT NOT NULL DEFAULT '',
    "accentInk" TEXT NOT NULL DEFAULT '',
    "customCss" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);
