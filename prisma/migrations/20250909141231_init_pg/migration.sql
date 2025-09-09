-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "verificationToken" TEXT,
    "verificationExpires" TIMESTAMP(3),
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Jornada" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),

    CONSTRAINT "Jornada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Partido" (
    "id" SERIAL NOT NULL,
    "local" TEXT NOT NULL,
    "visitante" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "resultadoLocal" INTEGER,
    "resultadoVisitante" INTEGER,
    "jornadaId" INTEGER,

    CONSTRAINT "Partido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prediccion" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "partidoId" INTEGER NOT NULL,
    "predLocal" INTEGER NOT NULL,
    "predVisitante" INTEGER NOT NULL,

    CONSTRAINT "Prediccion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_alias_key" ON "public"."Usuario"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "public"."Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_verificationToken_key" ON "public"."Usuario"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "Prediccion_usuarioId_partidoId_key" ON "public"."Prediccion"("usuarioId", "partidoId");

-- AddForeignKey
ALTER TABLE "public"."Partido" ADD CONSTRAINT "Partido_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "public"."Jornada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prediccion" ADD CONSTRAINT "Prediccion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prediccion" ADD CONSTRAINT "Prediccion_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "public"."Partido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
