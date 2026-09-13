interface WhatsAppMessageOptions {
  propertyTitle: string;
  propertyPrice: string;
  propertyCurrency: string;
  propertyReference?: string;
  propertyUrl?: string;
  agentPhone?: string;
  message?: string;
}

export function generateWhatsAppUrl(options: WhatsAppMessageOptions): string {
  const {
    propertyTitle,
    propertyPrice,
    propertyCurrency,
    propertyReference,
    propertyUrl,
    agentPhone,
    message,
  } = options;

  const phone = agentPhone?.replace(/[^0-9]/g, "") || "212600000000";

  const defaultMessage = message || `Bonjour,

Je suis intéressé(e) par cette propriété sur TAGMI:

🏠 ${propertyTitle}
💰 ${propertyPrice} ${propertyCurrency}
${propertyReference ? `📋 Réf: ${propertyReference}` : ""}
${propertyUrl ? `🔗 ${propertyUrl}` : ""}

Je souhaiterais obtenir plus d'informations.

Merci!`;

  const encodedMessage = encodeURIComponent(defaultMessage);

  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

export function formatPriceForDisplay(price: number | string, currency: string = "MAD"): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;

  if (currency === "MAD") {
    return new Intl.NumberFormat("fr-MA", {
      maximumFractionDigits: 0,
    }).format(numPrice) + " MAD";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numPrice);
}

export function getPhoneDisplayUrl(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  return `tel:${cleaned}`;
}
