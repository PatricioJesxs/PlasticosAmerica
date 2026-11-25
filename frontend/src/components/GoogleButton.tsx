'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQuote } from '@/lib/quote';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function cargarScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existente = document.getElementById('google-gsi');
    if (existente) {
      existente.addEventListener('load', () => resolve(), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google'));
    document.head.appendChild(script);
  });
}

interface Props {
  onCredential: (credential: string) => void;
  texto?: string;
}

export default function GoogleButton({ onCredential, texto = 'Continuar con Google' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { notificar } = useQuote();
  const [listo, setListo] = useState(false);

  const callback = useCallback(
    (response: { credential?: string }) => {
      if (response?.credential) onCredential(response.credential);
    },
    [onCredential]
  );

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelado = false;
    cargarScript()
      .then(() => {
        if (cancelado || !ref.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback,
          locale: 'es',
          ux_mode: 'popup',
        });
        window.google.accounts.id.renderButton(ref.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          locale: 'es',
          width: 336,
        });
        setListo(true);
      })
      .catch(() => notificar('No pudimos cargar el inicio de sesión de Google.', 'error'));
    return () => {
      cancelado = true;
    };
  }, [callback, notificar]);

  if (!CLIENT_ID) {
    return (
      <button
        type="button"
        onClick={() =>
          notificar(
            'El acceso con Google se habilitará al configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID y GOOGLE_CLIENT_ID.',
            'error'
          )
        }
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
      >
        <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41.1 35.5 44 30.2 44 24c0-1.2-.1-2.4-.4-3.5z" />
        </svg>
        {texto}
      </button>
    );
  }

  return (
    <div className="w-full">
      <div ref={ref} className="flex w-full justify-center [&>div]:!w-full" />
      {!listo && (
        <div className="skeleton h-11 w-full rounded-full" aria-label="Cargando inicio de sesión con Google" />
      )}
    </div>
  );
}
