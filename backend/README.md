# Facture IA - Backend

Backend NestJS pour la gestion intelligente de factures et dépenses avec IA, conçu pour les PME en Côte d'Ivoire.

## Fonctionnalités

- 📸 **OCR de factures** - Extraction automatique des données depuis des photos/factures
- 🤖 **Classification IA** - Catégorisation automatique des dépenses
- 📊 **Dashboard analytics** - Statistiques et rapports financiers
- 📄 **Export PDF/Excel** - Génération de rapports
- 🔔 **Rappels de paiement** - Notifications pour factures échues
- 💬 **Assistant comptable** - Conseils financiers personnalisés

## Installation

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Configuration

1. Copiez le fichier d'environnement :
```bash
cp .env.example .env
```

2. Modifiez `.env` avec vos paramètres :
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
DB_NAME=facture_ia
JWT_SECRET=votre_secret_jwt_securise
OPENAI_API_KEY=sk-votre-cle-openai (optionnel)
```

3. Installez les dépendances :
```bash
npm install
```

4. Créez la base de données :
```bash
createdb facture_ia
```

5. Lancez le serveur en développement :
```bash
npm run start:dev
```

L'API sera disponible sur `http://localhost:3001`

## API Endpoints

### Authentification
- `POST /auth/register` - Inscription utilisateur
- `POST /auth/login` - Connexion

### Factures
- `POST /invoices` - Créer une facture (avec upload optionnel)
- `GET /invoices` - Liste des factures
- `GET /invoices/analytics` - Statistiques des factures
- `GET /invoices/overdue` - Factures échues
- `GET /invoices/:id` - Détails d'une facture
- `PUT /invoices/:id/status` - Mettre à jour le statut
- `DELETE /invoices/:id` - Supprimer une facture

### Dépenses
- `POST /expenses` - Créer une dépense
- `GET /expenses` - Liste des dépenses
- `GET /expenses/analytics` - Statistiques des dépenses
- `GET /expenses/:id` - Détails d'une dépense
- `PUT /expenses/:id` - Mettre à jour une dépense
- `DELETE /expenses/:id` - Supprimer une dépense

### IA
- `POST /ai/extract-invoice` - Extraire les données d'une facture
- `POST /ai/classify-expense` - Classifier une dépense
- `GET /ai/accounting-advice` - Obtenir des conseils comptables

### Utilisateurs
- `GET /users/profile` - Profil utilisateur
- `PUT /users/profile` - Mettre à jour le profil
- `GET /users/dashboard` - Dashboard utilisateur

## Stack Technique

- **Framework** : NestJS
- **Base de données** : PostgreSQL avec TypeORM
- **Authentification** : JWT + bcrypt
- **IA** : OpenAI GPT-4o (OCR) et GPT-3.5-turbo (classification)
- **Upload** : Multer

## Catégories de dépenses

- alimentation
- transport
- logement
- services
- fournitures
- equipement
- marketing
- autre

## Devises

Par défaut : **XOF** (Franc CFA)

## License

ISC
