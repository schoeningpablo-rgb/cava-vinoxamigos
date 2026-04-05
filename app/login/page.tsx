"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  function resetMessages() {
    setMessage("");
    setErrorText("");
  }

  async function handleLogin() {
    resetMessages();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setErrorText("Completá email y contraseña.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    setLoading(false);

    if (error) {
      setErrorText("Email o contraseña incorrectos.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleRegister() {
    resetMessages();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setErrorText("Completá email y contraseña.");
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorText("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
    });

    setLoading(false);

    if (error) {
      if (
        error.message.toLowerCase().includes("already registered") ||
        error.message.toLowerCase().includes("already been registered") ||
        error.message.toLowerCase().includes("user already registered")
      ) {
        setErrorText("Ese email ya está registrado.");
        return;
      }

      setErrorText(error.message);
      return;
    }

    setMessage(
      "Cuenta creada correctamente. Si tu proyecto exige confirmación por mail, revisá tu correo. Si no, ya podés iniciar sesión."
    );
    setMode("login");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    if (mode === "login") {
      await handleLogin();
    } else {
      await handleRegister();
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#5C1242] via-[#3b112c] to-[#17070f] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden flex-col justify-between bg-gradient-to-br from-white/10 to-white/5 p-10 lg:flex">
            <div>
              <img
                src="/vinoxamigos.png"
                alt="Vinoxamigos"
                className="h-20 w-20 object-contain"
              />
              <h1 className="mt-6 text-5xl font-bold tracking-tight">
                Vinoxamigos
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-white/80">
                Tu administrador de cava personal. Organizá botellas, seguí
                stock, guardá reseñas y encontrá tus vinos desde cualquier
                dispositivo.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <InfoBox title="Stock" value="Botellas" />
              <InfoBox title="Notas" value="Reseñas" />
              <InfoBox title="Orden" value="Filtros" />
            </div>
          </section>

          <section className="p-6 sm:p-8 md:p-10">
            <div className="mx-auto max-w-md">
              <div className="mb-8 lg:hidden">
                <img
                  src="/vinoxamigos.png"
                  alt="Vinoxamigos"
                  className="h-16 w-16 object-contain"
                />
                <h1 className="mt-4 text-4xl font-bold tracking-tight">
                  Vinoxamigos
                </h1>
                <p className="mt-2 text-sm text-white/75">
                  Administrador de cava personal provisto por vinoxamigos.
                </p>
              </div>

              <div className="mb-6 flex rounded-2xl border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => {
                    resetMessages();
                    setMode("login");
                  }}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    mode === "login"
                      ? "bg-white text-[#3b112c]"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  Iniciar sesión
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetMessages();
                    setMode("signup");
                  }}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    mode === "signup"
                      ? "bg-white text-[#3b112c]"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  Crear cuenta
                </button>
              </div>

              <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight">
                  {mode === "login" ? "Entrá a tu cava" : "Creá tu usuario"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {mode === "login"
                    ? "Ingresá con tu email y contraseña para ver tu cava."
                    : "Registrate para empezar a cargar botellas, notas y stock."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-white/90"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-black shadow-lg outline-none placeholder:text-gray-500 focus:border-white/40"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-white/90"
                  >
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-black shadow-lg outline-none placeholder:text-gray-500 focus:border-white/40"
                  />
                </div>

                {errorText ? (
                  <div className="rounded-2xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm text-red-100">
                    {errorText}
                  </div>
                ) : null}

                {message ? (
                  <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">
                    {message}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-white px-5 py-3 text-base font-bold text-[#3b112c] shadow-xl transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Procesando..."
                    : mode === "login"
                    ? "Iniciar sesión"
                    : "Crear cuenta"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs leading-5 text-white/60">
                Administrador de cava personal provisto por vinoxamigos.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function InfoBox({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-white/60">
        {title}
      </div>
      <div className="mt-2 text-lg font-bold text-white">{value}</div>
    </div>
  );
}