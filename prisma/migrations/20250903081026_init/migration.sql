-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Partido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "local" TEXT NOT NULL,
    "visitante" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "resultadoLocal" INTEGER,
    "resultadoVisitante" INTEGER
);

-- CreateTable
CREATE TABLE "Prediccion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "partidoId" INTEGER NOT NULL,
    "predLocal" INTEGER NOT NULL,
    "predVisitante" INTEGER NOT NULL,
    CONSTRAINT "Prediccion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prediccion_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "Partido" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Prediccion_usuarioId_partidoId_key" ON "Prediccion"("usuarioId", "partidoId");
