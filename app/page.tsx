"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

type Wine = {
  id: string;
  user_id: string;
  nombre: string | null;
  bodega: string | null;
  corte: string | null;
  region: string | null;
  cosecha: string | null;
  cantidad: number | null;
  ubicacion: string | null;
  precio: string | null;
  favorita: boolean | null;
  comentario: string | null;
  resena: string | null;
  puntaje: string | null;
  volver_comprar: boolean | null;
  created_at?: string;
};

type FormState = {
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
  volver_comprar: boolean;
};

type GroupedWine = {
  key: string;
  nombre: string;
  bodega: string;
  corte: string;
  region: string;
  totalBotellas: number;
  favoritas: number;
  recompras: number;
  recomendados: number;
  mejorPuntaje: number | null;
  items: Wine[];
};

const emptyForm: FormState = {
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
  volver_comprar: false,
};

export default function Home() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCellarName, setSavingCellarName] = useState(false);

  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [cellarName, setCellarName] = useState("Mi cava");
  const [editingCellarName, setEditingCellarName] = useState(false);
  const [cellarNameInput, setCellarNameInput] = useState("Mi cava");

  const [wines, setWines] = useState<Wine[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [search, setSearch] = useState("");
  const [filterBodega, setFilterBodega] = useState("Todas");
  const [filterCorte, setFilterCorte] = useState("Todos");
  const [filterRegion, setFilterRegion] = useState("Todas");
  const [filterCosecha, setFilterCosecha] = useState("Todas");
  const [filterEstado, setFilterEstado] = useState("En cava");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyRebuy, setOnlyRebuy] = useState(false);
  const [sortBy, setSortBy] = useState("nombre");

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setUserId(data.user.id);
      setUserEmail(data.user.email || "");

      const savedCellarName =
        data.user.user_metadata?.cellar_name?.trim() || "Mi cava";

      setCellarName(savedCellarName);
      setCellarNameInput(savedCellarName);

      await loadWines(data.user.id);
      setLoading(false);
    };

    init();
  }, [router]);

  useEffect(() => {
    document.title = `${cellarName} | Vinoxamigos`;
  }, [cellarName]);

  async function loadWines(currentUserId?: string) {
    const uid = currentUserId || userId;
    if (!uid) return;

    const { data, error } = await supabase
      .from("wines")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      alert("Error cargando vinos");
      return;
    }

    setWines(data || []);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function saveCellarName() {
    const cleanName = cellarNameInput.trim() || "Mi cava";

    setSavingCellarName(true);

    const { error } = await supabase.auth.updateUser({
      data: { cellar_name: cleanName },
    });

    setSavingCellarName(false);

    if (error) {
      alert("No se pudo guardar el nombre de la cava.");
      return;
    }

    setCellarName(cleanName);
    setCellarNameInput(cleanName);
    setEditingCellarName(false);
  }

  function updateForm<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function saveWine() {
    if (!userId) return;

    if (!form.nombre.trim() || !form.bodega.trim()) {
      alert("Completá al menos nombre y bodega.");
      return;
    }

    setSaving(true);

    const payload = {
      user_id: userId,
      nombre: form.nombre,
      bodega: form.bodega,
      corte: form.corte,
      region: form.region,
      cosecha: form.cosecha,
      cantidad: Math.max(0, Number(form.cantidad) || 0),
      ubicacion: form.ubicacion,
      precio: form.precio,
      favorita: form.favorita,
      comentario: form.comentario,
      resena: form.resena,
      puntaje: form.puntaje,
      volver_comprar: form.volver_comprar,
    };

    let error = null;

    if (form.id) {
      const response = await supabase
        .from("wines")
        .update(payload)
        .eq("id", form.id)
        .eq("user_id", userId);

      error = response.error;
    } else {
      const response = await supabase.from("wines").insert([payload]);
      error = response.error;
    }

    setSaving(false);

    if (error) {
      alert("No se pudo guardar el vino.");
      return;
    }

    setForm(emptyForm);
    await loadWines();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editWine(wine: Wine) {
    setForm({
      id: wine.id,
      nombre: wine.nombre || "",
      bodega: wine.bodega || "",
      corte: wine.corte || "",
      region: wine.region || "",
      cosecha: wine.cosecha || "",
      cantidad: Number(wine.cantidad || 0),
      ubicacion: wine.ubicacion || "",
      precio: wine.precio || "",
      favorita: Boolean(wine.favorita),
      comentario: wine.comentario || "",
      resena: wine.resena || "",
      puntaje: wine.puntaje || "",
      volver_comprar: Boolean(wine.volver_comprar),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setForm(emptyForm);
  }

  async function deleteWine(id: string) {
    const ok = window.confirm("¿Querés borrar este vino?");
    if (!ok) return;

    const { error } = await supabase
      .from("wines")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      alert("No se pudo borrar el vino.");
      return;
    }

    await loadWines();
  }

  async function toggleFavorite(id: string, current: boolean | null) {
    const { error } = await supabase
      .from("wines")
      .update({ favorita: !current })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      alert("No se pudo actualizar favorita.");
      return;
    }

    await loadWines();
  }

  async function toggleRebuy(id: string, current: boolean | null) {
    const { error } = await supabase
      .from("wines")
      .update({ volver_comprar: !current })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      alert("No se pudo actualizar la opción de recompra.");
      return;
    }

    await loadWines();
  }

  async function openOneBottle(wine: Wine) {
    const nextQty = Math.max(0, Number(wine.cantidad || 0) - 1);

    const { error } = await supabase
      .from("wines")
      .update({ cantidad: nextQty })
      .eq("id", wine.id)
      .eq("user_id", userId);

    if (error) {
      alert("No se pudo descontar stock.");
      return;
    }

    await loadWines();
  }

  async function addOneBottle(wine: Wine) {
    const nextQty = Number(wine.cantidad || 0) + 1;

    const { error } = await supabase
      .from("wines")
      .update({ cantidad: nextQty })
      .eq("id", wine.id)
      .eq("user_id", userId);

    if (error) {
      alert("No se pudo sumar stock.");
      return;
    }

    await loadWines();
  }

  const bodegas = useMemo(() => {
    return [
      "Todas",
      ...Array.from(
        new Set(wines.map((w) => w.bodega).filter(Boolean) as string[])
      ).sort(),
    ];
  }, [wines]);

  const cortes = useMemo(() => {
    return [
      "Todos",
      ...Array.from(
        new Set(wines.map((w) => w.corte).filter(Boolean) as string[])
      ).sort(),
    ];
  }, [wines]);

  const regiones = useMemo(() => {
    return [
      "Todas",
      ...Array.from(
        new Set(wines.map((w) => w.region).filter(Boolean) as string[])
      ).sort(),
    ];
  }, [wines]);

  const cosechas = useMemo(() => {
    return [
      "Todas",
      ...Array.from(
        new Set(wines.map((w) => w.cosecha).filter(Boolean) as string[])
      ).sort((a, b) => Number(b) - Number(a)),
    ];
  }, [wines]);

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
      const matchesBodega =
        filterBodega === "Todas" || wine.bodega === filterBodega;
      const matchesCorte =
        filterCorte === "Todos" || wine.corte === filterCorte;
      const matchesRegion =
        filterRegion === "Todas" || wine.region === filterRegion;
      const matchesCosecha =
        filterCosecha === "Todas" || wine.cosecha === filterCosecha;
      const matchesFavorites = !onlyFavorites || Boolean(wine.favorita);
      const matchesRebuy = !onlyRebuy || Boolean(wine.volver_comprar);

      const qty = Number(wine.cantidad || 0);
      const matchesEstado =
        filterEstado === "Todos"
          ? true
          : filterEstado === "En cava"
          ? qty > 0
          : qty === 0;

      return (
        matchesSearch &&
        matchesBodega &&
        matchesCorte &&
        matchesRegion &&
        matchesCosecha &&
        matchesFavorites &&
        matchesRebuy &&
        matchesEstado
      );
    });
  }, [
    wines,
    search,
    filterBodega,
    filterCorte,
    filterRegion,
    filterCosecha,
    filterEstado,
    onlyFavorites,
    onlyRebuy,
  ]);

  const groupedWines = useMemo(() => {
    const map = new Map<string, GroupedWine>();

    for (const wine of filteredWines) {
      const key = [
        wine.nombre || "",
        wine.bodega || "",
        wine.corte || "",
        wine.region || "",
      ]
        .join("|||")
        .toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          key,
          nombre: wine.nombre || "Sin nombre",
          bodega: wine.bodega || "—",
          corte: wine.corte || "—",
          region: wine.region || "—",
          totalBotellas: 0,
          favoritas: 0,
          recompras: 0,
          recomendados: 0,
          mejorPuntaje: null,
          items: [],
        });
      }

      const group = map.get(key)!;
      group.items.push(wine);
      group.totalBotellas += Number(wine.cantidad || 0);
      if (wine.favorita) group.favoritas += 1;
      if (wine.volver_comprar) group.recompras += 1;

      const parsedScore = parseFloat(
        String(wine.puntaje || "").replace(",", ".")
      );

      if (!Number.isNaN(parsedScore)) {
        group.mejorPuntaje =
          group.mejorPuntaje === null
            ? parsedScore
            : Math.max(group.mejorPuntaje, parsedScore);

        if (parsedScore >= 8) {
          group.recomendados += 1;
        }
      }
    }

    const groups = Array.from(map.values());

    groups.forEach((group) => {
      group.items.sort(
        (a, b) => Number(b.cosecha || 0) - Number(a.cosecha || 0)
      );
    });

    groups.sort((a, b) => {
      switch (sortBy) {
        case "bodega":
          return a.bodega.localeCompare(b.bodega);
        case "cantidad":
          return b.totalBotellas - a.totalBotellas;
        case "puntaje":
          return (b.mejorPuntaje || 0) - (a.mejorPuntaje || 0);
        case "cosecha":
          return (
            Math.max(...a.items.map((i) => Number(i.cosecha || 0))) -
            Math.max(...b.items.map((i) => Number(i.cosecha || 0)))
          ) * -1;
        default:
          return a.nombre.localeCompare(b.nombre);
      }
    });

    return groups;
  }, [filteredWines, sortBy]);

  const totalBottles = wines.reduce(
    (acc, wine) => acc + Number(wine.cantidad || 0),
    0
  );
  const totalLabels = groupedWines.length;
  const totalBodegas = new Set(
    wines.map((wine) => wine.bodega).filter(Boolean)
  ).size;
  const totalRegiones = new Set(
    wines.map((wine) => wine.region).filter(Boolean)
  ).size;
  const totalFavorites = wines.filter((wine) => Boolean(wine.favorita)).length;
  const totalConsumed = wines.filter(
    (wine) => Number(wine.cantidad || 0) === 0
  ).length;
  const totalRebuy = wines.filter((wine) => Boolean(wine.volver_comprar)).length;
  const totalRecommended = wines.filter((wine) => {
    const score = parseFloat(String(wine.puntaje || "").replace(",", "."));
    return !Number.isNaN(score) && score >= 8;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#3b112c] text-white">
        Cargando...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#5C1242] via-[#3b112c] to-[#17070f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <header className="mb-8 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur md:p-7">
          <div className="flex min-w-0 items-start gap-4">
            <img
              src="/vinoxamigos.png"
              alt="Vinoxamigos"
              className="h-16 w-16 shrink-0 object-contain md:h-20 md:w-20"
            />

            <div className="min-w-0 flex-1">
              {editingCellarName ? (
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <input
                    value={cellarNameInput}
                    onChange={(e) => setCellarNameInput(e.target.value)}
                    className="w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-2xl font-bold text-[#3b112c] outline-none md:text-4xl"
                    placeholder="Nombre de tu cava"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveCellarName}
                      disabled={savingCellarName}
                      className="rounded-2xl bg-white px-4 py-3 font-semibold text-[#3b112c] disabled:opacity-60"
                    >
                      {savingCellarName ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      onClick={() => {
                        setCellarNameInput(cellarName);
                        setEditingCellarName(false);
                      }}
                      className="rounded-2xl border border-white/20 px-4 py-3 font-semibold text-white"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                    {cellarName}
                  </h1>
                  <button
                    onClick={() => setEditingCellarName(true)}
                    className="w-fit rounded-xl border border-white/20 px-3 py-1 text-sm font-medium text-white/90 hover:bg-white/10"
                  >
                    Editar nombre
                  </button>
                </div>
              )}

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80 md:text-base">
                Administrador de cava personal provisto por vinoxamigos.
              </p>

              <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-white/80">{userEmail}</p>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium underline underline-offset-4 hover:opacity-80"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <BigStatCard label="Botellas" value={String(totalBottles)} />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <SmallStatCard label="Etiquetas" value={String(totalLabels)} />
              <SmallStatCard label="Bodegas" value={String(totalBodegas)} />
              <SmallStatCard label="Regiones" value={String(totalRegiones)} />
              <SmallStatCard label="Favoritas" value={String(totalFavorites)} />
              <SmallStatCard label="Tomados" value={String(totalConsumed)} />
              <SmallStatCard label="Recomprar" value={String(totalRebuy)} />
            </div>
          </div>
        </header>

        <section className="mb-8 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur md:p-6">
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
              onChange={(v) => updateForm("nombre", v)}
              placeholder="Ej. DV Catena Malbec-Malbec"
            />
            <Field
              label="Bodega"
              value={form.bodega}
              onChange={(v) => updateForm("bodega", v)}
              placeholder="Ej. Catena Zapata"
            />
            <Field
              label="Corte / varietal"
              value={form.corte}
              onChange={(v) => updateForm("corte", v)}
              placeholder="Ej. Malbec, Blend, Pinot Noir"
            />
            <Field
              label="Región"
              value={form.region}
              onChange={(v) => updateForm("region", v)}
              placeholder="Ej. Valle de Uco"
            />
            <Field
              label="Cosecha"
              value={form.cosecha}
              onChange={(v) => updateForm("cosecha", v)}
              placeholder="Ej. 2020"
            />
            <Field
              label="Botellas actuales"
              type="number"
              value={String(form.cantidad)}
              onChange={(v) =>
                updateForm("cantidad", Math.max(0, Number(v) || 0))
              }
              placeholder="1"
            />
            <Field
              label="Ubicación"
              value={form.ubicacion}
              onChange={(v) => updateForm("ubicacion", v)}
              placeholder="Ej. Estante A, fila 2"
            />
            <Field
              label="Precio"
              value={form.precio}
              onChange={(v) => updateForm("precio", v)}
              placeholder="Ej. 25000"
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextAreaField
              label="Comentario"
              value={form.comentario}
              onChange={(v) => updateForm("comentario", v)}
              placeholder="Dato corto: compra, ocasión, guarda..."
            />
            <TextAreaField
              label="Reseña si se abrió"
              value={form.resena}
              onChange={(v) => updateForm("resena", v)}
              placeholder="Cómo estaba el vino, si rindió, si repetirías..."
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Puntaje"
              value={form.puntaje}
              onChange={(v) => updateForm("puntaje", v)}
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
                  checked={form.volver_comprar}
                  onChange={(e) =>
                    updateForm("volver_comprar", e.target.checked)
                  }
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
              disabled={saving}
              className="rounded-2xl bg-white px-5 py-3 text-base font-bold text-[#3b112c] shadow-xl transition hover:scale-[1.02] disabled:opacity-60"
            >
              {saving
                ? "Guardando..."
                : form.id
                ? "Guardar cambios"
                : "Guardar vino"}
            </button>
          </div>
        </section>

        <section className="mb-8 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur md:p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold">Explorar cava</h2>
            <p className="mt-1 text-sm text-white/70">
              Buscá, filtrá y ordená sin hacer scroll hasta Mendoza.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FilterField label="Buscar">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, bodega, reseña..."
                className="w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-black placeholder:text-gray-500"
              />
            </FilterField>

            <FilterField label="Bodega">
              <select
                value={filterBodega}
                onChange={(e) => setFilterBodega(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-black"
              >
                {bodegas.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Varietal / corte">
              <select
                value={filterCorte}
                onChange={(e) => setFilterCorte(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-black"
              >
                {cortes.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Región">
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-black"
              >
                {regiones.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Cosecha">
              <select
                value={filterCosecha}
                onChange={(e) => setFilterCosecha(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-black"
              >
                {cosechas.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Estado">
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-black"
              >
                <option>En cava</option>
                <option>Tomados</option>
                <option>Todos</option>
              </select>
            </FilterField>

            <FilterField label="Ordenar por">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-black"
              >
                <option value="nombre">Nombre</option>
                <option value="bodega">Bodega</option>
                <option value="cantidad">Cantidad</option>
                <option value="puntaje">Puntaje</option>
                <option value="cosecha">Cosecha</option>
              </select>
            </FilterField>

            <div className="flex flex-col justify-end gap-3">
              <label className="flex items-center gap-3 text-sm text-white/90">
                <input
                  type="checkbox"
                  checked={onlyFavorites}
                  onChange={(e) => setOnlyFavorites(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Solo favoritas
              </label>

              <label className="flex items-center gap-3 text-sm text-white/90">
                <input
                  type="checkbox"
                  checked={onlyRebuy}
                  onChange={(e) => setOnlyRebuy(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Solo volvería a comprar
              </label>
            </div>
          </div>
        </section>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Resumen de cava</h2>
          <p className="text-sm text-white/75">
            {groupedWines.length} ficha{groupedWines.length === 1 ? "" : "s"}
          </p>
        </div>

        {groupedWines.length === 0 ? (
          <EmptyState text="No hay vinos para mostrar con esos filtros." />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {groupedWines.map((group) => (
              <GroupedWineCard
                key={group.key}
                group={group}
                onEdit={editWine}
                onDelete={deleteWine}
                onToggleFavorite={toggleFavorite}
                onToggleRebuy={toggleRebuy}
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

function BigStatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[180px] flex-col justify-between rounded-[24px] border border-white/10 bg-white/12 p-5 sm:min-h-[210px]">
      <div className="text-xs uppercase tracking-[0.18em] text-white/70 sm:text-sm">
        {label}
      </div>
      <div className="text-6xl font-bold leading-none text-white sm:text-7xl">
        {value}
      </div>
    </div>
  );
}

function SmallStatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[96px] flex-col justify-between rounded-[20px] border border-white/10 bg-white/10 p-4 text-center sm:min-h-[104px]">
      <div className="text-[10px] uppercase tracking-[0.14em] text-white/70 sm:text-[11px]">
        {label}
      </div>
      <div className="text-2xl font-bold leading-none text-white sm:text-3xl">
        {value}
      </div>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/90">
        {label}
      </label>
      {children}
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
      <p className="text-base text-white/80">{text}</p>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  const display =
    value === null || value === undefined || String(value).trim() === ""
      ? "—"
      : String(value);

  return (
    <div className="rounded-2xl bg-gray-50 px-3 py-2">
      <span className="mr-1 font-semibold text-gray-900">{label}:</span>
      <span className="text-gray-700">{display}</span>
    </div>
  );
}

function GroupedWineCard({
  group,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleRebuy,
  onOpenOne,
  onAddOne,
}: {
  group: GroupedWine;
  onEdit: (wine: Wine) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean | null) => void;
  onToggleRebuy: (id: string, current: boolean | null) => void;
  onOpenOne: (wine: Wine) => void;
  onAddOne: (wine: Wine) => void;
}) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white p-5 text-black shadow-2xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[#3b112c]">{group.nombre}</h3>
          <p className="mt-1 text-sm text-gray-700">
            <span className="font-semibold">Bodega:</span> {group.bodega}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge text={group.corte} />
            <Badge text={group.region} />
            <Badge text={`${group.totalBotellas} botellas`} highlight />
            {group.mejorPuntaje !== null ? (
              <Badge text={`Puntaje máx. ${group.mejorPuntaje}`} />
            ) : null}
            {group.favoritas > 0 ? <Badge text="Tiene favoritas" amber /> : null}
            {group.recompras > 0 ? (
              <Badge text="Volvería a comprar" green />
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {group.items.map((wine) => {
          const noStock = Number(wine.cantidad || 0) === 0;

          return (
            <div
              key={wine.id}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
            >
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-semibold text-[#3b112c]">
                    {wine.cosecha || "Sin cosecha"}
                  </span>

                  {wine.favorita ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      ★ Favorita
                    </span>
                  ) : null}

                  {wine.volver_comprar ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      ✔ Recomprar
                    </span>
                  ) : null}

                  {noStock ? (
                    <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700">
                      Sin stock
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenOne(wine)}
                    className="rounded-2xl bg-[#5C1242] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#4b1036]"
                  >
                    Abrí una
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddOne(wine)}
                    className="rounded-2xl bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-200"
                  >
                    Sumar una
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleFavorite(wine.id, wine.favorita)}
                    className="rounded-2xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                  >
                    {wine.favorita ? "Quitar fav" : "Favorita"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onToggleRebuy(wine.id, wine.volver_comprar)
                    }
                    className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                  >
                    {wine.volver_comprar ? "No recompra" : "Recomprar"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit(wine)}
                    className="rounded-2xl bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(wine.id)}
                    className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                  >
                    Borrar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2 xl:grid-cols-4">
                <Info label="Botellas" value={wine.cantidad} />
                <Info label="Ubicación" value={wine.ubicacion} />
                <Info
                  label="Precio"
                  value={wine.precio ? `$${wine.precio}` : "—"}
                />
                <Info label="Puntaje" value={wine.puntaje} />
              </div>

              {wine.comentario?.trim() ? (
                <div className="mt-3 rounded-2xl bg-white px-4 py-3">
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
          );
        })}
      </div>
    </article>
  );
}

function Badge({
  text,
  highlight,
  amber,
  green,
}: {
  text: string;
  highlight?: boolean;
  amber?: boolean;
  green?: boolean;
}) {
  let classes =
    "rounded-full px-3 py-1 text-xs font-semibold border border-zinc-200 bg-white text-zinc-700";

  if (highlight) {
    classes =
      "rounded-full px-3 py-1 text-xs font-semibold bg-[#5C1242] text-white";
  }

  if (amber) {
    classes =
      "rounded-full px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700";
  }

  if (green) {
    classes =
      "rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700";
  }

  return <span className={classes}>{text}</span>;
}