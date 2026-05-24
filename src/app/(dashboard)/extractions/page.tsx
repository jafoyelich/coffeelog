'use client';

import React, { useState, useEffect } from 'react';
import {
  getExtractions,
  createExtraction,
  deleteExtraction,
} from '@/lib/services/extractionService';
import { getCoffees } from '@/lib/services/coffeeService';
import { getMethods } from '@/lib/services/methodService';
import {
  Coffee as CoffeeType,
  Method as MethodType,
  PourStep,
  PopulatedExtraction,
} from '@/types/database.types';
import {
  ClipboardList,
  Plus,
  Trash2,
  X,
  RefreshCw,
  AlertTriangle,
  Flame,
  Coffee,
  Star,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';

interface PourFormStep {
  step: number;
  time_str: string;
  weight_g: string;
  phase: string;
}

// Time Helpers
const timeStringToSeconds = (timeStr: string): number => {
  const clean = timeStr.trim();
  if (!clean) return 0;

  if (clean.includes(':')) {
    const parts = clean.split(':');
    const minutes = Number(parts[0]) || 0;
    const seconds = Number(parts[1]) || 0;
    return minutes * 60 + seconds;
  }

  // Raw number string interpreted as seconds
  return Number(clean) || 0;
};

const secondsToTimeString = (totalSeconds: number | null): string => {
  if (totalSeconds === null || totalSeconds === undefined) return '';
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = Math.round(totalSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export default function ExtractionsPage() {
  const [extractions, setExtractions] = useState<PopulatedExtraction[]>([]);
  const [coffees, setCoffees] = useState<CoffeeType[]>([]);
  const [methods, setMethods] = useState<MethodType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [coffeeId, setCoffeeId] = useState<string>('');
  const [methodId, setMethodId] = useState<string>('');
  const [grindSize, setGrindSize] = useState<string>('');
  const [waterTempC, setWaterTempC] = useState<string>('');
  const [coffeeWeightG, setCoffeeWeightG] = useState<string>('');
  const [waterWeightG, setWaterWeightG] = useState<string>('');
  const [extractionTimeStr, setExtractionTimeStr] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');

  // Pours Form State (handling strings for MM:SS inputs)
  const [pours, setPours] = useState<PourFormStep[]>([
    { step: 1, time_str: '00:30', weight_g: '50', phase: 'Preinfusión' },
  ]);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [expandedExtractionId, setExpandedExtractionId] = useState<string | null>(null);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [exts, cofs, meths] = await Promise.all([getExtractions(), getCoffees(), getMethods()]);
      setExtractions(exts);
      setCoffees(cofs);
      setMethods(meths);

      // Pre-select defaults if items exist
      if (cofs.length > 0) setCoffeeId(cofs[0].id);
      if (meths.length > 0) setMethodId(meths[0].id);
    } catch {
      setError('Ocurrió un error al cargar los datos del panel. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInitialData();
  }, []);

  const handleAddPour = () => {
    setPours((prev) => {
      const lastPour = prev[prev.length - 1];
      let nextTimeStr = '00:30';
      let nextWeightG = '50';
      if (lastPour) {
        const lastSecs = timeStringToSeconds(lastPour.time_str);
        nextTimeStr = secondsToTimeString(lastSecs + 30);
        nextWeightG = String(Number(lastPour.weight_g) + 50);
      }
      return [
        ...prev,
        {
          step: prev.length + 1,
          time_str: nextTimeStr,
          weight_g: nextWeightG,
          phase: 'Extracción',
        },
      ];
    });
  };

  const handleRemovePour = (index: number) => {
    if (pours.length === 1) return;
    setPours((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      // Re-index steps
      return filtered.map((pour, i) => ({ ...pour, step: i + 1 }));
    });
  };

  const handlePourChange = (index: number, key: keyof PourFormStep, value: string) => {
    setPours((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [key]: value,
      };
      return updated;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coffeeId || !methodId || !coffeeWeightG || !waterWeightG) {
      alert('Por favor complete todos los campos obligatorios (*).');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // Convert pours MM:SS format to seconds
      const formattedPours: PourStep[] = pours.map((pour) => ({
        step: pour.step,
        time_s: timeStringToSeconds(pour.time_str),
        weight_g: Number(pour.weight_g) || 0,
        phase: pour.phase,
      }));

      // Convert total extraction time MM:SS format to seconds
      const totalTimeSecs = extractionTimeStr ? timeStringToSeconds(extractionTimeStr) : null;

      const newExt = await createExtraction({
        coffee_id: coffeeId,
        method_id: methodId,
        grind_setting: grindSize.trim() || null,
        temperature_c: waterTempC ? Number(waterTempC) : null,
        coffee_weight_g: Number(coffeeWeightG),
        water_weight_g: Number(waterWeightG),
        extraction_time_s: totalTimeSecs,
        rating: rating,
        tasting_notes: notes.trim() || null,
        pours: formattedPours,
      });

      if (newExt) {
        setExtractions((prev) => [newExt, ...prev]);
        resetForm();
        setIsModalOpen(false);
      } else {
        setError('No se pudo registrar la extracción. Verifique la conexión.');
      }
    } catch {
      setError('Ocurrió un error inesperado al registrar la extracción.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta extracción permanentemente?')) return;

    setActionLoadingId(id);
    try {
      const success = await deleteExtraction(id);
      if (success) {
        setExtractions((prev) => prev.filter((e) => e.id !== id));
      } else {
        alert('No se pudo eliminar la extracción en Supabase.');
      }
    } catch {
      alert('Error inesperado al intentar eliminar.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const resetForm = () => {
    setCoffeeId(coffees.length > 0 ? coffees[0].id : '');
    setMethodId(methods.length > 0 ? methods[0].id : '');
    setGrindSize('');
    setWaterTempC('');
    setCoffeeWeightG('');
    setWaterWeightG('');
    setExtractionTimeStr('');
    setRating(5);
    setNotes('');
    setPours([{ step: 1, time_str: '00:30', weight_g: '50', phase: 'Preinfusión' }]);
  };

  const toggleExpand = (id: string) => {
    setExpandedExtractionId((prev) => (prev === id ? null : id));
  };

  // Helper to calculate extraction ratio (e.g. 1:15)
  const getRatio = (coffeeG: number, waterG: number) => {
    if (!coffeeG || !waterG) return '1:0';
    const ratio = waterG / coffeeG;
    return `1:${Math.round(ratio * 10) / 10}`;
  };

  // Helper to render stars
  const renderStars = (score: number | null) => {
    if (score === null) return null;
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        <Star className="h-4 w-4 fill-amber-400" />
        <span className="text-sm font-semibold text-[#f7f5f3] ml-1">{score}/10</span>
      </div>
    );
  };

  // Format timestamp nicely
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f7f5f3]">
            Registro de Extracciones
          </h1>
          <p className="text-sm text-[#a69c97]">
            Bitácora de preparaciones. Modifica variables, experimenta con vertidos y evalúa tus
            resultados.
          </p>
        </div>
        <button
          disabled={coffees.length === 0 || methods.length === 0}
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#d4a373] px-4 py-2.5 text-sm font-semibold text-[#14100e] shadow-md transition-all duration-200 hover:bg-[#c39262] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          title={
            coffees.length === 0 || methods.length === 0
              ? 'Debes tener al menos un café y un método registrado para crear una extracción.'
              : ''
          }
        >
          <Plus className="h-4 w-4" />
          Nueva Extracción
        </button>
      </div>

      {/* Warning if Catalogs are empty */}
      {(coffees.length === 0 || methods.length === 0) && !loading && (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-900/50 bg-amber-950/20 p-5 text-sm text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <strong className="font-semibold">Faltan Requisitos en tu Bitácora</strong>
          </div>
          <p className="text-xs text-amber-300">
            Para registrar una extracción, necesitas registrar al menos un café en tu catálogo y una
            cafetera/método.
          </p>
        </div>
      )}

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

      {/* Main Listing & Progress */}
      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-[#d4a373]" />
          <p className="text-sm text-[#a69c97]">Cargando bitácora de extracciones...</p>
        </div>
      ) : extractions.length === 0 ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-[#261f1c] bg-[#14100e]/50 p-8 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-[#5c5450]" />
          <h3 className="mt-4 text-lg font-semibold text-[#f7f5f3]">
            No hay extracciones registradas
          </h3>
          <p className="mt-2 text-sm text-[#a69c97] max-w-sm mx-auto">
            Registra tu primera extracción. Modifica ratios, temperaturas y vertidos para
            perfeccionar tu receta.
          </p>
          <button
            disabled={coffees.length === 0 || methods.length === 0}
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#261f1c] border border-[#3c302b] px-4 py-2 text-sm font-medium text-[#f7f5f3] hover:bg-[#342925] transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4 text-[#d4a373]" />
            Registrar Primera Extracción
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#f7f5f3]">Historial de Preparaciones</h2>
          <div className="grid gap-4">
            {extractions.map((item) => {
              const isExpanded = expandedExtractionId === item.id;
              const ratioStr = getRatio(item.coffee_weight_g, item.water_weight_g);

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#261f1c] bg-[#14100e] overflow-hidden shadow-sm transition-all duration-200 hover:border-[#382c28]"
                >
                  {/* Card Header Brief */}
                  <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#261f1c] border border-[#3c302b]">
                        <Coffee className="h-5 w-5 text-[#d4a373]" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-base text-[#f7f5f3]">
                            {item.coffees?.name || 'Café Desconocido'}
                          </h3>
                          <span className="inline-flex items-center gap-1 rounded bg-[#261f1c] border border-[#3c302b] px-2 py-0.5 text-xs text-[#a69c97]">
                            <Flame className="h-3 w-3 text-[#d4a373]/70" />
                            {item.methods?.name || 'Método Desconocido'}
                          </span>
                        </div>
                        <p className="text-xs text-[#a69c97]">{formatDate(item.created_at)}</p>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 border-t border-[#261f1c] pt-3 md:flex md:items-center md:gap-8 md:border-0 md:pt-0">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-[#5c5450] font-semibold">
                          Ratio
                        </span>
                        <span className="text-sm font-semibold text-[#d4a373]">{ratioStr}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-[#5c5450] font-semibold">
                          Dosis
                        </span>
                        <span className="text-sm font-semibold text-[#f7f5f3]">
                          {item.coffee_weight_g}g
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-[#5c5450] font-semibold">
                          Temp
                        </span>
                        <span className="text-sm font-semibold text-[#f7f5f3]">
                          {item.temperature_c ? `${item.temperature_c}°C` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-[#5c5450] font-semibold">
                          Calificación
                        </span>
                        <span>{renderStars(item.rating)}</span>
                      </div>
                    </div>

                    {/* Expand/Collapse Action Buttons */}
                    <div className="flex items-center justify-end gap-3 border-t border-[#261f1c] pt-3 md:border-0 md:pt-0">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-[#261f1c] hover:border-[#3d302b] hover:bg-[#261f1c]/50 px-3 py-1.5 text-xs text-[#a69c97] hover:text-[#f7f5f3] transition-all"
                      >
                        {isExpanded ? (
                          <>
                            Ocultar Detalles
                            <ChevronUp className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Ver Detalles
                            <ChevronDown className="h-4 w-4" />
                          </>
                        )}
                      </button>
                      <button
                        disabled={actionLoadingId === item.id}
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg p-1.5 text-[#5c5450] hover:bg-red-950/40 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Eliminar registro"
                      >
                        {actionLoadingId === item.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin text-[#d4a373]" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Relational Details panel */}
                  {isExpanded && (
                    <div className="border-t border-[#261f1c] bg-[#0d0b0a]/40 p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="grid gap-4 md:grid-cols-3">
                        {/* Variables list */}
                        <div className="space-y-3 rounded-lg border border-[#261f1c]/80 bg-[#14100e]/80 p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4a373]">
                            Variables de Extracción
                          </h4>
                          <ul className="space-y-2 text-xs text-[#a69c97]">
                            <li className="flex justify-between border-b border-[#261f1c] pb-1.5">
                              <span>Molienda:</span>
                              <span className="font-medium text-[#f7f5f3]">
                                {item.grind_setting || 'No especificada'}
                              </span>
                            </li>
                            <li className="flex justify-between border-b border-[#261f1c] pb-1.5">
                              <span>Peso de Agua:</span>
                              <span className="font-medium text-[#f7f5f3]">
                                {item.water_weight_g}g
                              </span>
                            </li>
                            <li className="flex justify-between border-b border-[#261f1c] pb-1.5">
                              <span>Tiempo total:</span>
                              <span className="font-medium text-[#f7f5f3]">
                                {item.extraction_time_s
                                  ? secondsToTimeString(item.extraction_time_s)
                                  : 'N/A'}
                              </span>
                            </li>
                            <li className="flex justify-between">
                              <span>Tueste de grano:</span>
                              <span className="font-medium text-[#f7f5f3]">
                                {item.coffees?.roast_level || 'N/A'}
                              </span>
                            </li>
                          </ul>
                        </div>

                        {/* Additional Notes */}
                        <div className="md:col-span-2 space-y-2 rounded-lg border border-[#261f1c]/80 bg-[#14100e]/80 p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4a373]">
                            Notas del Barista
                          </h4>
                          <p className="text-sm text-[#a69c97] italic leading-relaxed">
                            {item.tasting_notes ||
                              '"Sin anotaciones adicionales sobre el perfil de taza o molienda."'}
                          </p>
                        </div>
                      </div>

                      {/* Pours Timeline flow */}
                      {item.pours && item.pours.length > 0 && (
                        <div className="space-y-3 rounded-lg border border-[#261f1c]/80 bg-[#14100e]/80 p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#d4a373]">
                            Esquema de Vertidos (Pours Timeline)
                          </h4>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 overflow-x-auto py-2">
                            {item.pours.map((pour: PourStep, index: number) => (
                              <div
                                key={pour.step}
                                className="flex items-center gap-4 flex-shrink-0"
                              >
                                <div className="relative flex flex-col items-center rounded-lg bg-[#261f1c]/80 border border-[#3c302b] p-3 text-center min-w-[120px]">
                                  <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#d4a373] text-[10px] font-bold text-[#14100e]">
                                    {pour.step}
                                  </span>
                                  <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider">
                                    {pour.phase}
                                  </span>
                                  <span className="text-sm font-bold text-[#f7f5f3] mt-1">
                                    {pour.weight_g}g
                                  </span>
                                  <span className="text-[10px] text-[#a69c97]">
                                    {secondsToTimeString(pour.time_s)}
                                  </span>
                                </div>
                                {index < item.pours.length - 1 && (
                                  <span className="hidden sm:block text-[#5c5450] font-bold">
                                    ➔
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Add Extraction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-[#261f1c] bg-[#14100e] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#261f1c] pb-4">
              <h2 className="text-xl font-bold text-[#f7f5f3]">Registrar Nueva Extracción</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-[#a69c97] hover:bg-[#261f1c] hover:text-[#f7f5f3]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-5">
              {/* Selectors grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                    Grano de Café *
                  </label>
                  <select
                    value={coffeeId}
                    required
                    onChange={(e) => setCoffeeId(e.target.value)}
                    className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] px-3.5 py-2 text-sm text-[#f7f5f3] focus:border-[#d4a373] focus:outline-none"
                  >
                    {coffees.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.origin ? `(${c.origin})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                    Método / Cafetera *
                  </label>
                  <select
                    value={methodId}
                    required
                    onChange={(e) => setMethodId(e.target.value)}
                    className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] px-3.5 py-2 text-sm text-[#f7f5f3] focus:border-[#d4a373] focus:outline-none"
                  >
                    {methods.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.category ? `(${m.category})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Numbers grid */}
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                    Café Seco *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      step="0.1"
                      placeholder="15.0"
                      value={coffeeWeightG}
                      onChange={(e) => setCoffeeWeightG(e.target.value)}
                      className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] pl-3.5 pr-8 py-2 text-sm text-[#f7f5f3] placeholder-[#5c5450] focus:border-[#d4a373] focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-[#5c5450] font-bold">
                      g
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                    Agua Total *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      step="1"
                      placeholder="250"
                      value={waterWeightG}
                      onChange={(e) => setWaterWeightG(e.target.value)}
                      className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] pl-3.5 pr-8 py-2 text-sm text-[#f7f5f3] placeholder-[#5c5450] focus:border-[#d4a373] focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-[#5c5450] font-bold">
                      g
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                    Temp. Agua
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="93"
                      value={waterTempC}
                      onChange={(e) => setWaterTempC(e.target.value)}
                      className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] pl-3.5 pr-8 py-2 text-sm text-[#f7f5f3] placeholder-[#5c5450] focus:border-[#d4a373] focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-[#5c5450] font-bold">
                      °C
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                    Tiempo Ext. (MM:SS)
                  </label>
                  <input
                    type="text"
                    placeholder="02:30"
                    value={extractionTimeStr}
                    onChange={(e) => setExtractionTimeStr(e.target.value)}
                    className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] px-3.5 py-2 text-sm text-[#f7f5f3] placeholder-[#5c5450] focus:border-[#d4a373] focus:outline-none"
                  />
                </div>
              </div>

              {/* Text settings grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                    Molienda / Ajuste
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 14 clics C40, Fino Comandante"
                    value={grindSize}
                    onChange={(e) => setGrindSize(e.target.value)}
                    className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] px-3.5 py-2 text-sm text-[#f7f5f3] placeholder-[#5c5450] focus:border-[#d4a373] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                    Calificación taza (1 al 10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full accent-[#d4a373] bg-[#261f1c] rounded-lg h-2 mt-3 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#5c5450] font-bold px-1 mt-1">
                    <span>1 (Malo)</span>
                    <span className="text-[#d4a373] text-xs">Actual: {rating}/10</span>
                    <span>10 (Perfecto)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Pours list section */}
              <div className="rounded-lg border border-[#261f1c] bg-[#0d0b0a]/30 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#261f1c] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4a373]">
                    Pasos de Vertido / Receta (Pours)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddPour}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#d4a373] hover:text-[#c39262] transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Añadir Vertido
                  </button>
                </div>

                <div className="space-y-3">
                  {pours.map((pour, index) => (
                    <div
                      key={pour.step}
                      className="grid gap-2 grid-cols-12 items-center rounded-lg bg-[#14100e] border border-[#261f1c] p-2.5 text-xs"
                    >
                      <span className="col-span-1 text-center font-bold text-[#5c5450]">
                        #{pour.step}
                      </span>
                      <div className="col-span-4">
                        <input
                          type="text"
                          required
                          placeholder="00:30 (MM:SS)"
                          value={pour.time_str}
                          onChange={(e) => handlePourChange(index, 'time_str', e.target.value)}
                          className="w-full rounded bg-[#0d0b0a] border border-[#261f1c] py-1 px-2 focus:outline-none focus:border-[#d4a373]"
                        />
                      </div>
                      <div className="col-span-4 relative">
                        <input
                          type="number"
                          required
                          placeholder="Gramos"
                          value={pour.weight_g}
                          onChange={(e) => handlePourChange(index, 'weight_g', e.target.value)}
                          className="w-full rounded bg-[#0d0b0a] border border-[#261f1c] py-1 pl-2 pr-6 focus:outline-none focus:border-[#d4a373]"
                        />
                        <span className="absolute right-2 top-1.5 text-[9px] text-[#5c5450] font-bold">
                          g
                        </span>
                      </div>
                      <select
                        value={pour.phase}
                        onChange={(e) => handlePourChange(index, 'phase', e.target.value)}
                        className="col-span-2 rounded bg-[#0d0b0a] border border-[#261f1c] py-1 px-1 focus:outline-none focus:border-[#d4a373] text-[10px]"
                      >
                        <option value="Preinfusión">Preinf.</option>
                        <option value="Extracción">Extr.</option>
                        <option value="Final">Final</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemovePour(index)}
                        disabled={pours.length === 1}
                        className="col-span-1 flex justify-center text-[#5c5450] hover:text-red-400 transition-colors disabled:opacity-30"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#a69c97] uppercase tracking-wider mb-1.5">
                  Notas Adicionales (Perfil de taza, defectos, descriptores)
                </label>
                <textarea
                  placeholder="Ej. Taza limpia y muy dulce. Acidez media-alta tipo durazno. Cuerpo ligero sedoso."
                  value={notes}
                  rows={3}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-[#261f1c] bg-[#0d0b0a] px-3.5 py-2 text-sm text-[#f7f5f3] placeholder-[#5c5450] focus:border-[#d4a373] focus:outline-none resize-none"
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
                  {submitting ? 'Guardando...' : 'Guardar Extracción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
