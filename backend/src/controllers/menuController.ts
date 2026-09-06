import { Request, Response } from 'express';
import { prisma } from '../config';
import { AuthRequest } from '../middleware/auth';

export const getFullMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        products: {
          where: { isAvailable: true },
          include: {
            options: {
              include: { values: true },
            },
          },
        },
      },
    });

    const parsedCategories = categories.map(c => ({
      ...c,
      products: c.products.map(p => ({
        ...p,
        ingredients: (() => {
          try {
            return JSON.parse(p.ingredients);
          } catch {
            return [p.ingredients];
          }
        })(),
      })),
    }));

    res.json({ categories: parsedCategories });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération du menu', details: err.message });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ categories });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories', details: err.message });
  }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, icon, sortOrder } = req.body;
    const category = await prisma.category.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        icon: icon || '🍲',
        sortOrder: Number(sortOrder) || 0,
      },
    });
    res.status(201).json({ category });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la création de la catégorie', details: err.message });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const category = await prisma.category.update({
      where: { id },
      data,
    });
    res.json({ category });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la catégorie', details: err.message });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la catégorie', details: err.message });
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, search, availableOnly } = req.query;

    const products = await prisma.product.findMany({
      where: {
        categoryId: categoryId ? String(categoryId) : undefined,
        isAvailable: availableOnly === 'true' ? true : undefined,
        OR: search
          ? [
              { name: { contains: String(search) } },
              { description: { contains: String(search) } },
            ]
          : undefined,
      },
      include: {
        category: true,
        options: {
          include: { values: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsedProducts = products.map(p => ({
      ...p,
      ingredients: (() => {
        try {
          return JSON.parse(p.ingredients);
        } catch {
          return [p.ingredients];
        }
      })(),
    }));

    res.json({ products: parsedProducts });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des produits', details: err.message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        options: {
          include: { values: true },
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Produit introuvable' });
      return;
    }

    res.json({
      product: {
        ...product,
        ingredients: (() => {
          try {
            return JSON.parse(product.ingredients);
          } catch {
            return [product.ingredients];
          }
        })(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      categoryId,
      name,
      description,
      price,
      originalPrice,
      imageUrl,
      videoUrl,
      isAvailable,
      isFeatured,
      badge,
      ingredients,
      options,
    } = req.body;

    const product = await (prisma as any).product.create({
      data: {
        categoryId,
        name,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        videoUrl: videoUrl || null,
        isAvailable: isAvailable !== false,
        isFeatured: Boolean(isFeatured),
        badge: badge || null,
        ingredients: Array.isArray(ingredients) ? JSON.stringify(ingredients) : JSON.stringify([ingredients || '']),
        options: options && Array.isArray(options)
          ? {
              create: options.map((opt: any) => ({
                name: opt.name,
                required: Boolean(opt.required),
                minSelect: Number(opt.minSelect) || 0,
                maxSelect: Number(opt.maxSelect) || 1,
                values: {
                  create: (opt.values || []).map((v: any) => ({
                    name: v.name,
                    extraPrice: Number(v.extraPrice) || 0,
                    isDefault: Boolean(v.isDefault),
                  })),
                },
              })),
            }
          : undefined,
      },
      include: {
        options: { include: { values: true } },
      },
    });

    res.status(201).json({ product });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la création du produit', details: err.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { ingredients, price, originalPrice, ...data } = req.body;

    const updateData: any = { ...data };
    if (price !== undefined) updateData.price = Number(price);
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice ? Number(originalPrice) : null;
    if (ingredients !== undefined) {
      updateData.ingredients = Array.isArray(ingredients) ? JSON.stringify(ingredients) : JSON.stringify([ingredients]);
    }

    const product = await (prisma as any).product.update({
      where: { id },
      data: updateData,
      include: {
        options: { include: { values: true } },
      },
    });

    res.json({ product });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit', details: err.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur lors de la suppression du produit', details: err.message });
  }
};
