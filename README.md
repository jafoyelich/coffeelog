# CoffeeLog ☕

> **CoffeeLog** es una aplicación web inteligente diseñada para baristas profesionales y entusiastas del café de especialidad. Este proyecto combina el rigor técnico de la extracción física con analíticas avanzadas y modelos de lenguaje de inteligencia artificial para actuar como una bitácora y consultor sensorial interactivo. 
> 
> *Desarrollado como proyecto de examen final de ingeniería de software.*

---

## 🚀 Características Principales (Módulos)

El ecosistema de CoffeeLog se compone de cinco módulos completamente interconectados para brindar trazabilidad y asesoría de alto nivel:

*   **📝 Registro de Cafés:** Un catálogo integral de granos que permite clasificar y detallar el origen, tostador, finca productora, variedad botánica (ej. Geisha, Pacamara, Bourbon), proceso de beneficio (Lavado, Natural, Anaeróbico) y nivel de tueste.
*   **🛠️ Registro de Métodos:** Base de datos para catalogar dispositivos y cafeteras de extracción especializadas (tales como Hario V60, Chemex, AeroPress, Prensa Francesa, Sifón o Espresso) clasificadas automáticamente por su tipo de dinámica (Goteo, Inmersión o Presión).
*   **⏱️ Registro de Extracciones (Bitácora Técnica):** Registro exhaustivo de variables físicas de extracción: dosis exacta de café seco, peso de agua total, temperatura de infusión, molienda/clics, evaluación de taza (escala 1 al 10), notas descriptivas y una secuencia de vertidos dinámicos (`pours`). Soporta entrada de tiempo en el formato de balanza de barismo (`MM:SS`) y lo almacena como segundos en base de datos.
*   **📊 Estadísticas Avanzadas (Dashboard Analítico):** Visualización de métricas a través de un panel analítico equipado con Recharts. Calcula de forma automática el volumen acumulado de extracciones, ratios ideales, promedios de calificación sensorial, métodos preferidos y granos más utilizados mediante gráficos de barra y ranking visuales de alto impacto.
*   **🤖 Asistente IA (Mucilaguito AI):** Integración directa con el SDK de **Google Generative AI** (`gemini-1.5-flash`). Mediante un mecanismo de inyección de contexto (RAG) en tiempo real, extrae las últimas 10 preparaciones de Supabase y las suministra a la IA como instrucciones del sistema. Actúa como un Maestro Barista con memoria conversacional (multi-turno) que analiza tus recetas y te aconseja cómo mejorar tu extracción.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Propósito / Detalle |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router) | Framework React para renderizado híbrido y estructuración de rutas. |
| | TypeScript | Tipado estático estricto en toda la lógica de negocio y esquemas. |
| | TailwindCSS | Estilización adaptativa y responsiva con paleta premium oscura. |
| **Backend & BD** | Supabase (PostgreSQL) | Almacenamiento relacional de granos, métodos y bitácoras de extracción. |
| | Row Level Security (RLS) | Políticas flexibles de lectura global y protección de esquemas de datos. |
| **Inteligencia Artificial** | SDK Google Generative AI | Consumo del modelo fundacional `gemini-1.5-flash` para consultoría de barismo. |
| **Visualización** | Recharts | Renderizado de gráficos vectoriales interactivos para análisis comparativo. |

---

## 📂 Estructura del Proyecto

A continuación se detalla la distribución de directorios clave del código fuente bajo la arquitectura `src/`:

```ascii
CofeLog/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── assistant/       # UI del Asistente IA (Chat interactivo)
│   │   │   ├── coffees/         # UI del Catálogo de Granos de Café
│   │   │   ├── extractions/     # UI de Bitácora y Secuencias de Vertidos
│   │   │   ├── methods/         # UI del Catálogo de Cafeteras/Métodos
│   │   │   └── statistics/      # UI de Gráficos Analíticos (Recharts)
│   │   ├── api/
│   │   │   └── assistant/       # Route Handler de Servidor (Gemini Context Injection)
│   │   ├── layout.tsx           # Layout global de la app
│   │   └── page.tsx             # Landing Page de Especialidad (Inicio)
│   ├── lib/
│   │   ├── services/            # Capa de Servicios CRUD y Lógica de Supabase
│   │   │   ├── coffeeService.ts
│   │   │   ├── extractionService.ts
│   │   │   └── methodService.ts
│   │   └── supabase/            # Cliente de Inicialización de Supabase
│   │       └── client.ts
│   └── types/
│       └── database.types.ts    # Tipos generados e interfaces TypeScript extendidas
```

---

## ⚙️ Instalación y Configuración

Siga los pasos descritos a continuación para clonar y ejecutar el proyecto localmente en su entorno de desarrollo:

### 1. Clonar el repositorio y acceder
```bash
git clone <url-del-repositorio>
cd CofeLog
```

### 2. Instalar dependencias
Instale los paquetes oficiales del ecosistema de Next.js, Recharts y Google Generative AI:
```bash
npm install
```

### 3. Configuración de Variables de Entorno
Cree un archivo `.env.local` en la raíz del proyecto y configure las siguientes variables con sus credenciales de Supabase y de Google AI Studio:

```env
# Variables públicas de cliente para Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase

# API Key de Google Generative AI (Gemini)
GEMINI_API_KEY=tu-api-key-de-gemini
```

### 4. Ejecución del Servidor de Desarrollo
Para arrancar el servidor local con recarga en caliente y compilación Turbopack:
```bash
npm run dev
```
La aplicación estará disponible para visualización en [http://localhost:3000](http://localhost:3000).

### 5. Compilación y Construcción para Producción
Para evaluar el rendimiento y validar que la compilación estática y dinámica no contenga advertencias:
```bash
# Compilar bundle de producción
npm run build

# Levantar servidor optimizado de producción
npm run start
```
