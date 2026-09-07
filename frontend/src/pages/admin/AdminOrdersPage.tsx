import React, { useState } from 'react';
import { Search, Filter, Phone, Utensils, MapPin, Clock, Eye, AlertCircle, Download, Printer } from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { OrderStatusBadge } from '../../components/admin/OrderStatusBadge';
import { OrderDetailsModal } from '../../components/admin/OrderDetailsModal';
import { ThermalReceiptModal } from '../../components/common/ThermalReceiptModal';
import { Order, OrderStatus } from '../../types';
import { formatFCFA } from '../../services/whatsappService';

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus } = useRestaurantStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [thermalOrder, setThermalOrder] = useState<Order | null>(null);

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

  const statusTabs = [
    { key: 'ALL', label: 'Toutes' },
    { key: 'PENDING', label: 'Nouvelles' },
    { key: 'PREPARING', label: 'En préparation' },
    { key: 'READY', label: 'Prêtes' },
    { key: 'SERVED', label: 'Servies' },
    { key: 'CANCELLED', label: 'Annulées' },
  ];

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
          {/* Status Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {statusTabs.map(tab => {
              const count = getStatusCount(tab.key);
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shadow-sm ${
                    isActive
                      ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                      : 'bg-white text-[#666666] border-[#EAEAEA] hover:border-[#0A0A0A]/40'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white text-[#0A0A0A]' : 'bg-gray-100 text-[#0A0A0A]'
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
                      <option value="PENDING">En attente</option>
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
    </div>
  );
};
