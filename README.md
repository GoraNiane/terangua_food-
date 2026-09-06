# 🍽️ TERANGA FOOD — Restaurant Digital

> **Application digitale complète pour un restaurant unique**  
> **Conçue & Développée par GORATECH** • *Solutions numériques pour les entreprises.*  
> **Établissement :** **TERANGA FOOD** — Dakar, Sénégal (*« Le goût du Sénégal, à chaque bouchée. »*)  
> **Direction Artistique :** **Blanc Dominant (80%) + Noir Premium (15%) + Gris (5%)**

---

## 🌟 1. Vision du Projet

**TERANGA FOOD** est un système digital complet dédié à un restaurant unique. Il permet à un client de vivre toute son expérience restaurant directement depuis son smartphone, tout en offrant à l'équipe en salle, en cuisine et à la direction des outils de gestion en temps réel.

### Le Parcours Principal :
```text
QR CODE (Table 08) ➔ BIENVENUE TABLE 08 ➔ MENU DIGITAL ➔ PERSONNALISATION DU PLAT
       ➔ PANIER ➔ COMMANDE ➔ WHATSAPP ➔ CUISINE KDS (Notification 🔔)
       ➔ ACCEPTER ➔ EN PRÉPARATION ➔ COMMANDE PRÊTE ➔ SERVIE ➔ AVIS CLIENT 5★
```

### Parcours Côté Restaurant :
```text
COMMANDE EN DIRECT ➔ ÉCRAN CUISINE (KDS) ➔ SERVEUR ➔ STATISTIQUES EN TEMPS RÉEL ➔ SMART INSIGHTS
```

---

## 🎨 2. Direction Artistique : Blanc Dominant + Noir Premium

L'interface a été conçue selon une esthétique épurée, moderne et minimaliste :
* **80% Blanc / Blanc cassé** (`#FFFFFF`, `#FAFAFA`, `#F2F2F2`) : Clarté, élégance, respiration visuelle.
* **15% Noir profond** (`#0A0A0A`, `#111111`) : Typographie bold percutante, boutons d'action (CTAs), badges contrastés, bandeau promotionnel.
* **5% Gris** (`#EAEAEA`, `#888888`, `#333333`) : Séparateurs fins 1px, états au survol, métadonnées.
* **Zéro doré, zéro néon, zéro couleur criarde.**

---

## 🚀 3. Parcours de Démonstration Commerciale (en moins de 2 minutes)

1. **Scanner le QR Code de la Table 08** : Ouvrir `http://localhost:5173/menu?table=08`.
2. **Accueil personnalisé** : Le bandeau indique discrètement : *« Bienvenue à la table 08 👋 »*.
3. **Parcourir le menu** : Consulter les plats sénégalais et sélectionner le **Poulet braisé**.
4. **Personnaliser** : Choisir *Frites croustillantes* et *Sauce piquante*.
5. **Ajouter au panier** : Ajouter également un **Jus de bissap**.
6. **Commander** : Confirmer la commande sans formulaire lourd.
7. **Réception en Cuisine** : L'écran KDS (`/admin/kitchen`) émet un carillon sonore et affiche : `NOUVELLE COMMANDE #1042`.
8. **Progression des statuts** :
   - Cuisine clique **ACCEPTER & PASSER EN CUISINE**
   - Cuisine clique **MARQUER COMME PRÊTE 🔔**
   - Le téléphone du client affiche en direct : **VOTRE COMMANDE EST PRÊTE ✓**
   - Cuisine clique **SERVIE AU CLIENT / LIVRÉE**
9. **Avis Client** : Le client peut immédiatement attribuer 5 étoiles avec son commentaire.

---

## 📱 4. Univers Client Mobile-First

* **Bandeau Promotionnel Défilant (`PromotionalMarquee`)** : En tête de page, noir à texte blanc avec défilement infini et pause au survol.
* **Vitrine & Hero Éditorial 2 Colonnes** : Typographie géante, vidéo culinaire intégrée avec badge *« Cuisine en direct »*, double CTA.
* **Carte Gastronomique (20+ Plats Réels)** : Thiéboudienne, Yassa Poulet, Mafé, Poulet Braisé, Dibi d'agneau, Burgers Dakar, Jus de Bissap, Bouye, Gingembre, Thiakry, etc.
* **Détection Automatique de Table** : Prise en charge des URL `/menu?table=01` à `/menu?table=20`.
* **Panier Persistant & Drawer Coulissant** : Modification des quantités et totaux en temps réel.
* **Génération WhatsApp Automatique** : Message préformaté prêt à être envoyé avec détails, heure, table et instructions spéciales.
* **Page de Suivi en Direct (`/order/:orderId`)** : Timeline 5 étapes (*Reçue ➔ Acceptée ➔ En préparation ➔ Prête ➔ Servie*) et formulaire d'avis intégré.
* **Reçu Numérique Dédié (`/receipt/:orderId`)** : Reçu ticket officiel avec QR code et bouton de partage.
* **Ticket Thermique Standard (80mm)** : Fenêtre d'impression formatée au millimètre pour imprimantes de caisse réelles (Epson, Xprinter).

---

## 🏢 5. Espace Restaurant & Administration

* **Tableau de Bord (`/admin`)** : KPI calculés en temps réel (CA, Commandes, Panier moyen), graphiques Recharts monochromes noir/gris et flux de commandes.
* **Écran Cuisine KDS (`/admin/kitchen`)** : 4 colonnes (*Nouvelles*, *En préparation*, *Prêtes*, *Servies*), minuteurs d'attente, bouton plein écran et alerte sonore Web Audio API avec bouton *« Tester Buzzer »*.
* **Gestion des Commandes (`/admin/orders`)** : Filtres par statut, recherche instantanée, bouton d'impression ticket 80mm et **Exportation Comptable CSV (Excel) en 1 clic**.
* **Catalogue Produits & Catégories (`/admin/products`, `/admin/categories`)** : CRUD complet, rupture de stock instantanée, personnalisations d'ingrédients.
* **Plan de Salle (Tables 01 à 20) (`/admin/tables`)** : Statuts en temps réel (*Libre*, *Occupée*, *Réservée*).
* **Studio QR Codes (`/admin/qrcodes`)** : Générateur par table avec maquette de chevalet de table imprimable noir & blanc.
* **Statistiques & Analyses (`/admin/statistics`)** : CA, top 5 des plats les plus vendus et carte d'affluence des heures de pointe (12h-14h et 19h-22h).
* **Smart Insights (`/admin/insights`)** : Recommandations opérationnelles automatiques basées sur les tendances de vente.
* **Score Digital (92/100) (`/admin/score`)** : Évaluation de la maturité digitale de l'établissement.
* **Avis Clients (`/admin/reviews`)** : Note moyenne 4.8/5, taux de satisfaction et outil de réponse aux clients.
* **Paramètres de l'Établissement (`/admin/settings`)** : Modification du nom, adresse, horaires et numéro WhatsApp de réception (`221774888464`).

---

## 🔐 6. Compte Administrateur Démo

Pour la démonstration locale :
* **Email :** `admin@terangafood.demo`
* **Mot de passe :** `Demo@12345`

Un bouton d'accès rapide est également disponible sur la page `/admin/login`.

---

## 🛠️ 7. Stack Technique

### Frontend :
* **Framework :** React 18, TypeScript, Vite
* **Styling :** Tailwind CSS (Palette monochrome White/Off-white/Black/Gray), CSS Vanilla
* **Icônes :** Lucide React
* **Routage :** React Router DOM v6
* **Graphiques :** Recharts (Thème monochrome haute lisibilité)
* **Utilitaires :** `qrcode.react`, `canvas-confetti`, Web Audio API

### Backend :
* **Serveur :** Node.js, Express, TypeScript
* **Temps Réel :** Socket.IO (Salles de cuisine et de commande)
* **Base de Données :** PostgreSQL + Prisma ORM
* **Sécurité :** JWT, bcrypt, CORS, validation Zod

---

## 🚀 8. Guide d'Installation & de Lancement

### 1. Cloner ou ouvrir le projet :
```bash
cd "c:\terangua food"
```

### 2. Configuration Backend :
```bash
cd backend
cp .env.example .env
npm install
```
*Vérifier la variable `DATABASE_URL` dans le fichier `.env` si vous utilisez PostgreSQL en local.*

### 3. Migration Prisma & Données de Démonstration (Seed) :
```bash
npx prisma generate
npx prisma db push
npm run seed
```

### 4. Lancement du Backend :
```bash
npm run dev
```
*Le serveur API démarre sur `http://localhost:5000` avec WebSocket activé.*

### 5. Installation & Lancement du Frontend :
Dans un nouveau terminal :
```bash
cd "c:\terangua food\frontend"
npm install
npm run dev
```
*L'application s'ouvre sur `http://localhost:5173`.*

### 6. Validation du Build de Production :
```bash
# Dans le dossier frontend :
npm run build

# Dans le dossier backend :
npm run build
```
*Les deux projets compilent avec un code de sortie 0 et zéro erreur TypeScript.*

---

## 🔗 9. URLs Rapides de Démonstration

| Interface | URL Directe |
| :--- | :--- |
| **Accueil Client** | [http://localhost:5173](http://localhost:5173) |
| **Menu Digital (Table 08)** | [http://localhost:5173/menu?table=08](http://localhost:5173/menu?table=08) |
| **Suivi de Commande Client** | [http://localhost:5173/order/1042](http://localhost:5173/order/1042) |
| **Reçu Digital & Ticket Thermique** | [http://localhost:5173/receipt/1042](http://localhost:5173/receipt/1042) |
| **Connexion Admin** | [http://localhost:5173/admin/login](http://localhost:5173/admin/login) |
| **Dashboard Restaurant** | [http://localhost:5173/admin](http://localhost:5173/admin) |
| **Écran Cuisine KDS** | [http://localhost:5173/admin/kitchen](http://localhost:5173/admin/kitchen) |
| **Plan des Tables** | [http://localhost:5173/admin/tables](http://localhost:5173/admin/tables) |
| **Studio QR Codes & Chevalets** | [http://localhost:5173/admin/qrcode](http://localhost:5173/admin/qrcode) |
| **Statistiques des Ventes** | [http://localhost:5173/admin/statistics](http://localhost:5173/admin/statistics) |
| **Smart Insights & Heures d'Affluence** | [http://localhost:5173/admin/insights](http://localhost:5173/admin/insights) |

---

## 🚀 10. Déploiement Unifié en 1 Seul Service (Frontend + Backend)

L'architecture de **TERANGA FOOD** permet de déployer l'intégralité du système (**Frontend React + Backend Express + WebSockets KDS Cuisine**) en **une seule application unifiée**, sur un seul domaine et un seul port :

```text
                                  ┌───────────────────────────────┐
                                  │      DOMAINE UNIQUE           │
                                  │  https://teranga.onrender.com │
                                  └──────────────┬────────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        │                                                 │
                        ▼                                                 ▼
             [ FRONTEND REACT (Vite) ]                         [ BACKEND EXPRESS ]
       - Accueil & Menu Client (/menu)                  - API REST (/api/*)
       - Panier & Commande (/checkout)                  - WebSockets Cuisine (/socket.io)
       - Espace Admin & Tables (/admin/*)               - Base de Données (Prisma / MariaDB)
       - Écran Cuisine KDS (/kitchen)                   - Sécurité JWT & Authentification
```

### Avantages majeurs :
* **Un seul hébergement / un seul compte** (zéro configuration CORS complexe).
* **WebSockets persistants** : Le buzzer et les alertes de cuisine KDS fonctionnent en direct sans interruption.
* **Un seul push Git** : Tout se compile et se déploie automatiquement ensemble.

---

### Option A : Déploiement en 1 Clic sur Render.com (Gratuit & Recommandé)

1. Poussez votre code sur GitHub :
   ```bash
   git add .
   git commit -m "feat: unified deployment setup"
   git push origin main
   ```
2. Rendez-vous sur [Render.com](https://render.com) et connectez votre compte GitHub.
3. Cliquez sur **New +** ➔ **Web Service** et sélectionnez votre dépôt `teranga-food`.
4. Configurez les paramètres :
   * **Runtime :** `Node`
   * **Build Command :** `npm run build`
   * **Start Command :** `npm start`
5. Dans la section **Environment Variables**, ajoutez :
   * `NODE_ENV` = `production`
   * `DATABASE_URL` = `votre-url-mysql-production` (ex: Railway, Aiven, TiDB Cloud, Clever Cloud)
   * `JWT_SECRET` = `teranga_food_secret_key_luxury_dakar_2026`
6. Cliquez sur **Create Web Service** : Votre site et votre API sont en ligne sous une adresse unique !

---

### Option B : Déploiement en 1 Clic sur Railway.app

1. Rendez-vous sur [Railway.app](https://railway.app).
2. Cliquez sur **New Project** ➔ **Deploy from GitHub repo**.
3. Railway détecte automatiquement le `Dockerfile` inclus à la racine.
4. Ajoutez un plugin **MySQL** en 1 clic dans votre projet Railway (la variable `DATABASE_URL` sera connectée automatiquement).
5. Tout est déployé en moins de 2 minutes !

---

### Option C : Déploiement avec Docker (VPS, Ubuntu, Cloud Run)

Un `Dockerfile` optimisé multi-stage est disponible à la racine :

```bash
# 1. Construire l'image Docker unifiée :
docker build -t teranga-food .

# 2. Lancer le conteneur en production :
docker run -d -p 5000:5000 \
  -e DATABASE_URL="mysql://user:pass@host:3306/teranga_food_db" \
  -e JWT_SECRET="votre_secret_jwt" \
  --name teranga-app teranga-food
```

---

> **TERANGA FOOD** — Une solution digitale conçue par **GORATECH** (*Solutions numériques pour les entreprises*).

