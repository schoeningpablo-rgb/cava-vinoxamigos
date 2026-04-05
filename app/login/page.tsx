"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      router.push("/");
    }
  }

  async function handleRegister() {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Usuario creado, ahora podés iniciar sesión");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3b112c] text-white px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/10 p-8 shadow-xl backdrop-blur">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Vinoxamigos Login 🍷
        </h1>

        <label className="mb-1 block text-sm text-white/85">Email</label>
        <input
          type="email"
          placeholder="tu@email.com"
          className="mb-4 w-full rounded-lg bg-white/95 p-3 text-black outline-none placeholder:text-gray-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="mb-1 block text-sm text-white/85">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          className="mb-5 w-full rounded-lg bg-white/95 p-3 text-black outline-none placeholder:text-gray-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="mb-3 w-full rounded-lg bg-white py-3 font-bold text-[#3b112c] transition hover:opacity-90"
        >
          {loading ? "Cargando..." : "Iniciar sesión"}
        </button>

        <button
          onClick={handleRegister}
          className="w-full rounded-lg border border-white/60 py-3 text-white transition hover:bg-white/10"
        >
          Crear cuenta
        </button>
      </div>
    </div>
  );
}