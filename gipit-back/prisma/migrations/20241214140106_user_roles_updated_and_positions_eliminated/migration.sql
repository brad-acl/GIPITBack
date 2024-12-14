/*
  Warnings:

  - You are about to drop the column `position_id` on the `candidate_management` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `position_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `position` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "candidate_management" DROP CONSTRAINT "fk_position_candidate_management";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "fk_position";

-- AlterTable
ALTER TABLE "candidate_management" DROP COLUMN "position_id",
ADD COLUMN     "position" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar",
DROP COLUMN "position_id",
DROP COLUMN "role",
ADD COLUMN     "position" VARCHAR(255),
ADD COLUMN     "role_id" INTEGER;

-- DropTable
DROP TABLE "position";

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
