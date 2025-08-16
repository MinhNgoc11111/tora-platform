-- CreateTable
CREATE TABLE "PurgeLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminEmail" TEXT NOT NULL,
    "targetEmail" TEXT NOT NULL,
    "deletedType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
