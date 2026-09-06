import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, Share2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { formatFCFA } from '../../services/whatsappService';
import { useLanguage, getRestaurantSlogan, getProductName, getOptionItemName } from '../../services/i18n';

export const ClientReceiptPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, restaurant } = useRestaurantStore();
  const { t, lang } = useLanguage();

  const order = orders.find(o => o.id === orderId) || orders[0];

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] flex items-center justify-center p-4">
        <p className="text-sm">{t.orderNotFoundTitle}</p>
      </div>
    );
  }

  const receiptUrl = window.location.href;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const rawText = t.receiptShareText
      .replace('#{id}', `#${order.id}`)
      .replace('{name}', restaurant.name)
      .replace('{total}', formatFCFA(order.total))
      .replace('{url}', receiptUrl);
    const text = encodeURIComponent(rawText);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] p-4 sm:p-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Top Back Action */}
        <div className="flex items-center justify-between no-print">
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-xs text-[#8A8A8A] hover:text-[#0A0A0A] font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToMenuBtn}</span>
          </Link>

          <span className="text-xs font-bold text-[#0A0A0A] uppercase tracking-wider">
            {t.receiptOfficialTitle}
          </span>
        </div>

        {/* Printable Ticket Receipt */}
        <div
          id="printable-receipt"
          className="bg-white border border-[#EAEAEA] rounded-3xl p-6 sm:p-8 space-y-6 shadow-card text-center relative overflow-hidden"
        >
          {/* Header */}
          <div className="space-y-1 border-b border-[#EEEEEE] pb-4">
            <h2 className="font-sans font-black text-xl text-[#0A0A0A] tracking-tight">
              {restaurant.name}
            </h2>
            <p className="text-[11px] text-[#666666] font-medium">
              {getRestaurantSlogan(lang)}
            </p>
            <p className="text-[10px] text-[#8A8A8A]">
              {restaurant.address} • Tél : {restaurant.phone}
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-[#FAFAFA]">
              <span className="text-[#8A8A8A]">{t.receiptOrderNo}</span>
              <span className="font-mono font-bold text-[#0A0A0A]">#{order.id}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#FAFAFA]">
              <span className="text-[#8A8A8A]">{t.receiptDateTime}</span>
              <span className="font-mono text-[#0A0A0A]">
                {new Date(order.createdAt).toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#FAFAFA]">
              <span className="text-[#8A8A8A]">{t.receiptType}</span>
              <span className="font-bold text-[#0A0A0A]">
                {order.orderType === 'DINE_IN'
                  ? `${t.dineIn} (${t.tableLabel} ${order.tableNumber})`
                  : order.orderType === 'DELIVERY'
                  ? `${t.delivery} Dakar`
                  : t.takeaway}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-[#FAFAFA]">
              <span className="text-[#8A8A8A]">{t.clientLabel}</span>
              <span className="font-bold text-[#0A0A0A]">{order.customerName}</span>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="space-y-2 text-left pt-2 border-t border-[#EEEEEE]">
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-[#8A8A8A] font-bold">
              <span>{t.receiptItemsCol}</span>
              <span>{t.totalLabel}</span>
            </div>

            <div className="divide-y divide-[#EEEEEE] text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2 flex justify-between items-start gap-2">
                  <div>
                    <span className="font-semibold text-[#0A0A0A]">
                      {item.quantity}× {getProductName({ id: item.productId, name: item.name }, lang)}
                    </span>
                    {item.selectedOptionsText && (
                      <p className="text-[10px] text-[#8A8A8A]">
                        {item.selectedOptionsText.split(', ').map(s => getOptionItemName(s, lang)).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-[#0A0A0A] shrink-0">
                    {formatFCFA(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 pt-3 border-t border-[#EEEEEE] text-xs">
            <div className="flex justify-between text-[#8A8A8A]">
              <span>{t.subtotalLabel}</span>
              <span className="text-[#0A0A0A]">{formatFCFA(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-[#8A8A8A]">
                <span>{t.deliveryFeeLabel}</span>
                <span className="text-[#0A0A0A]">{formatFCFA(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-[#0A0A0A] pt-2 border-t border-[#EEEEEE]">
              <span>{t.receiptTotalPaid}</span>
              <span>{formatFCFA(order.total)}</span>
            </div>
          </div>

          {/* QR Code for instant receipt recall */}
          <div className="pt-4 flex flex-col items-center justify-center space-y-2 border-t border-[#EEEEEE]">
            <div className="p-2 bg-white rounded-xl border border-[#EAEAEA]">
              <QRCodeSVG value={receiptUrl} size={90} />
            </div>
            <p className="text-[10px] text-[#8A8A8A]">
              {t.receiptScanDesc}
            </p>
          </div>

          {/* Footer note */}
          <div className="pt-2 text-[10px] text-[#8A8A8A] space-y-0.5">
            <p>{t.receiptThanks.replace('{name}', restaurant.name)}</p>
            <p className="font-medium text-[#0A0A0A]">{t.receiptPoweredBy}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-[#EAEAEA] hover:border-[#0A0A0A] text-xs font-semibold text-[#0A0A0A] transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printReceiptBtn}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#0A0A0A] hover:bg-[#262626] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>{t.shareReceiptBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
