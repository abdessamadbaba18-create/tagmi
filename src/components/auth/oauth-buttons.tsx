"use client";

import { useEffect, useState } from "react";

interface ProviderConfig {
  google: boolean;
  apple: boolean;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.98 11.98 0 0 0 0 10.76l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.54c-.03-2.72 2.23-4.03 2.33-4.1-1.27-1.86-3.25-2.11-3.95-2.14-1.68-.17-3.28.99-4.13.99-.86 0-2.18-.97-3.58-.94-1.84.03-3.54 1.07-4.49 2.72-1.91 3.32-.49 8.23 1.37 10.92.92 1.32 2 2.79 3.42 2.74 1.37-.06 1.89-.88 3.55-.88s2.12.88 3.57.85c1.47-.02 2.41-1.34 3.32-2.66 1.04-1.52 1.48-3 1.5-3.08-.03-.01-2.88-1.11-2.91-4.4zM14.16 4.3c.75-.91 1.26-2.18 1.12-3.44-1.08.04-2.39.72-3.17 1.64-.7.82-1.31 2.13-1.14 3.39 1.2.09 2.43-.62 3.19-1.59z" />
    </svg>
  );
}

export function OAuthButtons() {
  const [providers, setProviders] = useState<ProviderConfig | null>(null);

  useEffect(() => {
    fetch("/api/auth/oauth/providers")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setProviders(d || { google: false, apple: false }))
      .catch(() => setProviders({ google: false, apple: false }));
  }, []);

  if (!providers || (!providers.google && !providers.apple)) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
          ou continuez avec
        </span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="mt-4 grid gap-3">
        {providers.google && (
          <a
            href="/api/auth/oauth/google"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:shadow"
          >
            <GoogleIcon className="h-5 w-5" />
            Continue avec Google
          </a>
        )}
        {providers.apple && (
          <a
            href="/api/auth/oauth/apple"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-stone-800 hover:shadow"
          >
            <AppleIcon className="h-5 w-5" />
            Continue avec Apple
          </a>
        )}
      </div>
    </div>
  );
}