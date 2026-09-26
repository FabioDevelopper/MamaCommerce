# Sokho Viandes — application de gestion commerciale

Application full-stack pour le commerce de viande Sénégal → Togo.

## Stack
- Next.js 16.3.5
- React 19.3.0
- TypeScript 5.9
- Tailwind CSS 4.1
- Express 5.2.1
- Prisma ORM 7.10.0
- MySQL 8.x / MariaDB compatible
- JWT + bcrypt

Les versions Prisma 7 utilisent le générateur `prisma-client`, `prisma.config.ts` et l'adaptateur MariaDB pour MySQL. Voir la documentation officielle Prisma sur MySQL et Prisma 7.

## 1. Créer la base MySQL

Dans MySQL/phpMyAdmin :

```sql
CREATE DATABASE sokho_viandes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Tu peux créer un utilisateur dédié plutôt que d'utiliser root.

## 2. Configurer le backend

```bash
cd backend
copy .env.example .env
```

Puis ouvre `backend/.env` :

```env
DATABASE_URL="mysql://root:TON_MOT_DE_PASSE@localhost:3306/sokho_viandes"
JWT_SECRET="une-longue-cle-secrete-aleatoire"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

Le mot de passe et les identifiants restent uniquement dans `.env` et ne doivent jamais être envoyés sur GitHub.

## 3. Installer et créer les tables

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

API : `http://localhost:4000`

## 4. Configurer le frontend

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Application : `http://localhost:3000`

## Compte de démonstration

Après `npm run seed` :

- Email : `admin@sokho-viandes.tg`
- Mot de passe : `ChangeMe123!`

Change ce mot de passe avant toute utilisation réelle.

## Modules inclus

- Authentification
- Tableau de bord
- Commandes et pesée
- Paiements et crédits
- Clients
- Produits
- Stock et alertes
- Fournisseurs
- Arrivages Sénégal → Togo
- Dépenses
- Rapports financiers
- Paramètres utilisateur
- API REST
- Calcul automatique des totaux, paiements et crédits
- Mouvements de stock à la validation des arrivages et ventes

## Important

La balance Bluetooth, les SMS et WhatsApp ne sont pas simulés comme des intégrations réelles. Les points d'intégration sont volontairement séparés afin qu'un vrai fournisseur/API puisse être ajouté ensuite.

## Référence Stitch

`code-stitch-reference.html` et `DESIGN-stitch-reference.md` sont conservés dans le dépôt comme référence visuelle. Le prototype Stitch utilise notamment Inter, une palette verte/rouge/neutre, des contrôles de pesée d'au moins 48px et une interface pensée pour l'utilisation mobile sur le terrain.
