"use client";

import { useEffect, useMemo, useState } from "react";

type Wine = {
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
  comentario: string;
  resena: string;
  puntaje: string;
  volverComprar: boolean;
};

const STORAGE_KEY = "vinoxamigos_cava_v4";

const emptyForm: Wine = {
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
  comentario: "",
  resena: "",
  puntaje: "",
  volverComprar: false,
};

function uid() {
  return Math.random().toString(36).slice(2, 11);
}

export default function Page() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [form, setForm] = useState<Wine>(emptyForm);
  const [search, setSearch] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setWines(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error leyendo datos guardados", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wines));
    } catch (error) {
      console.error("Error guardando datos", error);
    }
  }, [wines]);

  function updateForm<K extends keyof Wine>(field: K, value: Wine[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function saveWine() {
    if (!form.nombre.trim() || !form.bodega.trim()) {
      alert("Completá al menos nombre y bodega.");
      return;
    }

    const payload: Wine = {
      ...form,
      id: form.id || uid(),
      cantidad: Math.max(0, Number(form.cantidad) || 0),
    };

    setWines((prev) => {
      const exists = prev.some((wine) => wine.id === payload.id);
      if (exists) {
        return prev.map((wine) => (wine.id === payload.id ? payload : wine));
      }
      return [payload, ...prev];
    });

    setForm(emptyForm);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editWine(wine: Wine) {
    setForm(wine);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setForm(emptyForm);
  }

  function deleteWine(id: string) {
    const ok = window.confirm("¿Querés borrar este vino?");
    if (!ok) return;
    setWines((prev) => prev.filter((wine) => wine.id !== id));
  }

  function toggleFavorite(id: string) {
    setWines((prev) =>
      prev.map((wine) =>
        wine.id === id ? { ...wine, favorita: !wine.favorita } : wine
      )
    );
  }

  function openOneBottle(id: string) {
    setWines((prev) =>
      prev.map((wine) => {
        if (wine.id !== id) return wine;
        return { ...wine, cantidad: Math.max(0, wine.cantidad - 1) };
      })
    );
  }

  function addOneBottle(id: string) {
    setWines((prev) =>
      prev.map((wine) => {
        if (wine.id !== id) return wine;
        return { ...wine, cantidad: wine.cantidad + 1 };
      })
    );
  }

  const filteredWines = useMemo(() => {
    const term = search.toLowerCase().trim();

    return wines.filter((wine) => {
      const searchableText = [
        wine.nombre,
        wine.bodega,
        wine.corte,
        wine.region,
        wine.cosecha,
        wine.ubicacion,
        wine.precio,
        wine.comentario,
        wine.resena,
        wine.puntaje,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || searchableText.includes(term);
      const matchesFavorite = !onlyFavorites || wine.favorita;

      return matchesSearch && matchesFavorite;
    });
  }, [wines, search, onlyFavorites]);

  const winesInCellar = filteredWines.filter((wine) => wine.cantidad > 0);
  const winesConsumed = filteredWines.filter((wine) => wine.cantidad === 0);

  const totalBottles = wines.reduce((acc, wine) => acc + wine.cantidad, 0);
  const totalLabels = wines.length;
  const totalFavorites = wines.filter((wine) => wine.favorita).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#5C1242] via-[#3b112c] to-[#17070f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <header className="mb-8 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur md:p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/vinoxamigos.png"
                alt="Vinoxamigos"
                className="h-16 w-16 shrink-0 object-contain md:h-20 md:w-20"
              />

              <div>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                  Vinoxamigos
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80 md:text-base">
                  Tu cava personal online. Cargá botellas, seguí el stock,
                  registrá reseñas y separá lo que todavía tenés de lo que ya
                  quedó en el recuerdo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:min-w-[340px]">
              <StatCard label="Botellas" value={String(totalBottles)} />
              <StatCard label="Etiquetas" value={String(totalLabels)} />
              <StatCard label="Favoritas" value={String(totalFavorites)} />
            </div>
          </div>
        </header>

        <section className="mb-8 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur md:p-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="w-full md:max-w-xl">
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-medium text-white/90"
              >
                Buscar vino
              </label>
              <input
                id="search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, bodega, región, cosecha, reseña..."
                className="w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-black placeholder:text-gray-500 shadow-lg outline-none transition focus:border-white/40"
              />
            </div>

            <button
              type="button"
              onClick={() => setOnlyFavorites((prev) => !prev)}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                onlyFavorites
                  ? "bg-amber-300 text-[#3b112c]"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              {onlyFavorites ? "Mostrando favoritas" : "Filtrar favoritas"}
            </button>
          </div>

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {form.id ? "Editar vino" : "Cargar vino"}
            </h2>

            {form.id ? (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-2xl border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                Cancelar edición
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Nombre"
              value={form.nombre}
              onChange={(value) => updateForm("nombre", value)}
              placeholder="Ej. DV Catena Malbec-Malbec"
            />
            <Field
              label="Bodega"
              value={form.bodega}
              onChange={(value) => updateForm("bodega", value)}
              placeholder="Ej. Catena Zapata"
            />
            <Field
              label="Corte / varietal"
              value={form.corte}
              onChange={(value) => updateForm("corte", value)}
              placeholder="Ej. Malbec, Blend, Pinot Noir"
            />
            <Field
              label="Región"
              value={form.region}
              onChange={(value) => updateForm("region", value)}
              placeholder="Ej. Valle de Uco"
            />
            <Field
              label="Cosecha"
              value={form.cosecha}
              onChange={(value) => updateForm("cosecha", value)}
              placeholder="Ej. 2020"
            />
            <Field
              label="Botellas actuales"
              type="number"
              value={String(form.cantidad)}
              onChange={(value) => updateForm("cantidad", Math.max(0, Number(value) || 0))}
              placeholder="1"
            />
            <Field
              label="Ubicación"
              value={form.ubicacion}
              onChange={(value) => updateForm("ubicacion", value)}
              placeholder="Ej. Estante A, fila 2"
            />
            <Field
              label="Precio"
              value={form.precio}
              onChange={(value) => updateForm("precio", value)}
              placeholder="Ej. 25000"
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextAreaField
              label="Comentario"
              value={form.comentario}
              onChange={(value) => updateForm("comentario", value)}
              placeholder="Dato corto: dónde lo compraste, para qué ocasión lo guardás, etc."
            />

            <TextAreaField
              label="Reseña si se abrió"
              value={form.resena}
              onChange={(value) => updateForm("resena", value)}
              placeholder="Cómo estaba el vino, si rindió, si repetirías o no..."
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Puntaje"
              value={form.puntaje}
              onChange={(value) => updateForm("puntaje", value)}
              placeholder="Ej. 8.5 / 10"
            />

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <label className="flex items-center gap-3 text-sm text-white/90">
                <input
                  type="checkbox"
                  checked={form.favorita}
                  onChange={(e) => updateForm("favorita", e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Marcar como favorita
              </label>

              <label className="mt-3 flex items-center gap-3 text-sm text-white/90">
                <input
                  type="checkbox"
                  checked={form.volverComprar}
                  onChange={(e) => updateForm("volverComprar", e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Volvería a comprar
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={saveWine}
              className="rounded-2xl bg-white px-5 py-3 text-base font-bold text-[#3b112c] shadow-xl transition hover:scale-[1.02]"
            >
              {form.id ? "Guardar cambios" : "Guardar vino"}
            </button>
          </div>
        </section>

        <SectionTitle
          title="Vinos en cava"
          subtitle="Lo que todavía está disponible para abrir o seguir guardando."
          count={winesInCellar.length}
        />

        {winesInCellar.length === 0 ? (
          <EmptyState text="No hay vinos disponibles en la cava con este filtro." />
        ) : (
          <div className="mb-10 grid grid-cols-1 gap-4">
            {winesInCellar.map((wine) => (
              <WineCard
                key={wine.id}
                wine={wine}
                onEdit={editWine}
                onDelete={deleteWine}
                onToggleFavorite={toggleFavorite}
                onOpenOne={openOneBottle}
                onAddOne={addOneBottle}
              />
            ))}
          </div>
        )}

        <SectionTitle
          title="Vinos ya tomados"
          subtitle="Etiquetas sin stock, pero con memoria, puntaje y revancha."
          count={winesConsumed.length}
        />

        {winesConsumed.length === 0 ? (
          <EmptyState text="Todavía no hay vinos agotados o ya tomados." />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {winesConsumed.map((wine) => (
              <WineCard
                key={wine.id}
                wine={wine}
                onEdit={editWine}
                onDelete={deleteWine}
                onToggleFavorite={toggleFavorite}
                onOpenOne={openOneBottle}
                onAddOne={addOneBottle}
              />
            ))}
          </div>
        )}
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
        className="w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-black placeholder:text-gray-500 shadow-lg outline-none transition focus:border-white/40"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/90">
        {label}
      </label>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-black placeholder:text-gray-500 shadow-lg outline-none transition focus:border-white/40"
      />
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle: string;
  count: number;
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-white/70">{subtitle}</p>
      </div>
      <p className="text-sm text-white/75">
        {count} resultado{count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mb-10 rounded-[28px] border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
      <p className="text-base text-white/80">{text}</p>
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

function WineCard({
  wine,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenOne,
  onAddOne,
}: {
  wine: Wine;
  onEdit: (wine: Wine) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenOne: (id: string) => void;
  onAddOne: (id: string) => void;
}) {
  const noStock = wine.cantidad === 0;

  return (
    <article className="rounded-[28px] border border-white/10 bg-white p-5 text-black shadow-2xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-bold text-[#3b112c]">
              {wine.nombre || "Sin nombre"}
            </h3>

            {wine.favorita ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                ★ Favorita
              </span>
            ) : null}

            {wine.volverComprar ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                ✔ Volvería a comprar
              </span>
            ) : null}

            {noStock ? (
              <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700">
                Sin stock
              </span>
            ) : null}
          </div>

          <p className="text-sm text-gray-700">
            <span className="font-semibold">Bodega:</span> {wine.bodega || "—"}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2 xl:grid-cols-4">
            <Info label="Corte" value={wine.corte} />
            <Info label="Región" value={wine.region} />
            <Info label="Cosecha" value={wine.cosecha} />
            <Info label="Botellas" value={String(wine.cantidad)} />
            <Info label="Ubicación" value={wine.ubicacion} />
            <Info label="Precio" value={wine.precio ? `$${wine.precio}` : ""} />
            <Info label="Puntaje" value={wine.puntaje} />
          </div>

          {wine.comentario?.trim() ? (
            <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3">
              <p className="mb-1 text-sm font-semibold text-[#3b112c]">
                Comentario
              </p>
              <p className="text-sm text-gray-700">{wine.comentario}</p>
            </div>
          ) : null}

          {wine.resena?.trim() ? (
            <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3">
              <p className="mb-1 text-sm font-semibold text-[#3b112c]">
                Reseña
              </p>
              <p className="text-sm text-gray-700">{wine.resena}</p>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 md:max-w-[280px] md:justify-end">
          <button
            type="button"
            onClick={() => onOpenOne(wine.id)}
            className="rounded-2xl bg-[#5C1242] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4b1036]"
          >
            Abrí una
          </button>

          <button
            type="button"
            onClick={() => onAddOne(wine.id)}
            className="rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-200"
          >
            Sumar una
          </button>

          <button
            type="button"
            onClick={() => onToggleFavorite(wine.id)}
            className="rounded-2xl bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
          >
            {wine.favorita ? "Quitar favorita" : "Marcar favorita"}
          </button>

          <button
            type="button"
            onClick={() => onEdit(wine)}
            className="rounded-2xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-200"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => onDelete(wine.id)}
            className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            Borrar
          </button>
        </div>
      </div>
    </article>
  );
}