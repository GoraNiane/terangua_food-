import React, { useState } from 'react';
import {
  Users,
  QrCode,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  X,
  Check,
  Download,
  MapPin,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { TableStatus, RestaurantTable } from '../../types';
import { Link } from 'react-router-dom';
import { generateTableQrUrl } from '../../utils/qrHelper';

export const AdminTablesPage: React.FC = () => {
  const { tables, restaurant, updateTableStatus, addTable, deleteTable } = useRestaurantStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal d'ajout de table
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState<number>(4);
  const [newTableArea, setNewTableArea] = useState('Salle Principale');
  const [newTableStatus, setNewTableStatus] = useState<TableStatus>('FREE');

  // Modal d'aperçu QR Code
  const [previewQrTable, setPreviewQrTable] = useState<RestaurantTable | null>(null);

  const filteredTables = tables.filter(t => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  const countFree = tables.filter(t => t.status === 'FREE').length;
  const countOccupied = tables.filter(t => t.status === 'OCCUPIED').length;
  const countReserved = tables.filter(t => t.status === 'RESERVED').length;

  const handleOpenAddModal = () => {
    // Calculer le prochain numéro suggéré (ex: si dernière table est 20, suggérer 21)
    const existingNums = tables
      .map(t => parseInt(t.number, 10))
      .filter(n => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    setNewTableNumber(String(nextNum).padStart(2, '0'));
    setNewTableCapacity(4);
    setNewTableArea('Salle Principale');
    setNewTableStatus('FREE');
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;

    await addTable({
      number: newTableNumber.trim(),
      capacity: newTableCapacity,
      area: newTableArea,
      status: newTableStatus,
    });

    setIsAddModalOpen(false);
  };

  const handleDeleteClick = async (table: RestaurantTable) => {
    if (window.confirm(`Confirmez-vous la suppression de la Table ${table.number} ?`)) {
      await deleteTable(table.id);
    }
  };

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'FREE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Libre
          </span>
        );
      case 'OCCUPIED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0A0A0A] text-white border border-[#0A0A0A] shadow-xs">
            <AlertCircle className="w-3 h-3 text-white" /> Occupée
          </span>
        );
      case 'RESERVED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 shadow-xs">
            <Clock className="w-3 h-3 text-amber-600" /> Réservée
          </span>
        );
    }
  };

  const previewTableUrl = generateTableQrUrl(newTableNumber);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A0A0A] flex flex-col font-sans">
      <AdminHeader
        title="Plan de Salle & Tables"
        subtitle={`Gérez les ${tables.length} tables du restaurant et leurs QR Codes associés`}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <AdminSidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* Contenu */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Actions Bar & Filtres */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAEAEA] pb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#0A0A0A] tracking-tight">
                Gestion des Tables & Emplacements
              </h1>
              <p className="text-xs sm:text-sm text-[#666666] mt-0.5">
                Créez de nouvelles tables, modifiez leur capacité et téléchargez leurs QR codes pour les chevalets.
              </p>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une nouvelle table</span>
            </button>
          </div>

          {/* Quick Stats Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`p-4 rounded-2xl border text-left transition-all bg-white shadow-xs ${
                statusFilter === 'ALL'
                  ? 'border-[#0A0A0A] ring-2 ring-[#0A0A0A]/10'
                  : 'border-[#EAEAEA] hover:border-[#CCCCCC]'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider text-[#666666] font-bold">
                Total Tables
              </span>
              <p className="font-display font-black text-2xl text-[#0A0A0A] mt-1">
                {tables.length}
              </p>
            </button>

            <button
              onClick={() => setStatusFilter('FREE')}
              className={`p-4 rounded-2xl border text-left transition-all bg-white shadow-xs ${
                statusFilter === 'FREE'
                  ? 'border-emerald-600 ring-2 ring-emerald-600/10'
                  : 'border-[#EAEAEA] hover:border-[#CCCCCC]'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold">
                Tables Libres
              </span>
              <p className="font-display font-black text-2xl text-emerald-700 mt-1">
                {countFree}
              </p>
            </button>

            <button
              onClick={() => setStatusFilter('OCCUPIED')}
              className={`p-4 rounded-2xl border text-left transition-all bg-white shadow-xs ${
                statusFilter === 'OCCUPIED'
                  ? 'border-[#0A0A0A] ring-2 ring-[#0A0A0A]/10'
                  : 'border-[#EAEAEA] hover:border-[#CCCCCC]'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider text-[#0A0A0A] font-bold">
                Tables Occupées
              </span>
              <p className="font-display font-black text-2xl text-[#0A0A0A] mt-1">
                {countOccupied}
              </p>
            </button>

            <button
              onClick={() => setStatusFilter('RESERVED')}
              className={`p-4 rounded-2xl border text-left transition-all bg-white shadow-xs ${
                statusFilter === 'RESERVED'
                  ? 'border-amber-600 ring-2 ring-amber-600/10'
                  : 'border-[#EAEAEA] hover:border-[#CCCCCC]'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider text-amber-800 font-bold">
                Tables Réservées
              </span>
              <p className="font-display font-black text-2xl text-amber-800 mt-1">
                {countReserved}
              </p>
            </button>
          </div>

          {/* Grille des Tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredTables.map(table => (
              <div
                key={table.id}
                className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EAEAEA] hover:border-[#0A0A0A] transition-all shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-black text-xl text-[#0A0A0A]">
                        Table {table.number}
                      </h3>
                      <p className="text-[11px] text-[#666666] flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3 text-[#0A0A0A]" />
                        <span>{table.capacity} places</span>
                      </p>
                    </div>
                    {getStatusBadge(table.status)}
                  </div>

                  {/* Zone de la table */}
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAFAFA] border border-[#EEEEEE] text-[10px] font-semibold text-[#555555]">
                    <MapPin className="w-2.5 h-2.5 text-[#888888]" />
                    <span>{table.area || 'Salle Principale'}</span>
                  </div>

                  {table.currentOrderId && (
                    <div className="p-2 rounded-xl bg-neutral-100 text-[10px] font-bold text-[#0A0A0A] flex items-center justify-between">
                      <span>Commande active :</span>
                      <span>#{table.currentOrderId}</span>
                    </div>
                  )}
                </div>

                {/* Actions au bas de la carte */}
                <div className="pt-3 border-t border-[#F0F0F0] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {/* Sélecteur de statut */}
                    <select
                      value={table.status}
                      onChange={e => updateTableStatus(table.number, e.target.value as TableStatus)}
                      aria-label="Statut de la table"
                      className="flex-1 bg-white border border-[#E0E0E0] text-[11px] rounded-lg px-2 py-1 text-[#0A0A0A] font-semibold outline-none cursor-pointer focus:border-[#0A0A0A]"
                    >
                      <option value="FREE">Libre</option>
                      <option value="OCCUPIED">Occupée</option>
                      <option value="RESERVED">Réservée</option>
                    </select>

                    {/* Aperçu QR Code */}
                    <button
                      type="button"
                      onClick={() => setPreviewQrTable(table)}
                      className="p-1.5 rounded-lg bg-neutral-100 hover:bg-[#0A0A0A] hover:text-white text-[#0A0A0A] transition-colors"
                      title="Voir le QR Code de table"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>

                    {/* Tester menu de la table */}
                    <Link
                      to={`/menu?table=${table.number}`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-neutral-100 hover:bg-[#0A0A0A] hover:text-white text-[#0A0A0A] transition-colors"
                      title="Tester l'expérience client de cette table"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    {/* Supprimer la table */}
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(table)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                      title="Supprimer cette table"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal d'Ajout d'une Table */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#EAEAEA] w-full max-w-md shadow-2xl overflow-hidden space-y-6 p-6 sm:p-7">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#888888]">
                  Configuration de Salle
                </span>
                <h3 className="text-xl font-extrabold text-[#0A0A0A]">
                  Ajouter une Nouvelle Table
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full hover:bg-neutral-100 text-[#888888] hover:text-[#0A0A0A] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Numéro de table */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A0A0A]">
                  Numéro de Table *
                </label>
                <input
                  type="text"
                  value={newTableNumber}
                  onChange={e => setNewTableNumber(e.target.value)}
                  placeholder="Ex: 21 ou 05"
                  required
                  className="w-full h-11 px-3.5 bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl text-sm font-bold text-[#0A0A0A] outline-none"
                />
              </div>

              {/* Capacité en places */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A0A0A]">
                  Capacité (Nombre de places assises)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[2, 4, 6, 8, 10].map(cap => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => setNewTableCapacity(cap)}
                      className={`h-10 rounded-xl font-bold text-xs border transition-all ${
                        newTableCapacity === cap
                          ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                          : 'bg-white text-[#0A0A0A] border-[#EAEAEA] hover:border-[#CCCCCC]'
                      }`}
                    >
                      {cap} p.
                    </button>
                  ))}
                </div>
              </div>

              {/* Emplacement / Zone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A0A0A]">
                  Emplacement / Zone dans le restaurant
                </label>
                <select
                  value={newTableArea}
                  onChange={e => setNewTableArea(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl text-xs font-semibold text-[#0A0A0A] outline-none"
                >
                  <option value="Salle Principale">Salle Principale</option>
                  <option value="Terrasse Privilège">Terrasse Privilège</option>
                  <option value="Salon VIP & Affaires">Salon VIP & Affaires</option>
                  <option value="Mezzanine">Mezzanine</option>
                  <option value="Comptoir Bar">Comptoir Bar</option>
                </select>
              </div>

              {/* Statut initial */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A0A0A]">
                  Statut initial
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTableStatus('FREE')}
                    className={`h-9 rounded-xl text-xs font-bold border transition-all ${
                      newTableStatus === 'FREE'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white text-[#666666] border-[#EAEAEA]'
                    }`}
                  >
                    Libre
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTableStatus('RESERVED')}
                    className={`h-9 rounded-xl text-xs font-bold border transition-all ${
                      newTableStatus === 'RESERVED'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-white text-[#666666] border-[#EAEAEA]'
                    }`}
                  >
                    Réservée
                  </button>
                </div>
              </div>

              {/* Prévisualisation du QR Code en direct */}
              <div className="p-3.5 bg-[#FAFAFA] border border-[#EEEEEE] rounded-2xl flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl border border-[#E5E5E5] shadow-xs">
                  <QRCodeSVG value={previewTableUrl} size={64} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#888888] block">
                    Lien QR Code généré :
                  </span>
                  <p className="text-[11px] font-mono text-[#0A0A0A] truncate mt-0.5">
                    /menu?table={newTableNumber.trim().padStart(2, '0')}
                  </p>
                  <span className="text-[10px] text-[#666666] block mt-1">
                    Prêt pour impression chevalet
                  </span>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="pt-3 border-t border-[#EEEEEE] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#D0D0D0] text-xs font-bold text-[#555555] hover:bg-neutral-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white text-xs font-bold transition-all shadow-xs"
                >
                  Créer la Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'aperçu QR Code */}
      {previewQrTable && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#EAEAEA] w-full max-w-sm shadow-2xl p-7 text-center space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#888888]">
                Chevalet de Table
              </span>
              <button
                type="button"
                onClick={() => setPreviewQrTable(null)}
                className="p-1 rounded-full hover:bg-neutral-100 text-[#888888] hover:text-[#0A0A0A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-[#0A0A0A]">
                Table {previewQrTable.number}
              </h3>
              <p className="text-xs text-[#666666]">
                {previewQrTable.area || 'Salle Principale'} • {previewQrTable.capacity} places
              </p>
            </div>

            <div className="p-6 bg-[#FAFAFA] rounded-2xl border border-[#EEEEEE] inline-flex items-center justify-center shadow-inner">
              <QRCodeSVG
                value={generateTableQrUrl(previewQrTable.number)}
                size={160}
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <a
                href={generateTableQrUrl(previewQrTable.number)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-[#0A0A0A] text-white text-xs font-bold hover:bg-[#222222] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Tester le menu</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-[#D0D0D0] text-xs font-bold text-[#0A0A0A] hover:bg-neutral-100 transition-colors"
              >
                Imprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
