-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('MEDICAL', 'PARENTAL', 'LEGAL', 'UNPAID', 'OTHER');

-- DropForeignKey
ALTER TABLE "vacations" DROP CONSTRAINT "vacations_employeeId_fkey";

-- AlterTable
ALTER TABLE "vacations" ADD COLUMN     "rejectionReason" TEXT;

-- CreateTable
CREATE TABLE "leaves" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" "LeaveType" NOT NULL,
    "description" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "employeeId" TEXT NOT NULL,
    "approvedById" TEXT,

    CONSTRAINT "leaves_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vacations" ADD CONSTRAINT "vacations_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
