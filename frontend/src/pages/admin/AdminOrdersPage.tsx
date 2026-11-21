import React, { useState } from 'react';
import {
  Search,
  Filter,
  Phone,
  Utensils,
  MapPin,
  Clock,
  Eye,
  AlertCircle,
  Download,
  Printer,
  CreditCard,
  CheckCircle,
  XCircle,
  X,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { OrderStatusBadge } from '../../components/admin/OrderStatusBadge';
import { OrderDetailsModal } from '../../components/admin/OrderDetailsModal';
import { ThermalReceiptModal } from '../../components/common/ThermalReceiptModal';
import { Order, OrderStatus } from '../../types';
import { formatFCFA } from '../../services/whatsappService';

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, approveOrderPayment, rejectOrderPayment } = useRestaurantStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [thermalOrder, setThermalOrder] = useState<Order | null>(null);

  // Gestion du rejet de paiement
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const exportToCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = ['ID', 'Date', 'Heure', 'Client', 'Telephone', 'Type', 'Table_Adresse', 'Articles', 'SousTotal_FCFA', 'Livraison_FCFA', 'Total_FCFA', 'Statut'];
    const rows = filteredOrders.map(o => {
      const d = new Date(o.createdAt);
      const dateStr = d.toLocaleDateString('fr-FR');
      const timeStr = d.toLocaleTimeString('fr-FR');
      const itemsStr = o.items.map(i => `${i.quantity}x ${i.name}`).join(' | ');
      const destination = o.orderType === 'DINE_IN' ? `Table ${o.tableNumber}` : o.orderType === 'DELIVERY' ? (o.deliveryAddress || 'Livraison') : 'A emporter';
      return [
        o.id,
        dateStr,
        timeStr,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.customerPhone}"`,
        o.orderType,
        `"${destination.replace(/"/g, '""')}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        o.subtotal,
        o.deliveryFee,
        o.total,
        o.status,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `commandes_teranga_food_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesStatus;

    const matchesId =
      order.id.toLowerCase().includes(query) ||
      (order.orderNumber?.toLowerCase().includes(query) ?? false);
    const matchesName = order.customerName.toLowerCase().includes(query);
    const matchesPhone = order.customerPhone.includes(query);
    const matchesTable = order.tableNumber?.includes(query);

    return matchesStatus && (matchesId || matchesName || matchesPhone || matchesTable);
  });

  const getStatusCount = (st: string) => {
    if (st === 'ALL') return orders.length;
    return orders.filter(o => o.status === st).length;
  };

  const awaitingCount = orders.filter(o => o.status === 'AWAITING_PAYMENT_VERIFICATION').length;

  const statusTabs = [
    { key: 'ALL', label: 'Toutes' },
    { key: 'AWAITING_PAYMENT_VERIFICATION', label: '💳 Paiements à vérifier' },
    { key: 'PENDING', label: 'Nouvelles' },
    { key: 'CONFIRMED', label: 'Confirmées' },
    { key: 'PREPARING', label: 'En préparation' },
    { key: 'READY', label: 'Prêtes' },
    { key: 'SERVED', label: 'Servies' },
    { key: 'CANCELLED', label: 'Annulées' },
  ];

  const handleApprove = async (orderId: string) => {
    setIsProcessingAction(orderId);
    try {
      await approveOrderPayment(orderId);
      setActionSuccessMessage(`Paiement de la commande #${orderId} validé avec succès ! Commande transmise à la cuisine.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (e: any) {
      alert(e.message || "Erreur lors de l'approbation");
    } finally {
      setIsProcessingAction(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingOrder) return;
    if (!rejectionReason.trim() || rejectionReason.trim().length < 3) {
      alert('Veuillez indiquer un motif de rejet clair (au moins 3 caractères).');
      return;
    }

    setIsProcessingAction(rejectingOrder.id);
    try {
      await rejectOrderPayment(rejectingOrder.id, rejectionReason.trim());
      setActionSuccessMessage(`Paiement rejeté pour la commande #${rejectingOrder.id}. Commande annulée.`);
      setRejectingOrder(null);
      setRejectionReason('');
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (e: any) {
      alert(e.message || "Erreur lors du rejet");
    } finally {
      setIsProcessingAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0">
        <div className="fixed inset-y-0 w-64">
          <AdminSidebar />
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-xs h-full">
            <AdminSidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Gestion des commandes"
          subtitle="Suivez et actualisez les commandes de la salle, à emporter et en livraison"
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
          {/* Notification toast d'action réussie */}
          {actionSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-600 text-white flex items-center justify-between shadow-lg animate-fade-in">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
                <Check className="w-5 h-5 shrink-0" />
                <span>{actionSuccessMessage}</span>
              </div>
              <button
                onClick={() => setActionSuccessMessage(null)}
                className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Bannière d'alerte pour les paiements en attente de vérification */}
          {awaitingCount > 0 && statusFilter !== 'AWAITING_PAYMENT_VERIFICATION' && (
            <div
              onClick={() => setStatusFilter('AWAITING_PAYMENT_VERIFICATION')}
              className="p-4 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-800 text-white flex items-center justify-between cursor-pointer shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {awaitingCount} paiement{awaitingCount > 1 ? 's' : ''} mobile{awaitingCount > 1 ? 's' : ''} en attente de vérification !
                  </h3>
                  <p className="text-xs text-white/90">
                    Cliquez ici pour vérifier et valider les paiements Wave et Orange Money avant transmission en cuisine.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-white text-purple-900 font-black text-xs shrink-0 shadow-sm">
                Filtrer ({awaitingCount})
              </span>
            </div>
          )}

          {/* Status Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {statusTabs.map(tab => {
              const count = getStatusCount(tab.key);
              const isActive = statusFilter === tab.key;
              const isAlertTab = tab.key === 'AWAITING_PAYMENT_VERIFICATION';
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shadow-sm ${
                    isActive
                      ? isAlertTab
                        ? 'bg-purple-800 text-white border-purple-800'
                        : 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                      : isAlertTab && count > 0
                      ? 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
                      : 'bg-white text-[#666666] border-[#EAEAEA] hover:border-[#0A0A0A]/40'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-white text-[#0A0A0A]'
                        : isAlertTab && count > 0
                        ? 'bg-purple-600 text-white animate-pulse'
                        : 'bg-gray-100 text-[#0A0A0A]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher par N° de commande, client, téléphone ou table..."
                className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#0A0A0A] placeholder:text-[#999999] outline-none transition-all shadow-sm"
              />
            </div>

            <button
              onClick={exportToCSV}
              disabled={filteredOrders.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-gray-50 border border-[#EAEAEA] text-[#0A0A0A] font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
              title="Exporter au format CSV (Excel)"
            >
              <Download className="w-4 h-4 text-[#0A0A0A]" />
              <span>Exporter CSV ({filteredOrders.length})</span>
            </button>
          </div>

          {/* Orders Table & Cards */}
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-[#EAEAEA] shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto flex items-center justify-center text-[#0A0A0A]">
                <AlertCircle className="w-6 h-6 opacity-60" />
              </div>
              <h3 className="font-display font-bold text-base text-[#0A0A0A]">
                Aucune commande trouvée
              </h3>
              <p className="text-xs text-[#666666]">
                Aucune commande ne correspond au filtre ou à votre recherche.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EAEAEA] hover:border-[#0A0A0A] transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left info */}
                  <div
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 cursor-pointer space-y-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-display font-black text-base text-[#0A0A0A]">
                        #{order.id}
                      </span>
                      <OrderStatusBadge status={order.status} />
                      <span className="text-[11px] text-[#888888]">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className="font-bold text-[#0A0A0A]">{order.customerName}</span>
                      <span className="text-[#666666] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#0A0A0A]" />
                        <span>{order.customerPhone}</span>
                      </span>
                      <span className="text-[#666666] flex items-center gap-1 font-medium">
                        {order.orderType === 'DINE_IN' ? (
                          <>
                            <Utensils className="w-3 h-3 text-[#0A0A0A]" />
                            <span>Table N° {order.tableNumber}</span>
                          </>
                        ) : order.orderType === 'DELIVERY' ? (
                          <>
                            <MapPin className="w-3 h-3 text-[#0A0A0A]" />
                            <span className="line-clamp-1">{order.deliveryAddress}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-[#0A0A0A]" />
                            <span>À emporter</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Summary of items */}
                    <p className="text-xs text-[#666666] line-clamp-1">
                      {order.items.map(i => `${i.name} × ${i.quantity}`).join(' • ')}
                    </p>

                    {/* Section de vérification de paiement mobile pour le gérant */}
                    {order.status === 'AWAITING_PAYMENT_VERIFICATION' && (
                      <div className="mt-3 p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-200 text-purple-900">
                              {order.payment?.method === 'OM' ? 'Orange Money' : 'Wave'}
                            </span>
                            <span className="font-bold text-purple-950">
                              Montant attendu : {formatFCFA(order.total)}
                            </span>
                          </div>
                          <p className="text-[#444444] text-[11px]">
                            Réf. client : <span className="font-mono font-bold text-[#0A0A0A]">{order.payment?.transactionRef || 'Non renseignée'}</span>
                            {order.payment?.clientDeclaredAt && (
                              <span className="text-[#777777] ml-2">
                                • Déclaré à {new Date(order.payment.clientDeclaredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(order.id);
                            }}
                            disabled={isProcessingAction === order.id}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>APPROUVER LE PAIEMENT</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRejectingOrder(order);
                              setRejectionReason('');
                            }}
                            disabled={isProcessingAction === order.id}
                            className="px-3 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>REJETER</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#EEEEEE]">
                    <span className="font-display font-black text-base sm:text-lg text-[#0A0A0A]">
                      {formatFCFA(order.total)}
                    </span>

                    {/* Quick Status Select */}
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      aria-label="Statut"
                      className="bg-white border border-[#EAEAEA] text-xs font-semibold rounded-xl px-2.5 py-1.5 text-[#0A0A0A] outline-none focus:border-[#0A0A0A] cursor-pointer"
                    >
                      <option value="AWAITING_PAYMENT_VERIFICATION">Paiement à vérifier</option>
                      <option value="PENDING_PAYMENT">Attente paiement</option>
                      <option value="PENDING">Nouvelle</option>
                      <option value="CONFIRMED">Confirmée</option>
                      <option value="PREPARING">En préparation</option>
                      <option value="READY">Prête</option>
                      <option value="SERVED">Servie</option>
                      <option value="CANCELLED">Annulée</option>
                    </select>

                    {/* Quick Print Thermal Receipt */}
                    <button
                      onClick={() => setThermalOrder(order)}
                      className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-[#0A0A0A] hover:text-white text-[#0A0A0A] flex items-center justify-center transition-colors"
                      title="Imprimer ticket de caisse (80mm)"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Detail Button */}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-[#0A0A0A] hover:text-white text-[#0A0A0A] flex items-center justify-center transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      {/* Thermal Receipt Modal (80mm format) */}
      <ThermalReceiptModal
        order={thermalOrder}
        isOpen={!!thermalOrder}
        onClose={() => setThermalOrder(null)}
      />

      {/* Modal de Rejet de Paiement avec Motif Obligatoire */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EAEAEA] p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-base text-[#0A0A0A]">
                  Rejeter le paiement #{rejectingOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setRejectingOrder(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#666666]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#555555]">
              <p>
                Client : <strong>{rejectingOrder.customerName}</strong> ({rejectingOrder.customerPhone})
              </p>
              <p>
                Montant : <strong>{formatFCFA(rejectingOrder.total)}</strong> • Moyen : <strong>{rejectingOrder.payment?.method === 'OM' ? 'Orange Money' : 'Wave'}</strong>
              </p>
              <div className="text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] leading-relaxed">
                ⚠️ Cette action annulera définitivement la commande et notifiera le client avec le motif. La commande ne sera pas transmise à la cuisine.
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0A0A0A] block">
                Motif obligatoire du rejet *
              </label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Ex: Montant non reçu sur le compte Wave, référence introuvable, transaction erronée..."
                rows={3}
                className="w-full bg-[#FAFAFA] border border-[#EAEAEA] focus:border-red-500 rounded-xl p-3 text-xs text-[#0A0A0A] outline-none transition-all placeholder:text-[#999999]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-[#EAEAEA] hover:bg-gray-100 text-xs font-bold text-[#666666] transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isProcessingAction === rejectingOrder.id || rejectionReason.trim().length < 3}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isProcessingAction === rejectingOrder.id ? 'Rejet en cours...' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
