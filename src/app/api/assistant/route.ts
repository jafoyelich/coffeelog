import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Database } from '@/types/database.types';

// Desactivar el caching para asegurar datos de contexto en tiempo real
export const dynamic = 'force-dynamic';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const message = body?.message;
    const history: Message[] = body?.history || [];

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'El mensaje del usuario es requerido y debe ser de tipo texto.' },
        { status: 400 },
      );
    }

    // 1. Obtener claves y urls de variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('API Error: Faltan variables de entorno de Supabase.');
      return NextResponse.json(
        { error: 'Error de servidor: Faltan variables de entorno de Supabase.' },
        { status: 500 },
      );
    }

    if (!geminiApiKey) {
      console.error('API Error: Falta GEMINI_API_KEY.');
      return NextResponse.json(
        { error: 'Error de servidor: Falta configurar la API Key de Gemini.' },
        { status: 500 },
      );
    }

    // 2. Instanciar Supabase Client de Servidor
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

    // 3. Obtener últimas 10 extracciones con joins de cafés y métodos
    let extractionsTextContext =
      'El usuario no tiene extracciones registradas aún en su bitácora de barismo.';

    try {
      const { data, error: supabaseError } = await supabase
        .from('extractions')
        .select('*, coffees(*), methods(*)')
        .order('created_at', { ascending: false })
        .limit(10);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const extractions = data as any[] | null;

      if (supabaseError) {
        console.warn('Advertencia al consultar Supabase en API Route:', supabaseError.message);
      } else if (extractions && extractions.length > 0) {
        // Generar un formato legible y un JSON representativo para Gemini
        extractionsTextContext = JSON.stringify(
          extractions.map((e, idx) => ({
            id: idx + 1,
            fecha: e.created_at,
            cafe: e.coffees?.name || 'Desconocido',
            metodo: e.methods?.name || 'Desconocido',
            dosis_g: e.coffee_weight_g,
            agua_g: e.water_weight_g,
            tiempo_s: e.extraction_time_s,
            molienda: e.grind_size || 'No especificada',
            calificacion: e.rating ? `${e.rating}/10` : 'Sin calificar',
            notas: e.notes || 'Sin anotaciones',
            vertidos: e.pours || [],
          })),
          null,
          2,
        );
      }
    } catch (dbErr) {
      console.error('Error al consultar datos de Supabase en API:', dbErr);
    }

    // 4. Construir System Prompt (Personalidad de Mucilaguito AI)
    const systemPrompt = `Eres Mucilaguito AI, un experto Maestro Barista certificado en café de especialidad.
Actúas como mentor, asesor de barismo y guía sensorial. Tu objetivo es ayudar al usuario a mejorar sus preparaciones, recetas, moliendas y ratios.

Aquí tienes el historial reciente de las últimas 10 extracciones de café del usuario registradas en CoffeeLog:
${extractionsTextContext}

Instrucciones para tus respuestas:
1. Analiza el historial del usuario de forma inteligente. Si te pregunta sobre su historial, sus preferencias, su café favorito o qué cafetera usa más, responde basándote exactamente en la información provista.
2. Da sugerencias prácticas de barismo (por ejemplo: si ves una receta con baja calificación o tiempos de extracción inadecuados, sugiere ajustar la molienda o la temperatura del agua).
3. Mantén tus respuestas concisas, estructuradas en español, profesionales, y con una personalidad cálida, entusiasta y servicial. Usa un tono que inspire a catar y disfrutar la taza.
4. Si el historial indica que no hay preparaciones, anímalo amigablemente a registrar su primera extracción en CoffeeLog para poder darle consejos personalizados.`;

    // 5. Configurar el SDK de Gemini
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: systemPrompt,
    });

      // 6. Formatear historial para el chat de Gemini y generar respuesta
      let replyText = '';

      if (history && history.length > 0) {
          // Mapear historial de chat al formato esperado por el SDK de Gemini
          let geminiHistory = history.map((msg) => ({
              role: msg.role === 'user' ? ('user' as const) : ('model' as const),
              parts: [{ text: msg.content }],
          }));

          // ---> LA SOLUCIÓN <---
          // Si el primer mensaje en el historial es de Mucilaguito (el saludo inicial), lo eliminamos.
          // La API de Gemini exige estrictamente que el historial comience con el rol 'user'.
          if (geminiHistory.length > 0 && geminiHistory[0].role === 'model') {
              geminiHistory.shift();
          }

          const chat = model.startChat({
              history: geminiHistory,
          });

          const result = await chat.sendMessage(message);
          const response = await result.response;
          replyText = response.text();
      } else {
          // Envío de mensaje simple directo
          const result = await model.generateContent(message);
          const response = await result.response;
          replyText = response.text();
      }

    // 7. Retornar respuesta
    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error('Error fatal en el API Route de Asistente:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: `Ocurrió un error al procesar la solicitud con Gemini: ${errorMessage}`,
      },
      { status: 500 },
    );
  }
}
