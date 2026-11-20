import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { AppSidebar } from "./app-sidebar";
import { getCurrentUser } from "@/lib/current-user";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OpenGarageFlow",
  description: "Gestión de clientes y vehículos para el taller",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="es">
      <body className={`${playfairDisplay.variable} ${sourceSans3.variable}`}>
        <AppSidebar isAdministrator={user?.rol === "administrador"} />
        <div className="app-content">{children}</div>
      </body>
    </html>
  );
}
