'use client';

import React, { useState, useEffect } from 'react';
import { getCoffees, createCoffee, deleteCoffee } from '@/lib/services/coffeeService';
import { Coffee as CoffeeType } from '@/types/database.types';
import {
  Coffee,
  Plus,
  Trash2,
  X,
  RefreshCw,
  AlertTriangle,
  MapPin,
  Tag,
  Sprout,
  Home,
  Layers,
} from 'lucide-react';

export default function CoffeesPage() {
  const [coffees, setCoffees] = useState<CoffeeType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');
  const [roaster, setRoaster] = useState<string>('');
  const [farm, setFarm] = useState<string>('');
  const [variety, setVariety] = useState<string>('');
  const [roastLevel, setRoastLevel] = useState<string>('Medio');
  const [process, setProcess] = useState<string>('Lavado');
  const [tastingNotesInput, setTastingNotesInput] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchCoffees = async () => {
    try {
      const data = await getCoffees();
      setCoffees(data);
    } catch {
      setError('No se pudieron cargar los cafés. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCoffees();
  }, []);

  const handleCreateCoffee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const notes = tastingNotesInput
        .split(',')
        .map((note) => note.trim())
        .filter((note) => note.length > 0);

      const newCoffee = await createCoffee({
        name: name.trim(),
        origin: origin.trim() || null,
        roaster: roaster.trim() || null,
        farm: farm.trim() || null,
        variety: variety.trim() || null,
        roast_level: roastLevel || null,
        process: process || null,
        tasting_notes: notes,
      });

      if (newCoffee) {
        setCoffees((prev) => [newCoffee, ...prev]);
        resetForm();
        setIsModalOpen(false);
      } else {
        setError('Error al registrar el café. Verifique los datos.');
      }
    } catch {
      setError('Ocurrió un error inesperado al intentar guardar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoffee = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este café de su catálogo?')) return;

    setActionLoadingId(id);
    try {
      const success = await deleteCoffee(id);
      if (success) {
        setCoffees((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert('No se pudo eliminar el café en Supabase.');
      }
    } catch {
      alert('Error inesperado al eliminar el café.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const resetForm = () => {
    setName('');
    setOrigin('');
    setRoaster('');
    setFarm('');
    setVariety('');
    setRoastLevel('Medio');
    setProcess('Lavado');
    setTastingNotesInput('');
  };

  // Helper to color roast level badges
  const getRoastLevelBadgeClass = (level: string | null) => {
    const l = level?.toLowerCase() || '';
    if (l.includes('claro') || l.includes('ligero') || l.includes('light')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (l.includes('oscuro') || l.includes('fuerte') || l.includes('dark')) {
      return 'bg-amber-950 text-amber-200 border-amber-800';
    }
    return 'bg-amber-900/40 text-amber-200 border-amber-800/40';
  };

  // Helper to color process badges
  const getProcessBadgeClass = (proc: string | null) => {
    const p = proc?.toLowerCase() || '';
    if (p.includes('natural')) return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40';
    if (p.includes('honey')) return 'bg-orange-950/60 text-orange-300 border-orange-850/40';
    if (p.includes('experimental')) return 'bg-purple-950/60 text-purple-300 border-purple-800/40';
    return 'bg-blue-950/60 text-blue-300 border-blue-800/40'; // Lavado
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f7f5f3]">
            Cafés de Especialidad
          </h1>
          <p className="text-sm text-[#a69c97]">
            Administra tu catálogo de granos, orígenes, procesos e intensidades de tostado.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#d4a373] px-4 py-2.5 text-sm font-semibold text-[#14100e] shadow-md transition-all duration-200 hover:bg-[#c39262] hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Registrar Café
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-200">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-400" />
          <div className="flex-1">{error}</div>
          <button
            onClick={() => setError(null)}
            className="rounded p-1 hover:bg-red-900/30 text-red-400 hover:text-red-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main content listing */}
      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-[#d4a373]" />
          <p className="text-sm text-[#a69c97]">Cargando tus granos de café...</p>
        </div>
      ) : coffees.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-[#261f1c] bg-[#14100e]/50 p-8 text-center">
          <Coffee className="mx-auto h-12 w-12 text-[#5c5450]" />
          <h3 className="mt-4 text-lg font-semibold text-[#f7f5f3]">No hay cafés registrados</h3>
          <p className="mt-2 text-sm text-[#a69c97] max-w-sm mx-auto">
            Comienza agregando tu primer grano de café de especialidad para poder llevar un control
            de tus extracciones.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#261f1c] border border-[#3c302b] px-4 py-2 text-sm font-medium text-[#f7f5f3] hover:bg-[#342925] transition-all"
          >
            <Plus className="h-4 w-4 text-[#d4a373]" />
            Registrar Primer Café
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {coffees.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-xl border border-[#261f1c] bg-[#14100e] p-5 shadow-sm transition-all duration-200 hover:border-[#3d312c] hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-[#f7f5f3] leading-tight group-hover:text-[#d4a373] transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#a69c97]">
                      {item.origin && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#d4a373]" />
                          {item.origin}
                        </span>
                      )}
                      {item.origin && item.process && <span>•</span>}
                      {item.process && (
                        <span
                          className={`rounded border px-1.5 py-0.2 text-[10px] font-semibold tracking-wider uppercase ${getProcessBadgeClass(
                            item.process,
                          )}`}
                        >
                          {item.process}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.roast_level && (
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold select-none flex-shrink-0 ${getRoastLevelBadgeClass(
                        item.roast_level,
                      )}`}
                    >
                      {item.roast_level}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-[#261f1c] pt-3 text-xs text-[#a69c97]">
                  {item.farm && (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Home className="h-3.5 w-3.5 text-[#5c5450] flex-shrink-0" />
                      <span className="truncate">
                        <strong className="text-[#8e827b]">Finca:</strong> {item.farm}
                      </span>
                    </div>
                  )}
                  {item.variety && (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Sprout className="h-3.5 w-3.5 text-[#5c5450] flex-shrink-0" />
                      <span className="truncate">
                        <strong className="text-[#8e827b]">Var:</strong> {item.variety}
                      </span>
                    </div>
                  )}
                  {item.roaster && (
                    <div className="flex items-center gap-1.5 min-w-0 col-span-2">
                      <Layers className="h-3.5 w-3.5 text-[#5c5450] flex-shrink-0" />
                      <span className="truncate">
                        <strong className="text-[#8e827b]">Tostador:</strong> {item.roaster}
                      </span>
                    </div>
                  )}
                </div>

                {item.tasting_notes && item.tasting_notes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tasting_notes.map((note) => (
                      <span
                        key={note}
                        className="flex items-center gap-1 rounded bg-[#261f1c] border border-[#382d29] px-2 py-0.5 text-[11px] text-[#a69c97]"
                      >
                        <Tag className="h-2.5 w-2.5 text-[#d4a373]/70" />
                        {note}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-end border-t border-[#261f1c] pt-3">
                <button
                  disabled={actionLoadingId === item.id}
                  onClick={() => handleDeleteCoffee(item.id)}
                  className="rounded-lg p-1.5 text-[#a69c97] hover:bg-red-950/40 hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Eliminar café"
                >
                  {actionLoadingId === item.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-[#d4a373]" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Coffee */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-[#261f1c] bg-[#14100e] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#261f1c] pb-4">
              <h2 className="text-xl font-bold text-[#f7f5f3]">Registrar Nuevo Café</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-[#a69c97] hover:bg-[#261f1c] hover:text-[#f7f5f3]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoffee} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                  Nombre del Café *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sidra Natural, Geisha de Altura"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] px-3.5 py-2 text-sm text-[#f7f5f3] placeholder-[#5c5450] focus:border-[#d4a373] focus:outline-none focus:ring-1 focus:ring-[#d4a373]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                    Origen / Región
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Huila, Colombia"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] px-3.5 py-2 text-sm text-[#f7f5f3] placeholder-[#5c5450] focus:border-[#d4a373] focus:outline-none focus:ring-1 focus:ring-[#d4a373]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                    Finca
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. La Finca Las Flores"
                    value={farm}
                    onChange={(e) => setFarm(e.target.value)}
                    className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] px-3.5 py-2 text-sm text-[#f7f5f3] placeholder-[#5c5450] focus:border-[#d4a373] focus:outline-none focus:ring-1 focus:ring-[#d4a373]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                    Tostador
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Dingo Coffee"
                    value={roaster}
                    onChange={(e) => setRoaster(e.target.value)}
                    className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] px-3.5 py-2 text-sm text-[#f7f5f3] placeholder-[#5c5450] focus:border-[#d4a373] focus:outline-none focus:ring-1 focus:ring-[#d4a373]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                    Variedad de Planta
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Bourbon Rosado, Caturra"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] px-3.5 py-2 text-sm text-[#f7f5f3] placeholder-[#5c5450] focus:border-[#d4a373] focus:outline-none focus:ring-1 focus:ring-[#d4a373]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                    Nivel de Tostado
                  </label>
                  <select
                    value={roastLevel}
                    onChange={(e) => setRoastLevel(e.target.value)}
                    className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] px-3.5 py-2 text-sm text-[#f7f5f3] focus:border-[#d4a373] focus:outline-none focus:ring-1 focus:ring-[#d4a373]"
                  >
                    <option value="Claro">Claro / Light</option>
                    <option value="Medio">Medio / Medium</option>
                    <option value="Oscuro">Oscuro / Dark</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                    Proceso de Beneficio
                  </label>
                  <select
                    value={process}
                    onChange={(e) => setProcess(e.target.value)}
                    className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] px-3.5 py-2 text-sm text-[#f7f5f3] focus:border-[#d4a373] focus:outline-none focus:ring-1 focus:ring-[#d4a373]"
                  >
                    <option value="Lavado">Lavado / Washed</option>
                    <option value="Natural">Natural</option>
                    <option value="Honey">Honey</option>
                    <option value="Experimental">Experimental / Anaeróbico</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                  Notas de Cata (Separadas por comas)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Jazmín, Durazno, Chocolate, Cítrico"
                  value={tastingNotesInput}
                  onChange={(e) => setTastingNotesInput(e.target.value)}
                  className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] px-3.5 py-2 text-sm text-[#f7f5f3] placeholder-[#5c5450] focus:border-[#d4a373] focus:outline-none focus:ring-1 focus:ring-[#d4a373]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#261f1c] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-[#a69c97] hover:bg-[#261f1c] hover:text-[#f7f5f3] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-[#d4a373] px-5 py-2 text-sm font-semibold text-[#14100e] shadow-md hover:bg-[#c39262] transition-all disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="h-4 w-4 animate-spin text-[#14100e]" />}
                  {submitting ? 'Guardando...' : 'Guardar Café'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
