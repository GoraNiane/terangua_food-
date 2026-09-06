import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma, config } from '../config';
import { AuthRequest } from '../middleware/auth';
import { recordFailedLogin, resetLoginAttempts } from '../middleware/rateLimiter';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      recordFailedLogin(req);
      res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    // Recherche de l'utilisateur dans la base de données
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      recordFailedLogin(req);
      // Message générique pour ne pas divulguer si l'email existe ou non
      res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      recordFailedLogin(req);
      // Message générique identique
      res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      return;
    }

    // Réinitialisation du compteur de tentatives échouées en cas de succès
    resetLoginAttempts(req);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Une erreur est survenue lors de la tentative de connexion.' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Session terminée avec succès.' });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'Veuillez saisir une adresse email valide.' });
    return;
  }

  // Réponse générique ne confirmant pas publiquement l'existence du compte
  res.json({
    message: 'Si cette adresse correspond à un compte administrateur actif, les instructions de réinitialisation sécurisée vous ont été transmises.',
  });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable' });
      return;
    }

    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
};
