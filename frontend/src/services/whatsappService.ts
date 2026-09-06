import { Order, Restaurant } from '../types';

export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

export function buildWhatsAppMessage(order: Order, restaurant: Restaurant): string {
  const lines: string[] = [
    `Bonjour ${restaurant.name} 👋`,
    `Je souhaite commander :`,
  ];

  order.items.forEach(item => {
    let itemLine = `${item.name} x${item.quantity}`;
    if (item.selectedOptionsText) {
      itemLine += ` (${item.selectedOptionsText})`;
    }
    lines.push(itemLine);
  });

  if (order.tableNumber) {
    lines.push(`Table : ${order.tableNumber}`);
  }

  lines.push(`Total : ${formatFCFA(order.total)}`);
  lines.push(`Merci.`);

  if (order.notes && order.notes.trim().length > 0) {
    lines.push(``);
    lines.push(`Note : ${order.notes.trim()}`);
  }

  return lines.join('\n');
}

export function generateWhatsAppUrl(order: Order, restaurant: Restaurant): string {
  const message = buildWhatsAppMessage(order, restaurant);
  // Clean phone number (remove +, spaces, dashes)
  const phone = restaurant.whatsappNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
