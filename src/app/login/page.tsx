import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="login-page">
      <section aria-labelledby="login-title" className="login-card">
        <p className="eyebrow">ACCESO AL TALLER</p>
        <h1 id="login-title">Bienvenido</h1>
        <p className="page-intro">Ingresa con la cuenta de administrador del taller.</p>
        <LoginForm />
      </section>
    </main>
  );
}
