'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, RefreshCw, AlertTriangle, Coffee, Brain, HelpCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const QUICK_SUGGESTIONS = [
  {
    label: '☕ ¿Cómo mejoro mi última extracción?',
    text: 'Basándote en mi última receta registrada, ¿qué ajustes de barismo me sugieres para mejorar el sabor?',
  },
  {
    label: '📊 Analiza mi café y cafetera más usados',
    text: '¿Cuál es mi café de especialidad y método de extracción que más he utilizado y qué perfil de taza promedio estoy logrando?',
  },
  {
    label: '💡 Tips de molienda para V60',
    text: 'Dame consejos profesionales para ajustar el tamaño de molienda en un método de goteo como el Hario V60.',
  },
  {
    label: '⚖️ ¿Qué es el ratio y cómo lo calculo?',
    text: 'Explícame qué es el brew ratio en café de especialidad y dame una receta estándar recomendada para comenzar.',
  },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Mensaje de bienvenida inicial de Mucilaguito AI
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages([
      {
        role: 'ai',
        content:
          '¡Hola! Soy **Mucilaguito AI**, tu mentor y Maestro Barista personal. He sincronizado tu bitácora de extracciones en CoffeeLog y estoy listo para analizar tus variables. \n\n¿Quieres que revisemos tus recetas recientes, conversemos sobre el ratio ideal para tus granos de café, o afinemos la técnica de tus vertidos? ¡Pregúntame lo que gustes!',
      },
    ]);
  }, []);

  // Auto-scroll al fondo al recibir o enviar mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = async (textToSend: string) => {
    const cleanText = textToSend.trim();
    if (!cleanText || sending) return;

    // Agregar mensaje del usuario a la pantalla
    const userMessage: Message = { role: 'user', content: cleanText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);
    setError(null);

    try {
      // Llamar al endpoint pasándole el mensaje actual y el historial acumulado
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: cleanText,
          history: messages, // Envía todo el historial acumulado de la sesión
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un problema al conectar con el asistente.');
      }

      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'ai', content: data.reply }]);
      } else {
        throw new Error('La respuesta del asistente está vacía.');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(
        errorMessage || 'No se pudo recibir respuesta del asistente. Verifique su conexión.',
      );
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleResetChat = () => {
    if (confirm('¿Desea reiniciar la conversación con Mucilaguito AI?')) {
      setMessages([
        {
          role: 'ai',
          content:
            'Entendido, hemos reiniciado nuestra sesión de barismo. He vuelto a leer tu bitácora reciente. ¿En qué receta o técnica nos enfocamos ahora?',
        },
      ]);
      setError(null);
    }
  };

  // Función para formatear el texto markdown básico a HTML
  const renderMessageContent = (content: string) => {
    // Reemplazar saltos de línea por <br/>
    // Reemplazar negritas **texto** por <strong>texto</strong>
    const formatted = content.split('\n').map((line, i) => {
      // Analizar negritas
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      formattedLine = formattedLine.replace(
        boldRegex,
        '<strong class="font-bold text-[#f7f5f3]">$1</strong>',
      );

      return (
        <p
          key={i}
          className="min-h-[1rem] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });

    return <div className="space-y-2">{formatted}</div>;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] md:h-[calc(100vh-6rem)] max-w-4xl mx-auto space-y-4">
      {/* Header section with Reset */}
      <div className="flex items-center justify-between border-b border-[#261f1c] pb-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#261f1c] border border-[#3c302b] shadow-inner relative">
            <Sparkles className="h-5 w-5 text-[#d4a373] animate-pulse" />
            <span className="absolute bottom-0.5 right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#f7f5f3] flex items-center gap-1.5">
              Mucilaguito AI
            </h1>
            <p className="text-xs text-[#a69c97]">Tu Consultor Barista Experto</p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="flex items-center gap-1.5 rounded-lg border border-[#261f1c] hover:border-[#3d302b] hover:bg-[#261f1c]/50 px-3 py-1.5 text-xs text-[#a69c97] hover:text-[#f7f5f3] transition-all"
          title="Reiniciar chat"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reiniciar Chat
        </button>
      </div>

      {/* Main Conversational Window Container */}
      <div className="flex-1 flex flex-col min-h-0 rounded-2xl border border-[#261f1c] bg-[#14100e] overflow-hidden relative shadow-lg">
        {/* Messages List Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 scrollbar-thin scrollbar-thumb-[#261f1c]"
        >
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                } animate-in fade-in slide-in-from-bottom-2 duration-200`}
              >
                {/* Avatar Icon */}
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${
                    isUser
                      ? 'bg-[#14100e] border-[#3c302b] text-[#d4a373]'
                      : 'bg-[#261f1c] border-[#3c302b] text-[#f7f5f3]'
                  }`}
                >
                  {isUser ? (
                    <Coffee className="h-4 w-4" />
                  ) : (
                    <Brain className="h-4 w-4 text-[#d4a373]" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-br from-[#d4a373] to-[#c39262] text-[#14100e] font-medium rounded-tr-none'
                      : 'bg-[#0d0b0a] border border-[#261f1c]/80 text-[#a69c97] rounded-tl-none'
                  }`}
                >
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            );
          })}

          {/* Typing Loading Indicator Bubble */}
          {sending && (
            <div className="flex gap-3 max-w-[75%] mr-auto animate-pulse">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[#3c302b] bg-[#261f1c] text-[#f7f5f3]">
                <Brain className="h-4 w-4 text-[#d4a373] animate-spin" />
              </div>
              <div className="rounded-2xl rounded-tl-none border border-[#261f1c] bg-[#0d0b0a] px-4 py-3 text-xs text-[#a69c97] flex items-center gap-2">
                <span className="flex gap-1">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[#d4a373] animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[#d4a373] animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[#d4a373] animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </span>
                <span>Mucilaguito AI está analizando tus datos...</span>
              </div>
            </div>
          )}

          {/* Error Message alert */}
          {error && (
            <div className="flex items-center gap-3 rounded-lg border border-red-900/50 bg-red-950/40 p-4 text-xs text-red-200 animate-in zoom-in-95 duration-200">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-400" />
              <div className="flex-1">{error}</div>
              <button
                onClick={() => handleSend(messages[messages.length - 1]?.content || '')}
                className="rounded bg-[#261f1c] border border-red-900 px-2.5 py-1 hover:bg-red-950 transition-all font-bold text-red-300"
              >
                Reintentar
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips Section (shown only when idle) */}
        {!sending && messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-[#261f1c] bg-[#0d0b0a]/40 space-y-2 flex-shrink-0">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#5c5450] flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              Preguntas de sugerencia
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {QUICK_SUGGESTIONS.map((sug) => (
                <button
                  key={sug.label}
                  onClick={() => handleSend(sug.text)}
                  className="text-left rounded-lg border border-[#261f1c] bg-[#14100e]/80 hover:bg-[#261f1c]/50 hover:border-[#3c302b] p-2 text-xs text-[#a69c97] hover:text-[#f7f5f3] transition-all duration-200 active:scale-[0.98] truncate"
                >
                  {sug.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar Form */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-[#261f1c] bg-[#0d0b0a] p-3 md:p-4 flex gap-2 items-center flex-shrink-0"
        >
          <input
            type="text"
            value={input}
            disabled={sending}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              sending
                ? 'Mucilaguito AI está pensando...'
                : 'Escribe tu pregunta sobre barismo o recetas aquí...'
            }
            className="flex-1 rounded-xl border border-[#261f1c] bg-[#14100e] px-4 py-3 text-sm text-[#f7f5f3] placeholder-[#5c5450] focus:border-[#d4a373] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#14100e] shadow-md transition-all duration-200 active:scale-[0.96] disabled:opacity-30 disabled:hover:bg-[#d4a373] disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
