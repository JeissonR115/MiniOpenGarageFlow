PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Vehiculo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clienteId" INTEGER NOT NULL,
    "placa" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER,
    "color" TEXT,
    "fecha_registro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vehiculo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Vehiculo" ("anio", "clienteId", "color", "id", "marca", "modelo", "placa")
SELECT "anio", "clienteId", "color", "id", "marca", "modelo", "placa"
FROM "Vehiculo";

DROP TABLE "Vehiculo";
ALTER TABLE "new_Vehiculo" RENAME TO "Vehiculo";
CREATE UNIQUE INDEX "Vehiculo_placa_key" ON "Vehiculo"("placa");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
