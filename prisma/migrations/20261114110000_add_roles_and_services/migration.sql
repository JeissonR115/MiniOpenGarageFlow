-- CreateTable
CREATE TABLE "servicios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vehiculo_id" INTEGER NOT NULL,
    "fecha" DATETIME NOT NULL,
    "descripcion" TEXT NOT NULL,
    "costo" REAL NOT NULL,
    CONSTRAINT "servicios_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "Vehiculo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'administrador',
    "fecha_registro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_usuarios" ("correo", "fecha_registro", "id", "nombre", "password_hash") SELECT "correo", "fecha_registro", "id", "nombre", "password_hash" FROM "usuarios";
DROP TABLE "usuarios";
ALTER TABLE "new_usuarios" RENAME TO "usuarios";
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
