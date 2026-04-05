"use client";

import { useEffect, useMemo, useState } from "react";

type Vino = {
  id: string;
  nombre: string;
  bodega: string;
  corte: string;
  region: string;
  cosecha: string;
  cantidad: number;
  ubicacion: string;
  precio: string;
  favorita: boolean;
};

const STORAGE_KEY = "vinoxamigos_cava";

const emptyForm: Vino = {
  id: "",
  nombre: "",
  bodega: "",
  corte: "",
  region: "",
  cosecha: "",
  cantidad: 1,
  ubicacion: "",
  precio: "",
  favorita: false,
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Page() {
  const [vinos, setVinos] = useState<Vino[]>([]);
  const [form, setForm] = useState<Vino>(emptyForm);
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setVinos(JSON.parse(saved));
      }
    } catch (error) {
      console.error("No se pudo leer la cava guardada", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vinos));
    } catch (error) {
      console.error("No se pudo guardar la cava", error);
    }
  }, [vinos]);

  function handleChange<K extends keyof Vino>(field: K, value: Vino[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function guardarVino() {
    if (!form.nombre.trim()) return;
    if (!form.bodega.trim()) return;

    const vinoAguardar: Vino = {
      ...form,
      id: form.id || uid(),
      cantidad: Number(form.cantidad) || 1,
    };

    setVinos((prev) => {
      const existe = prev.some((v) => v.id === vinoAguardar.id);
      if (existe) {
        return prev.map((v) => (v.id === vinoAguardar.id ? vinoAguardar : v));
      }
      return [vinoAguardar, ...prev];
    });

    setForm(emptyForm);
  }

  function editarVino(vino: Vino) {
    setForm(vino);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function borrarVino(id: string) {
    setVinos((prev) => prev.filter((v) => v.id !== id));
  }

  function toggleFavorita(id: string) {
    setVinos((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, favorita: !v.favorita } : v
      )
    );
  }

  const vinosFiltrados = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return vinos;

    return vinos.filter((vino) =>
      [
        vino.nombre,
        vino.bodega,
        vino.corte,
        vino.region,
        vino.cosecha,
        vino.ubicacion,
        vino.precio,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [vinos, search]);

  const totalBotellas = vinos.reduce((acc, vino) => acc + Number(vino.cantidad || 0), 0);
  const etiquetas = vinos.length;
  const favoritas = vinos.filter((vino) => vino.favorita).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#5C1242] via-[#3a0f2a] to-[#16060f] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <header className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/vinoxamigos.png"
                alt="Vinoxamigos"
                className="h-20 w-20 rounded-3xl bg-white p-2 object-contain shadow-lg"
              />
              <div>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                  Vinoxamigos
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">
                  Tu cava personal online. Cargá botellas, organizá añadas y
                  controlá tu stock sin pelearte con planillas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:min-w-[320px]">
              <StatCard label="Botellas" value={String(totalBotellas)} />
              <StatCard label="Etiquetas" value={String(etiquetas)} />
              <StatCard label="Favoritas" value={String(favoritas)} />
            </div>
          </div>
        </header>

        <section className="mb-8 rounded-3xl border border-white/10 bg-white/6 p-5 shadow-xl backdrop-blur md:p-6">
          <div className="mb-5">
            <label
              htmlFor="buscador"
              className="mb-2 block text-sm font-medium text-white/90"
            >
              Buscar vino
            </label>
            <input
              id="buscador"
              type="text"
              placeholder="Nombre, bodega, región, cosecha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-base text-black placeholder:text-gray-500 shadow-lg outline-none ring-0 transition focus:border-white/50 focus:shadow-xl"
            />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {form.id ? "Editar vino" : "Cargar vino"}
            </h2>
            {form.id ? (
              <button
                type="button"
                onClick={() => setForm(emptyForm)}
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
              >
                Cancelar edición
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Nombre"
              value={form.nombre}
              onChange={(value) => handleChange("nombre", value)}
              placeholder="Ej. DV Catena Malbec-Malbec"
            />
            <Field
              label="Bodega"
              value={form.bodega}
              onChange={(value) => handleChange("bodega", value)}
              placeholder="Ej. Catena Zapata"
            />
            <Field
              label="Corte / varietal"
              value={form.corte}
              onChange={(value) => handleChange("corte", value)}
              placeholder="Ej. Malbec, Blend, Pinot Noir"
            />
            <Field
              label="Región"
              value={form.region}
              onChange={(value) => handleChange("region", value)}
              placeholder="Ej. Valle de Uco"
            />
            <Field
              label="Cosecha"
              value={form.cosecha}
              onChange={(value) => handleChange("cosecha", value)}
              placeholder="Ej. 2020"
            />
            <Field
              label="Cantidad"
              type="number"
              value={String(form.cantidad)}
              onChange={(value) =>
                handleChange("cantidad", Number(value) || 1)
              }
              placeholder="1"
            />
            <Field
              label="Ubicación"
              value={form.ubicacion}
              onChange={(value) => handleChange("ubicacion", value)}
              placeholder="Ej. Estante A, fila 2"
            />
            <Field
              label="Precio"
              value={form.precio}
              onChange={(value) => handleChange("precio", value)}
              placeholder="Ej. 25000"
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-3 text-sm text-white/90">
              <input
                type="checkbox"
                checked={form.favorita}
                onChange={(e) => handleChange("favorita", e.target.checked)}
                className="h-4 w-4 rounded border-white/20"
              />
              Marcar como favorita
            </label>

            <button
              type="button"
              onClick={guardarVino}
              className="rounded-2xl bg-white px-5 py-3 text-base font-semibold text-[#2c0b1d] shadow-lg transition hover:scale-[1.02] hover:shadow-2xl"
            >
              {form.id ? "Guardar cambios" : "Guardar vino"}
            </button>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Tu cava</h2>
            <p className="text-sm text-white/75">
              {vinosFiltrados.length} resultado{vinosFiltrados.length === 1 ? "" : "s"}
            </p>
          </div>

          {vinosFiltrados.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur">
              <p className="text-lg font-medium text-white/90">
                Todavía no hay vinos cargados.
              </p>
              <p className="mt-2 text-sm text-white/70">
                Empezá por una botella y después la app hace el resto. Sin drama,
                sin corcho volando.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {vinosFiltrados.map((vino) => (
                <article
                  key={vino.id}
                  className="rounded-3xl border border-white/10 bg-white p-5 text-black shadow-xl"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-2xl font-bold text-[#3a0f2a]">
                          {vino.nombre || "Sin nombre"}
                        </h3>
                        {vino.favorita ? (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            ★ Favorita
                          </span>
                        ) : null}
                      </div>

                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Bodega:</span> {vino.bodega || "—"}
                      </p>

                      <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-3">
                        <Info label="Corte" value={vino.corte} />
                        <Info label="Región" value={vino.region} />
                        <Info label="Cosecha" value={vino.cosecha} />
                        <Info label="Cantidad" value={String(vino.cantidad)} />
                        <Info label="Ubicación" value={vino.ubicacion} />
                        <Info label="Precio" value={vino.precio ? `$${vino.precio}` : ""} />
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleFavorita(vino.id)}
                        className="rounded-2xl bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                      >
                        {vino.favorita ? "Quitar favorita" : "Marcar favorita"}
                      </button>
                      <button
                        type="button"
                        onClick={() => editarVino(vino)}
                        className="rounded-2xl bg-[#5C1242] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4a0f35]"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => borrarVino(vino.id)}
                        className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center">
      <div className="text-xs uppercase tracking-[0.18em] text-white/70">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/90">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-base text-black placeholder:text-gray-500 shadow-lg outline-none transition focus:border-white/50 focus:shadow-xl"
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 px-3 py-2">
      <span className="mr-1 font-semibold text-gray-900">{label}:</span>
      <span className="text-gray-700">{value?.trim() ? value : "—"}</span>
    </div>
  );
}