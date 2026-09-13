"use client";

interface WhatsAppButtonProps {
  phone?: string;
  message?: string;
  className?: string;
}

export function WhatsAppButton({
  phone = "+212682672517",
  message = "Bonjour, je suis intéressé(e) par les services de TAGMI.",
  className = "",
}: WhatsAppButtonProps) {
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phone}?text=${encodedMessage}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactez-nous sur WhatsApp"
      className={`whatsapp-widget group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.35)] transition-transform duration-300 hover:scale-110 hover:shadow-[0_14px_36px_rgba(37,211,102,0.48)] ${className}`}
    >
      <span className="whatsapp-widget__halo" aria-hidden="true" />
      <span className="whatsapp-widget__pulse" aria-hidden="true" />
      <svg
        viewBox="0 0 32 32"
        className="relative z-10 h-8 w-8 fill-current transition-transform duration-300 group-hover:rotate-[-8deg]"
        aria-hidden="true"
      >
        <path d="M16 3.2A12.7 12.7 0 0 0 5.1 22.4L3.4 28.6l6.4-1.7A12.8 12.8 0 1 0 16 3.2Zm0 23.3c-2 0-3.8-.5-5.5-1.5l-.4-.2-3.8 1 1-3.7-.2-.4a10.4 10.4 0 1 1 8.9 4.8Zm5.7-7.8c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2c-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-1.8-.9-3-1.6-4.2-3.6-.3-.5.3-.5.9-1.7.1-.2.1-.4 0-.6l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.1 3.1 1.3 3.3c.2.2 2.2 3.4 5.4 4.8 2 .9 2.8 1 3.8.8.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z" />
      </svg>
      <span className="pointer-events-none absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#128C7E]" aria-hidden="true" />
      <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-300 group-hover:right-[4.5rem] group-hover:opacity-100">
        Écrivez-nous
      </span>
    </a>
  );
}
