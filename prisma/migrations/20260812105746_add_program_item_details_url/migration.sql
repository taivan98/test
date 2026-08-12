-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProgramItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'WORKSHOP',
    "kindHr" TEXT NOT NULL DEFAULT '',
    "kindEn" TEXT NOT NULL DEFAULT '',
    "titleHr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionHr" TEXT NOT NULL DEFAULT '',
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "speaker" TEXT NOT NULL DEFAULT '',
    "room" TEXT NOT NULL DEFAULT '',
    "detailsUrl" TEXT NOT NULL DEFAULT '',
    "capacity" INTEGER,
    "order" INTEGER NOT NULL,
    CONSTRAINT "ProgramItem_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProgramItem" ("blockId", "capacity", "descriptionEn", "descriptionHr", "id", "kindEn", "kindHr", "order", "room", "speaker", "titleEn", "titleHr", "type") SELECT "blockId", "capacity", "descriptionEn", "descriptionHr", "id", "kindEn", "kindHr", "order", "room", "speaker", "titleEn", "titleHr", "type" FROM "ProgramItem";
DROP TABLE "ProgramItem";
ALTER TABLE "new_ProgramItem" RENAME TO "ProgramItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
