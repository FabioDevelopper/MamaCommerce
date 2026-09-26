/**
 * Formatage des devises en Francs CFA (XOF / FCFA)
 */
export function formatMoney(amount: number | null | undefined): string {
  const val = Math.round(Number(amount || 0));
  return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
}

/**
 * Formatage des quantités et poids en kg ou pièces
 */
export function formatQuantity(qty: number | null | undefined, unit = 'kg'): string {
  const val = Number(qty || 0);
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: val % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 2,
  }).format(val);
  return `${formatted} ${unit}`;
}

/**
 * Formatage des dates en français lisible
 */
export function formatDate(
  dateInput: string | Date | null | undefined,
  includeTime = false
): string {
  if (!dateInput) return '—';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '—';

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return d.toLocaleDateString('fr-FR', options);
}

/**
 * Formatage d'une date relative (ex: Aujourd'hui, Hier, il y a 3 jours)
 */
export function formatRelativeDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '—';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '—';

  const now = new Date();
  const diffDays = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays === -1) return 'Demain';
  if (diffDays > 1 && diffDays < 7) return `Il y a ${diffDays} jours`;
  return formatDate(d);
}

/**
 * Nettoyage d'un numéro pour lien direct WhatsApp (ex: +228 90 12 34 56 -> 22890123456)
 */
export function cleanPhoneNumber(phone?: string | null): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}
