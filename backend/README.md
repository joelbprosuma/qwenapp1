# Gestion Intelligente de Factures & Dépenses IA - Backend

Backend NestJS pour l'application de gestion de factures et dépenses avec IA.

## Fonctionnalités

- **Authentification** : Inscription/Connexion avec JWT
- **OCR Intelligent** : Extraction automatique des données de factures via OpenAI
- **Classification IA** : Catégorisation automatique des dépenses
- **Gestion des factures** : CRUD complet avec statuts et rappels
- **Gestion des dépenses** : Suivi avec classification automatique
- **Analytics** : Tableaux de bord et rapports
- **Export** : PDF et Excel (à implémenter)

## Installation

### Prérequis

- Node.js >= 18
- PostgreSQL >= 14
- npm ou yarn

### Étapes

1. Installer les dépendances :
```bash
npm install
```

2. Configurer l'environnement :
```bash
cp .env.example .env
# Modifier les valeurs dans .env selon votre configuration
```

3. Démarrer la base de données PostgreSQL

4. Lancer le serveur en développement :
```bash
npm run start:dev
```

L'API sera disponible sur `http://localhost:3001`

## API Endpoints

### Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion

### Utilisateurs
- `GET /users/profile` - Profil utilisateur
- `PUT /users/profile` - Mise à jour profil
- `GET /users/dashboard` - Dashboard

### Factures
- `POST /invoices` - Créer une facture (avec upload)
- `GET /invoices` - Liste des factures
- `GET /invoices/analytics` - Analytics factures
- `GET /invoices/overdue` - Factures en retard
- `GET /invoices/:id` - Détail facture
- `PUT /invoices/:id/status` - Changer statut
- `DELETE /invoices/:id` - Supprimer facture

### Dépenses
- `POST /expenses` - Créer une dépense (avec upload)
- `GET /expenses` - Liste des dépenses
- `GET /expenses/analytics` - Analytics dépenses
- `GET /expenses/:id` - Détail dépense
- `PUT /expenses/:id` - Modifier dépense
- `DELETE /expenses/:id` - Supprimer dépense

### IA
- `POST /ai/extract-invoice` - Extraire données facture
- `POST /ai/classify-expense` - Classifier dépense
- `GET /ai/accounting-advice` - Conseils comptables

## Structure du projet

```
src/
├── common/
│   ├── dto/          # Data Transfer Objects
│   └── guards/       # Guards d'authentification
├── entities/         # Entités TypeORM
├── modules/
│   ├── auth/         # Module authentification
│   ├── users/        # Module utilisateurs
│   ├── invoices/     # Module factures
│   ├── expenses/     # Module dépenses
│   └── ai/           # Module IA
├── app.module.ts
└── main.ts
```

## Stack Technique

- **Framework** : NestJS
- **Base de données** : PostgreSQL + TypeORM
- **Authentification** : JWT + Passport
- **IA** : OpenAI API (GPT-4o pour OCR, GPT-3.5 pour classification)
- **Upload** : Multer

## Développement

### Ajouter une clé OpenAI (optionnel)

Pour activer les fonctionnalités IA réelles :
1. Obtenez une clé API sur https://platform.openai.com
2. Ajoutez-la dans `.env` : `OPENAI_API_KEY=sk-...`

Sans clé API, le système utilise des données mockées pour le développement.

### Catégories de dépenses supportées

- alimentation
- transport
- logement
- services
- fournitures
- equipement
- marketing
- autre

## Licence

MIT
