-- CreateTable
CREATE TABLE "MenuData" (
    "id" TEXT NOT NULL DEFAULT 'current',
    "version" INTEGER NOT NULL DEFAULT 1,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuData_pkey" PRIMARY KEY ("id")
);
