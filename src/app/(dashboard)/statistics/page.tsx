'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getExtractions } from '@/lib/services/extractionService';
import { PopulatedExtraction } from '@/types/database.types';
import {
  BarChart2,
  RefreshCw,
  AlertTriangle,
  Flame,
  Coffee,
  Star,
  Activity,
  Award,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

type ChartMetric = 'count' | 'rating';

export default function StatisticsPage() {
  const [extractions, setExtractions] = useState<PopulatedExtraction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<ChartMetric>('count');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExtractions();
      setExtractions(data);
    } catch {
      setError('Ocurrió un error al cargar el historial de extracciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. KPI: Total de Extracciones
  const totalExtractions = extractions.length;

  // 2. KPI: Método más usado
  const methodStats = useMemo(() => {
    const map: Record<string, { count: number; sumRating: number; name: string }> = {};

    extractions.forEach((ext) => {
      const methodName = ext.methods?.name || 'Otro / Desconocido';
      if (!map[methodName]) {
        map[methodName] = { count: 0, sumRating: 0, name: methodName };
      }
      map[methodName].count += 1;
      if (ext.rating !== null && ext.rating !== undefined) {
        map[methodName].sumRating += ext.rating;
      }
    });

    return Object.values(map).map((item) => ({
      name: item.name,
      count: item.count,
      averageRating: Math.round((item.sumRating / item.count) * 10) / 10 || 0,
    }));
  }, [extractions]);

  const mostUsedMethod = useMemo(() => {
    if (methodStats.length === 0) return null;
    return [...methodStats].sort((a, b) => b.count - a.count)[0];
  }, [methodStats]);

  // 3. KPI: Café más usado
  const coffeeStats = useMemo(() => {
    const map: Record<string, { count: number; name: string }> = {};

    extractions.forEach((ext) => {
      const coffeeName = ext.coffees?.name || 'Otro / Desconocido';
      if (!map[coffeeName]) {
        map[coffeeName] = { count: 0, name: coffeeName };
      }
      map[coffeeName].count += 1;
    });

    return Object.values(map);
  }, [extractions]);

  const mostUsedCoffee = useMemo(() => {
    if (coffeeStats.length === 0) return null;
    return [...coffeeStats].sort((a, b) => b.count - a.count)[0];
  }, [coffeeStats]);

  // 4. KPI: Mejor extracción
  const bestExtraction = useMemo(() => {
    if (extractions.length === 0) return null;
    
    // Sort by rating desc, then by date desc
    const sorted = [...extractions].sort((a, b) => {
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;
      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    return sorted[0];
  }, [extractions]);

  // Custom tooltips styling for Recharts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-[#261f1c] bg-[#14100e] p-3 shadow-xl text-xs">
          <p className="font-bold text-[#f7f5f3] mb-1.5">{data.name}</p>
          <div className="space-y-1">
            <p className="text-[#a69c97] flex justify-between gap-4">
              <span>Extracciones:</span>
              <span className="font-semibold text-[#d4a373]">{data.count}</span>
            </p>
            <p className="text-[#a69c97] flex justify-between gap-4">
              <span>Calificación Promedio:</span>
              <span className="font-semibold text-[#c39262]">{data.averageRating}/10</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Curated color palette for Recharts bars
  const colors = ['#d4a373', '#c39262', '#b38252', '#a27242', '#916232', '#805222'];

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-[#d4a373]" />
        <p className="text-sm text-[#a69c97]">Calculando estadísticas de barismo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-900/50 bg-red-950/40 p-4 text-sm text-red-200">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-400" />
        <div className="flex-1">{error}</div>
        <button
          onClick={loadData}
          className="rounded bg-[#261f1c] border border-[#3c302b] px-3 py-1.5 text-xs text-[#f7f5f3] hover:bg-[#342925] transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (totalExtractions === 0) {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center rounded-xl border border-dashed border-[#261f1c] bg-[#14100e]/50 p-8 text-center max-w-2xl mx-auto my-6">
        <BarChart2 className="h-16 w-16 text-[#5c5450] mb-4 animate-pulse" />
        <h3 className="text-xl font-semibold text-[#f7f5f3]">Dashboard sin Datos de Rendimiento</h3>
        <p className="mt-2 text-sm text-[#a69c97] max-w-sm mx-auto leading-relaxed">
          Las métricas se calculan a partir de tus preparaciones de café registradas. Comienza a registrar extracciones para ver tus estadísticas y gráficos aquí.
        </p>
        <a
          href="/extractions"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#d4a373] px-5 py-2.5 text-sm font-semibold text-[#14100e] hover:bg-[#c39262] transition-all shadow-md"
        >
          <Activity className="h-4 w-4" />
          Registrar Primera Extracción
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#f7f5f3]">Dashboard Analítico</h1>
        <p className="text-sm text-[#a69c97]">
          Análisis del rendimiento de tus preparaciones. Identifica preferencias, extrae variables óptimas y perfecciona tu consistencia.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Total Extractions */}
        <div className="rounded-xl border border-[#261f1c] bg-[#14100e] p-5 shadow-sm space-y-4 hover:border-[#382c28] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5c5450]">
              Total Preparado
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#261f1c] border border-[#3c302b]">
              <Layers className="h-4 w-4 text-[#d4a373]" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-bold text-[#f7f5f3] tracking-tight">
              {totalExtractions}
            </span>
            <p className="text-[10px] text-[#a69c97]">Extracciones en tu bitácora</p>
          </div>
        </div>

        {/* KPI 2: Most Used Method */}
        <div className="rounded-xl border border-[#261f1c] bg-[#14100e] p-5 shadow-sm space-y-4 hover:border-[#382c28] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5c5450]">
              Método Preferido
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#261f1c] border border-[#3c302b]">
              <Flame className="h-4 w-4 text-[#d4a373]" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-lg font-bold text-[#f7f5f3] truncate block tracking-tight">
              {mostUsedMethod?.name || 'N/A'}
            </span>
            <p className="text-[10px] text-[#a69c97]">
              {mostUsedMethod ? `Usado ${mostUsedMethod.count} veces` : 'Sin registros de métodos'}
            </p>
          </div>
        </div>

        {/* KPI 3: Most Used Coffee */}
        <div className="rounded-xl border border-[#261f1c] bg-[#14100e] p-5 shadow-sm space-y-4 hover:border-[#382c28] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5c5450]">
              Grano Favorito
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#261f1c] border border-[#3c302b]">
              <Coffee className="h-4 w-4 text-[#d4a373]" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-lg font-bold text-[#f7f5f3] truncate block tracking-tight">
              {mostUsedCoffee?.name || 'N/A'}
            </span>
            <p className="text-[10px] text-[#a69c97]">
              {mostUsedCoffee ? `Usado ${mostUsedCoffee.count} veces` : 'Sin registros de granos'}
            </p>
          </div>
        </div>

        {/* KPI 4: Best Extraction */}
        <div className="rounded-xl border border-[#261f1c] bg-[#14100e] p-5 shadow-sm space-y-4 hover:border-[#382c28] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5c5450]">
              Mejor Taza (Tops)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#261f1c] border border-[#3c302b]">
              <Award className="h-4 w-4 text-[#d4a373]" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-[#f7f5f3] tracking-tight">
                {bestExtraction?.rating !== null && bestExtraction?.rating !== undefined
                  ? `${bestExtraction.rating}/10`
                  : 'N/A'}
              </span>
              <span className="text-[10px] text-[#c39262] font-semibold flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-amber-400/20 text-[#d4a373]" />
                Puntaje máx.
              </span>
            </div>
            <p className="text-[10px] text-[#a69c97] truncate block">
              {bestExtraction
                ? `${bestExtraction.coffees?.name || 'Desconocido'} con ${bestExtraction.methods?.name || 'Desconocido'}`
                : 'Sin registros válidos'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Block */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recharts Column Chart panel */}
        <div className="lg:col-span-2 rounded-xl border border-[#261f1c] bg-[#14100e] p-5 shadow-sm space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-base text-[#f7f5f3]">Análisis Comparativo por Método</h3>
              <p className="text-xs text-[#a69c97]">
                Visualiza el volumen o la calidad media que logras con cada tipo de cafetera.
              </p>
            </div>
            {/* Metric Toggle Tabs */}
            <div className="flex p-0.5 rounded-lg bg-[#0d0b0a] border border-[#261f1c] self-start sm:self-auto">
              <button
                onClick={() => setChartMetric('count')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                  chartMetric === 'count'
                    ? 'bg-[#d4a373] text-[#14100e] shadow-sm'
                    : 'text-[#a69c97] hover:text-[#f7f5f3]'
                }`}
              >
                Volumen
              </button>
              <button
                onClick={() => setChartMetric('rating')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                  chartMetric === 'rating'
                    ? 'bg-[#d4a373] text-[#14100e] shadow-sm'
                    : 'text-[#a69c97] hover:text-[#f7f5f3]'
                }`}
              >
                Prom. Taza
              </button>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-[280px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={methodStats}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid stroke="#261f1c" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#5c5450"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  fontFamily="inherit"
                />
                <YAxis
                  stroke="#5c5450"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                  domain={[0, chartMetric === 'count' ? 'auto' : 10]}
                  allowDecimals={chartMetric === 'count' ? false : true}
                  fontFamily="inherit"
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#261f1c', opacity: 0.3 }} />
                <Bar
                  dataKey={chartMetric === 'count' ? 'count' : 'averageRating'}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                >
                  {methodStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Coffees Ranking panel */}
        <div className="rounded-xl border border-[#261f1c] bg-[#14100e] p-5 shadow-sm flex flex-col space-y-4 justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-base text-[#f7f5f3]">Ranking de Granos</h3>
              <p className="text-xs text-[#a69c97]">
                Los cafés que con más frecuencia utilizas en tus recetas.
              </p>
            </div>

            {/* List ranking */}
            <div className="space-y-3 mt-4">
              {coffeeStats
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((coffee, index) => {
                  const percent = totalExtractions > 0 ? (coffee.count / totalExtractions) * 100 : 0;
                  return (
                    <div key={coffee.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-[#5c5450] flex-shrink-0">
                            #{index + 1}
                          </span>
                          <span className="font-semibold text-[#f7f5f3] truncate">
                            {coffee.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-[#d4a373] flex-shrink-0">
                          {coffee.count} {coffee.count === 1 ? 'ext.' : 'exts.'}
                        </span>
                      </div>
                      {/* Custom visual progress bar */}
                      <div className="h-1.5 w-full bg-[#0d0b0a] rounded-full overflow-hidden border border-[#261f1c]">
                        <div
                          className="h-full bg-gradient-to-r from-[#d4a373] to-[#c39262] rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Quick quote */}
          <div className="mt-4 pt-4 border-t border-[#261f1c] flex items-start gap-2.5 text-[11px] text-[#a69c97]">
            <Calendar className="h-4 w-4 text-[#d4a373] flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Métricas calculadas en base a tu historial completo de barismo. Actualiza variables y sigue catando para ampliar tu base estadística.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
