import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>OpenGarageFlow</h1>
      <p>Gestión de clientes y vehículos para el taller.</p>
      <nav className="navigation">
        <Link href="/customers">Clientes</Link>
        <Link href="/vehicles">Vehículos</Link>
      </nav>
    </main>
  );
}
