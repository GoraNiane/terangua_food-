import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Video,
  Film,
  Camera,
  Play,
  ExternalLink,
} from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Product } from '../../types';
import { formatFCFA } from '../../services/whatsappService';
import { VideoPlayer } from '../../components/common/VideoPlayer';

const DAKAR_PHOTO_PRESETS = [
  { label: 'Thiéboudienne', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Yassa Poulet', url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dibi d\'Agneau', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
  { label: 'Pastels Dorés', url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80' },
  { label: 'Jus de Bissap', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80' },
  { label: 'Burger Gourmet', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
];

const VIDEO_PRESETS = [
  { label: '🍲 Vidéo Cuisson au Wok (MP4)', url: 'https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-vegetables-in-a-pan-41584-large.mp4' },
  { label: '🍽️ Vidéo Service en Salle (MP4)', url: 'https://assets.mixkit.co/videos/preview/mixkit-serving-dinner-to-a-customer-in-a-restaurant-42714-large.mp4' },
  { label: '🥩 Vidéo Découpe & Viande (MP4)', url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-chef-cutting-a-piece-of-meat-41587-large.mp4' },
];

export const AdminProductsPage: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, toggleProductAvailability } =
    useRestaurantStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    videoUrl: '',
    ingredients: '',
    badge: '' as Product['badge'] | '',
    isAvailable: true,
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: categories[0]?.id || '',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      videoUrl: '',
      ingredients: '',
      badge: '',
      isAvailable: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      videoUrl: product.videoUrl || '',
      ingredients: product.ingredients.join(', '),
      badge: product.badge || '',
      isAvailable: product.isAvailable,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(formData.price.replace(/\D/g, ''), 10) || 0;
    const ingredientsArr = formData.ingredients
      .split(',')
      .map(i => i.trim())
      .filter(Boolean);
    const videoUrlClean = formData.videoUrl.trim() || undefined;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        description: formData.description,
        price: priceNum,
        categoryId: formData.categoryId,
        imageUrl: formData.imageUrl,
        videoUrl: videoUrlClean,
        ingredients: ingredientsArr,
        badge: (formData.badge as Product['badge']) || undefined,
        isAvailable: formData.isAvailable,
      });
    } else {
      addProduct({
        name: formData.name,
        description: formData.description,
        price: priceNum,
        categoryId: formData.categoryId,
        imageUrl: formData.imageUrl,
        videoUrl: videoUrlClean,
        ingredients: ingredientsArr,
        badge: (formData.badge as Product['badge']) || undefined,
        isAvailable: formData.isAvailable,
        optionGroups: [],
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Confirmez-vous la suppression définitive du plat "${name}" ?`)) {
      deleteProduct(id);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;
    return matchesCat && (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  });

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
          title="Catalogue des produits"
          subtitle="Gérez la carte, les prix en FCFA, les photos et les disponibilités"
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
          {/* Top Bar: Search, Category Filter & Add CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un plat..."
                  className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#0A0A0A] placeholder:text-[#999999] outline-none shadow-sm"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                aria-label="Catégorie"
                className="bg-white border border-[#EAEAEA] rounded-2xl px-3 py-2.5 text-xs text-[#0A0A0A] font-semibold outline-none focus:border-[#0A0A0A] cursor-pointer shadow-sm"
              >
                <option value="ALL">Toutes les catégories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0A0A0A] hover:bg-[#222222] text-white font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Ajouter un plat</span>
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              const cat = categories.find(c => c.id === product.categoryId);

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-sm ${
                    product.isAvailable
                      ? 'border-[#EAEAEA] hover:border-[#0A0A0A]'
                      : 'border-red-200 opacity-70'
                  }`}
                >
                  <div>
                    {/* Image & Quick Badges */}
                    <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {product.badge && (
                        <span className="absolute top-2.5 left-2.5 bg-[#0A0A0A] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                          {product.badge}
                        </span>
                      )}

                      {product.videoUrl && (
                        <span className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-white/20">
                          <Video className="w-3 h-3" />
                          <span>Vidéo</span>
                        </span>
                      )}

                      {cat && (
                        <span className="absolute bottom-2.5 left-2.5 text-[10px] text-white font-medium bg-black/75 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                          {cat.name}
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display font-bold text-sm text-[#0A0A0A] line-clamp-1">
                          {product.name}
                        </h4>
                        <span className="font-black text-sm text-[#0A0A0A] whitespace-nowrap">
                          {formatFCFA(product.price)}
                        </span>
                      </div>

                      <p className="text-xs text-[#666666] line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 bg-[#FAFAFA] border-t border-[#EEEEEE] flex items-center justify-between">
                    {/* Availability toggle */}
                    <button
                      onClick={() => toggleProductAvailability(product.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                        product.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {product.isAvailable ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{product.isAvailable ? 'Disponible' : 'Rupture'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="w-8 h-8 rounded-lg bg-white border border-[#EAEAEA] hover:bg-gray-100 text-[#0A0A0A] flex items-center justify-center transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="w-8 h-8 rounded-lg bg-white border border-[#EAEAEA] hover:bg-red-50 text-[#0A0A0A] hover:text-red-600 flex items-center justify-center transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-[#EAEAEA] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-[#EEEEEE] flex items-center justify-between">
              <h3 className="font-display font-black text-lg text-[#0A0A0A]">
                {editingProduct ? 'Modifier le plat' : 'Ajouter un plat au menu'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#0A0A0A] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 overflow-y-auto no-scrollbar space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[#0A0A0A] font-bold">Nom du plat *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Poulet Braisé Teranga"
                  className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2 text-xs text-[#0A0A0A] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-[#0A0A0A] font-bold">Prix en FCFA *</label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Ex: 4500"
                    className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2 text-xs text-[#0A0A0A] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#0A0A0A] font-bold">Catégorie *</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2 text-xs text-[#0A0A0A] outline-none cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#0A0A0A] font-bold">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description alléchante du plat..."
                  className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl p-3 text-xs text-[#0A0A0A] outline-none resize-none"
                />
              </div>

              {/* Photo du plat & Presets */}
              <div className="space-y-2 p-3.5 bg-[#FAFAFA] border border-[#EEEEEE] rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#0A0A0A] font-bold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#0A0A0A]" />
                    <span>Photo du plat *</span>
                  </label>
                  <span className="text-[10px] text-[#888888]">Presets rapides</span>
                </div>

                <div className="flex gap-3 items-center">
                  {/* Photo Preview Thumbnail */}
                  <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-[#EAEAEA] relative">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Camera className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="url"
                      required
                      value={formData.imageUrl}
                      onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3 py-2 text-xs text-[#0A0A0A] outline-none"
                    />
                    <div className="flex flex-wrap gap-1">
                      {DAKAR_PHOTO_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                          className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                            formData.imageUrl === preset.url
                              ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                              : 'bg-white text-[#666666] border-[#EAEAEA] hover:border-[#0A0A0A]'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vidéo du plat (Optionnelle) */}
              <div className="space-y-2.5 p-3.5 bg-[#FAFAFA] border border-[#EEEEEE] rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#0A0A0A] font-bold flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-amber-500" />
                    <span>Vidéo culinaire (MP4 direct, YouTube, Vimeo)</span>
                  </label>
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                    Optionnel
                  </span>
                </div>

                <div className="space-y-2">
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="Ex: https://.../video.mp4 ou https://youtube.com/watch?v=..."
                    className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3 py-2 text-xs text-[#0A0A0A] outline-none"
                  />

                  {/* Preset video buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-[#888888] font-medium">Exemples :</span>
                    {VIDEO_PRESETS.map((vp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, videoUrl: vp.url })}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                          formData.videoUrl === vp.url
                            ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                            : 'bg-white text-[#666666] border-[#EAEAEA] hover:border-[#0A0A0A]'
                        }`}
                      >
                        {vp.label}
                      </button>
                    ))}
                    {formData.videoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, videoUrl: '' })}
                        className="text-[10px] text-red-500 hover:text-red-700 underline ml-auto"
                      >
                        Effacer
                      </button>
                    )}
                  </div>

                  {/* Live Video Player Preview in modal */}
                  {formData.videoUrl.trim() && (
                    <div className="mt-2 space-y-1">
                      <span className="text-[10px] text-[#666666] font-semibold flex items-center gap-1">
                        <Play className="w-3 h-3 text-amber-500" />
                        <span>Aperçu vidéo en direct :</span>
                      </span>
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#EAEAEA] shadow-inner">
                        <VideoPlayer
                          url={formData.videoUrl}
                          title="Aperçu vidéo"
                          className="w-full h-full object-cover"
                          autoPlay={false}
                          muted={true}
                          controls={true}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-[#0A0A0A] font-bold">Badge spécial</label>
                  <select
                    value={formData.badge || ''}
                    onChange={e => setFormData({ ...formData, badge: e.target.value as any })}
                    className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2 text-xs text-[#0A0A0A] outline-none cursor-pointer"
                  >
                    <option value="">Aucun</option>
                    <option value="Chef">Chef</option>
                    <option value="Populaire">Populaire</option>
                    <option value="Nouveau">Nouveau</option>
                    <option value="Épicé">Épicé</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#0A0A0A] font-bold">Disponibilité</label>
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="isAvail"
                      checked={formData.isAvailable}
                      onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="w-4 h-4 accent-[#0A0A0A] rounded"
                    />
                    <label htmlFor="isAvail" className="text-xs text-[#666666] font-medium cursor-pointer">
                      Actif et commandable
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#0A0A0A] font-bold">
                  Ingrédients (séparés par une virgule)
                </label>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="Riz, Poulet, Oignons caramélisés, Épices"
                  className="w-full bg-white border border-[#EAEAEA] focus:border-[#0A0A0A] rounded-xl px-3.5 py-2 text-xs text-[#0A0A0A] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#EEEEEE] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#666666] hover:text-[#0A0A0A]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A0A0A] hover:bg-[#222222] text-white font-bold text-xs shadow-sm"
                >
                  {editingProduct ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
