import Link from 'next/link';
import { Coffee, Sparkles, BarChart2, ChevronRight, TrendingUp, Layers } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d0b0a] text-[#f7f5f3] flex flex-col justify-between font-sans selection:bg-[#d4a373] selection:text-[#14100e] relative overflow-hidden">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#d4a373]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#c39262]/5 blur-[150px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="w-full max-w-6xl mx-auto px-6 h-20 flex items-center justify-between border-b border-[#261f1c]/40 relative z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#14100e] border border-[#261f1c]">
            <Coffee className="h-5 w-5 text-[#d4a373]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#f7f5f3]">
            Coffee<span className="text-[#d4a373]">Log</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 rounded bg-[#261f1c]/50 border border-[#261f1c] px-2 py-0.5 text-[10px] text-[#a69c97]">
            v0.1.0 (Beta)
          </span>
          <Link
            href="/extractions"
            className="flex items-center gap-1 rounded-lg border border-[#261f1c] hover:border-[#3d302b] hover:bg-[#261f1c]/40 px-3.5 py-1.5 text-xs text-[#a69c97] hover:text-[#f7f5f3] transition-all"
          >
            Entrar
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Hero CTA Section */}
      <main className="flex-1 flex flex-col justify-center max-w-5xl mx-auto px-6 py-12 md:py-24 relative z-10 w-full">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Suttle visual tag */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#261f1c]/60 border border-[#3c302b]/60 px-3 py-1 text-xs text-[#d4a373] animate-pulse">
            <Sparkles className="h-3 w-3" />
            <span>Inteligencia Artificial y Analítica</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none">
            Perfecciona tu taza con{' '}
            <span className="bg-gradient-to-r from-[#f7f5f3] via-[#d4a373] to-[#c39262] bg-clip-text text-transparent">
              CoffeeLog
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-[#a69c97] font-medium max-w-2xl mx-auto leading-relaxed">
            El primer ecosistema inteligente para baristas y aficionados del café de especialidad.
            Registra, analiza y evoluciona tu perfil sensorial en cada vertido.
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/extractions"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4a373] to-[#c39262] px-6 py-3.5 text-sm font-bold text-[#14100e] shadow-lg shadow-[#d4a373]/10 hover:shadow-[#d4a373]/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 w-full sm:w-auto"
            >
              Comenzar a Registrar
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/statistics"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#14100e] border border-[#261f1c] hover:border-[#3c302b] px-6 py-3.5 text-sm font-semibold text-[#a69c97] hover:text-[#f7f5f3] hover:bg-[#261f1c]/20 transition-all duration-200 w-full sm:w-auto"
            >
              <BarChart2 className="h-4 w-4 text-[#d4a373]" />
              Ver Estadísticas
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid (3 Columns) */}
        <div className="grid gap-6 sm:grid-cols-3 mt-16 md:mt-24">
          {/* Feature 1: Real-time Stats */}
          <div className="rounded-2xl border border-[#261f1c] bg-[#14100e]/80 p-6 space-y-4 hover:border-[#382c28] hover:bg-[#14100e] transition-all duration-300 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#261f1c] border border-[#3c302b] shadow-inner group-hover:scale-105 transition-transform duration-300">
              <TrendingUp className="h-5 w-5 text-[#d4a373]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-[#f7f5f3] text-sm tracking-tight flex items-center gap-1.5">
                📊 Estadísticas en Tiempo Real
              </h3>
              <p className="text-xs text-[#a69c97] leading-relaxed">
                Visualiza el rendimiento de tus extracciones con gráficos analíticos interactivos de
                Recharts y métricas avanzadas por método y grano.
              </p>
            </div>
          </div>

          {/* Feature 2: AI Barista */}
          <div className="rounded-2xl border border-[#261f1c] bg-[#14100e]/80 p-6 space-y-4 hover:border-[#382c28] hover:bg-[#14100e] transition-all duration-300 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#261f1c] border border-[#3c302b] shadow-inner group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-5 w-5 text-[#d4a373]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-[#f7f5f3] text-sm tracking-tight flex items-center gap-1.5">
                🤖 Asistente de Barismo IA
              </h3>
              <p className="text-xs text-[#a69c97] leading-relaxed">
                Consulta a Mucilaguito AI, tu mentor barista entrenado con tu historial de catado
                que te asesora sobre moliendas, recetas y ratios.
              </p>
            </div>
          </div>

          {/* Feature 3: Full Traceability */}
          <div className="rounded-2xl border border-[#261f1c] bg-[#14100e]/80 p-6 space-y-4 hover:border-[#382c28] hover:bg-[#14100e] transition-all duration-300 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#261f1c] border border-[#3c302b] shadow-inner group-hover:scale-105 transition-transform duration-300">
              <Layers className="h-5 w-5 text-[#d4a373]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-[#f7f5f3] text-sm tracking-tight flex items-center gap-1.5">
                ☕ Trazabilidad Total
              </h3>
              <p className="text-xs text-[#a69c97] leading-relaxed">
                Control completo de dosis, temperatura de agua, molienda, notas de cata y esquemas
                de vertidos dinámicos en una bitácora premium.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-6xl mx-auto px-6 h-16 flex flex-col sm:flex-row items-center justify-between border-t border-[#261f1c]/40 text-[10px] text-[#5c5450] relative z-10 py-4 sm:py-0 gap-2">
        <div className="flex items-center gap-1.5">
          <Coffee className="h-3 w-3 text-[#d4a373]/60" />
          <span>Diseñado para Baristas de Especialidad.</span>
        </div>
        <div>
          <span>© {new Date().getFullYear()} CoffeeLog. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
