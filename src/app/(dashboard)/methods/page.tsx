'use client';

import React, { useState, useEffect } from 'react';
import { getMethods, createMethod, deleteMethod } from '@/lib/services/methodService';
import { Method as MethodType } from '@/types/database.types';
import { Flame, Plus, Trash2, X, RefreshCw, AlertTriangle } from 'lucide-react';

export default function MethodsPage() {
  const [methods, setMethods] = useState<MethodType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Goteo');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchMethods = async () => {
    try {
      const data = await getMethods();
      setMethods(data);
    } catch {
      setError('No se pudieron cargar los métodos de preparación.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMethods();
  }, []);

  const handleCreateMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const newMethod = await createMethod({
        name: name.trim(),
        description: description.trim() || null,
        category: category,
      });

      if (newMethod) {
        setMethods((prev) => [newMethod, ...prev]);
        resetForm();
        setIsModalOpen(false);
      } else {
        setError('Error al registrar el método. Verifique los datos.');
      }
    } catch {
      setError('Ocurrió un error inesperado al intentar guardar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMethod = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este método de preparación?')) return;

    setActionLoadingId(id);
    try {
      const success = await deleteMethod(id);
      if (success) {
        setMethods((prev) => prev.filter((m) => m.id !== id));
      } else {
        alert('No se pudo eliminar el método en Supabase.');
      }
    } catch {
      alert('Error inesperado al eliminar el método.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('Goteo');
  };

  // Helper to generate a 2-letter visual badge representing the method name
  const getMethodInitials = (nameStr: string) => {
    const clean = nameStr.trim();
    if (clean.toLowerCase().includes('v60')) return 'V6';
    if (clean.toLowerCase().includes('chemex')) return 'CH';
    if (clean.toLowerCase().includes('aeropress')) return 'AP';
    if (clean.toLowerCase().includes('prensa') || clean.toLowerCase().includes('french'))
      return 'PF';
    if (clean.toLowerCase().includes('espresso') || clean.toLowerCase().includes('espreso'))
      return 'ES';
    if (clean.toLowerCase().includes('moka') || clean.toLowerCase().includes('italiana'))
      return 'MK';

    const words = clean.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f7f5f3]">
            Métodos de Extracción
          </h1>
          <p className="text-sm text-[#a69c97]">
            Administra las cafeteras y metodologías de extracción que utilizas.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#d4a373] px-4 py-2.5 text-sm font-semibold text-[#14100e] shadow-md transition-all duration-200 hover:bg-[#c39262] hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Registrar Método
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
          <p className="text-sm text-[#a69c97]">Cargando tus métodos de extracción...</p>
        </div>
      ) : methods.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-[#261f1c] bg-[#14100e]/50 p-8 text-center">
          <Flame className="mx-auto h-12 w-12 text-[#5c5450]" />
          <h3 className="mt-4 text-lg font-semibold text-[#f7f5f3]">No hay métodos registrados</h3>
          <p className="mt-2 text-sm text-[#a69c97] max-w-sm mx-auto">
            Agrega tu primera cafetera o método de goteo (V60, Chemex, Aeropress, Espresso) para
            comenzar a registrar recetas.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#261f1c] border border-[#3c302b] px-4 py-2 text-sm font-medium text-[#f7f5f3] hover:bg-[#342925] transition-all"
          >
            <Plus className="h-4 w-4 text-[#d4a373]" />
            Registrar Primer Método
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {methods.map((item) => (
            <div
              key={item.id}
              className="group flex items-start gap-4 rounded-xl border border-[#261f1c] bg-[#14100e] p-5 shadow-sm transition-all duration-200 hover:border-[#3d312c] hover:shadow-md"
            >
              {/* Method visual badge */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#261f1c] border border-[#382d29] text-base font-bold text-[#d4a373] transition-colors group-hover:bg-[#d4a373] group-hover:text-[#14100e] duration-200">
                {getMethodInitials(item.name)}
              </div>

              {/* Method content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-[#f7f5f3] leading-tight truncate group-hover:text-[#d4a373] transition-colors">
                      {item.name}
                    </h3>
                    {item.category && (
                      <span className="inline-block rounded bg-[#261f1c] border border-[#3c302b] px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider text-[#d4a373]">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <button
                    disabled={actionLoadingId === item.id}
                    onClick={() => handleDeleteMethod(item.id)}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 rounded p-1 text-[#5c5450] hover:bg-red-950/40 hover:text-red-400 transition-all duration-200"
                    title="Eliminar método"
                  >
                    {actionLoadingId === item.id ? (
                      <RefreshCw className="h-3 w-3 animate-spin text-[#d4a373]" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-[#a69c97] line-clamp-3">
                  {item.description || 'Sin descripción o categoría configurada.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Method */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-[#261f1c] bg-[#14100e] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#261f1c] pb-4">
              <h2 className="text-xl font-bold text-[#f7f5f3]">Registrar Nuevo Método</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-[#a69c97] hover:bg-[#261f1c] hover:text-[#f7f5f3]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMethod} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                  Nombre del Método *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Hario V60, Aeropress, Espresso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] px-3.5 py-2 text-sm text-[#f7f5f3] placeholder-[#5c5450] focus:border-[#d4a373] focus:outline-none focus:ring-1 focus:ring-[#d4a373]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                  Categoría / Tipo
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] px-3.5 py-2 text-sm text-[#f7f5f3] focus:border-[#d4a373] focus:outline-none focus:ring-1 focus:ring-[#d4a373]"
                >
                  <option value="Goteo">Goteo / Pour Over</option>
                  <option value="Inmersión">Inmersión / Immersion</option>
                  <option value="Presión">Presión / Pressure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                  Descripción
                </label>
                <textarea
                  placeholder="Ej. Extracción por goteo cónico. Ideal para resaltar acidez y notas frutales del café."
                  value={description}
                  rows={3}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] px-3.5 py-2 text-sm text-[#f7f5f3] placeholder-[#5c5450] focus:border-[#d4a373] focus:outline-none focus:ring-1 focus:ring-[#d4a373] resize-none"
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
                  {submitting ? 'Guardando...' : 'Guardar Método'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
