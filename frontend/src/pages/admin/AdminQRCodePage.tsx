import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Printer,
  Download,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Layers,
  Wifi,
  Globe,
  Monitor,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { TableStandMockup } from '../../components/admin/TableStandMockup';
import { getStoredQrHost, setStoredQrHost, fetchLanIpHost, generateTableQrUrl } from '../../utils/qrHelper';

export const AdminQRCodePage: React.FC = () => {
  const { restaurant } = useRestaurantStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('08');
  const [copied, setCopied] = useState(false);
  const [printAllMode, setPrintAllMode] = useState(false);

  // Configuration de l'hôte pour le scan smartphone
  const [baseHost, setBaseHost] = useState<string>(getStoredQrHost());
  const [lanHost, setLanHost] = useState<string | null>(null);
  const [isLoadingLan, setIsLoadingLan] = useState(false);
  const [customHostInput, setCustomHostInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Détection automatique de l'IP du réseau local
  useEffect(() => {
    let isMounted = true;
    setIsLoadingLan(true);
    fetchLanIpHost().then(detected => {
      if (isMounted && detected) {
        setLanHost(detected);
        // Si l'utilisateur est sur localhost et n'a pas encore configuré d'hôte, suggérer l'IP LAN
        const current = getStoredQrHost();
        if (current.includes('localhost') || current.includes('127.0.0.1')) {
          setBaseHost(detected);
          setStoredQrHost(detected);
        }
      }
      if (isMounted) setIsLoadingLan(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectHost = (host: string) => {
    setBaseHost(host);
    setStoredQrHost(host);
    setShowCustomInput(false);
  };

  const handleApplyCustomHost = () => {
    if (!customHostInput.trim()) return;
    let url = customHostInput.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    url = url.replace(/\/+$/, '');
    setBaseHost(url);
    setStoredQrHost(url);
    setShowCustomInput(false);
  };

  const isLocalhost = baseHost.includes('localhost') || baseHost.includes('127.0.0.1');

  // URL QR Code générée
  const qrUrl = generateTableQrUrl(selectedTable, baseHost);

  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintSingle = () => {
    setPrintAllMode(false);
    setTimeout(() => window.print(), 150);
  };

  const handlePrintAll = () => {
    setPrintAllMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintAllMode(false), 1000);
    }, 200);
  };

  const handleDownloadPNG = () => {
    const svgElement = document.querySelector('#printable-stand svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(img, 50, 50, 500, 500);
      }
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `QR-Table-${selectedTable || 'General'}-${restaurant.slug || restaurant.id || 'teranga'}.png`;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
  };

  const totalTables = restaurant.tablesCount || 20;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0 no-print">
        <div className="fixed inset-y-0 w-64">
          <AdminSidebar />
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex no-print">
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
        <div className="no-print">
          <AdminHeader
            title="Studio QR Codes & Tables"
            subtitle="Générez, prévisualisez et imprimez les QR Codes pour chaque table de votre restaurant"
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />
        </div>

        {/* VUE IMPRESSION MULTI-TABLES (Quand printAllMode est actif) */}
        {printAllMode ? (
          <div className="p-8 space-y-12 bg-white">
            <h1 className="text-center font-black text-2xl uppercase mb-8">
              Chevalets QR Codes — Tables 01 à {totalTables} ({restaurant.name})
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {Array.from({ length: totalTables }, (_, i) => {
                const num = String(i + 1).padStart(2, '0');
                const url = generateTableQrUrl(num, baseHost);
                return (
                  <div key={num} className="break-inside-avoid page-break-always py-6 flex justify-center">
                    <TableStandMockup
                      restaurant={restaurant}
                      tableNumber={num}
                      url={url}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <main className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Controls (5 cols) */}
              <div className="lg:col-span-5 space-y-6 no-print">
                <div className="bg-white p-6 rounded-3xl border border-[#EAEAEA] space-y-5 shadow-sm">
                  <div className="flex items-center gap-2 text-[#0A0A0A]">
                    <QrCode className="w-5 h-5" />
                    <h3 className="font-display font-black text-base text-[#0A0A0A]">
                      Configuration du QR Code
                    </h3>
                  </div>

                  {/* Sélecteur d'hôte pour smartphone / réseau Wi-Fi */}
                  <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#EAEAEA] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#0A0A0A] flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Cible réseau du QR Code</span>
                      </label>
                      {lanHost && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Wi-Fi disponible
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {lanHost && (
                        <button
                          type="button"
                          onClick={() => handleSelectHost(lanHost)}
                          className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between border transition-all ${
                            baseHost === lanHost
                              ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-xs'
                              : 'bg-white text-[#444444] border-[#E5E5E5] hover:border-black'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Wifi className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">IP Wi-Fi Smartphone ({lanHost})</span>
                          </div>
                          {baseHost === lanHost && <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSelectHost(window.location.origin)}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between border transition-all ${
                          baseHost === window.location.origin && baseHost !== lanHost
                            ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-xs'
                            : 'bg-white text-[#444444] border-[#E5E5E5] hover:border-black'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Monitor className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Origine navigateur ({window.location.origin})</span>
                        </div>
                        {baseHost === window.location.origin && baseHost !== lanHost && (
                          <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowCustomInput(!showCustomInput)}
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between border transition-all ${
                          showCustomInput || (baseHost !== lanHost && baseHost !== window.location.origin)
                            ? 'bg-neutral-100 text-[#0A0A0A] border-[#0A0A0A]'
                            : 'bg-white text-[#444444] border-[#E5E5E5] hover:border-black'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Globe className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Domaine personnalisé / Production</span>
                        </div>
                        <span className="text-[10px] text-gray-500">Modifier</span>
                      </button>
                    </div>

                    {showCustomInput && (
                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={customHostInput}
                          onChange={e => setCustomHostInput(e.target.value)}
                          placeholder="https://teranga-food.sn"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-[#EAEAEA] text-xs font-mono outline-none focus:border-black bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCustomHost}
                          className="px-3 py-1.5 rounded-lg bg-[#0A0A0A] text-white text-xs font-bold"
                        >
                          Appliquer
                        </button>
                      </div>
                    )}

                    {isLocalhost && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                        <p>
                          <strong>Attention :</strong> Ce QR Code pointe sur <code>localhost</code>. Pour qu’un smartphone connecté au Wi-Fi puisse l'ouvrir, sélectionnez l'adresse IP Wi-Fi ci-dessus.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Table Picker */}
                  <div className="space-y-2">
                    <label className="text-xs text-[#0A0A0A] font-bold">
                      Sélectionner la destination du QR Code
                    </label>
                    <select
                      value={selectedTable}
                      onChange={e => setSelectedTable(e.target.value)}
                      className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#0A0A0A] font-semibold outline-none cursor-pointer"
                    >
                      <option value="">Menu Général (Entrée / Bar / Flyer)</option>
                      {Array.from({ length: totalTables }, (_, i) => {
                        const num = String(i + 1).padStart(2, '0');
                        return (
                          <option key={num} value={num}>
                            Table N° {num} (Chevalet de table)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Direct Link Box */}
                  <div className="space-y-1.5 pt-2 border-t border-[#EEEEEE]">
                    <label className="text-xs text-[#666666] font-medium flex items-center justify-between">
                      <span>Lien direct encodé dans le QR Code</span>
                      <span className="text-[10px] text-emerald-700 font-bold">Prêt pour scan mobile</span>
                    </label>
                    <div className="flex items-center gap-2 bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl p-2">
                      <input
                        type="text"
                        readOnly
                        value={qrUrl}
                        className="flex-1 bg-transparent text-xs text-[#0A0A0A] outline-none select-all font-mono font-medium"
                      />
                      <button
                        onClick={handleCopy}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#EAEAEA] hover:bg-gray-100 text-[#0A0A0A] text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Copier le lien"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copié' : 'Copier'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#EEEEEE] space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handlePrintSingle}
                        className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-sm transition-all active:scale-98"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Imprimer</span>
                      </button>

                      <button
                        onClick={handlePrintSingle}
                        className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-sm transition-all active:scale-98"
                      >
                        <Download className="w-4 h-4" />
                        <span>Télécharger PDF</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleDownloadPNG}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-[#EAEAEA] text-xs font-semibold text-[#0A0A0A] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-[#0A0A0A]" />
                        <span>Télécharger PNG</span>
                      </button>

                      <a
                        href={qrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-[#EAEAEA] text-xs font-semibold text-[#0A0A0A] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#0A0A0A]" />
                        <span>Tester dans nouvel onglet</span>
                      </a>
                    </div>

                    {/* Télécharger tous les QR Codes */}
                    <button
                      onClick={handlePrintAll}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FAFAFA] hover:bg-[#F0F0F0] border border-[#0A0A0A] text-xs font-bold text-[#0A0A0A] transition-colors"
                    >
                      <Layers className="w-4 h-4 text-[#0A0A0A]" />
                      <span>TÉLÉCHARGER TOUS LES QR CODES (TABLES 01 À {totalTables})</span>
                    </button>
                  </div>
                </div>

                {/* Commercial Advantage Box */}
                <div className="p-4 rounded-2xl bg-white border border-[#EAEAEA] shadow-sm text-xs space-y-1.5 text-[#666666]">
                  <p className="font-bold text-[#0A0A0A] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0A0A0A]" />
                    <span>Fonctionnement direct sur smartphone</span>
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Le client scanne avec l’appareil photo de son smartphone (iOS ou Android), accède au menu avec sa table verrouillée, passe commande, et l’alerte retentit instantanément sur l'écran admin et cuisine.
                  </p>
                </div>
              </div>

              {/* Right Stand Mockup (7 cols) */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-4">
                <span className="text-xs uppercase tracking-widest text-[#888888] font-bold no-print">
                  Aperçu du chevalet de table
                </span>

                <div className="w-full flex justify-center">
                  <TableStandMockup
                    restaurant={restaurant}
                    tableNumber={selectedTable}
                    url={qrUrl}
                  />
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};
