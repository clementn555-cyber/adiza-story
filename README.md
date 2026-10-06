# Adiza Story

Projet V1 d'un site de lecture d'histoires en HTML/CSS/JavaScript.

## 1. Tester immédiatement

Ouvre `index.html` avec VS Code + Live Server.

La V1 contient un petit mode démo : tu peux créer des histoires depuis `admin/dashboard.html` > `Nouvelle histoire`. Les données de cette démonstration sont stockées dans le navigateur (localStorage).

## 2. Passage à la version en ligne

Pour que les histoires soient réellement partagées entre tous les visiteurs et que tu puisses les publier depuis n'importe quel appareil, il faut connecter Supabase.

Étapes :
1. Créer un projet Supabase.
2. Créer les tables `categories`, `stories`, `chapters`.
3. Configurer Supabase Auth pour ton compte administrateur.
4. Configurer RLS pour autoriser la lecture publique des histoires publiées et réserver les écritures à l'administrateur.
5. Ajouter l'URL et la clé `anon public` dans `js/config.js`.
6. Remplacer le gestionnaire local de `admin/admin.js` par les requêtes Supabase.
7. Connecter le dépôt GitHub à Netlify.

## 3. Important

Ne mets jamais la clé `service_role` Supabase dans le frontend.

## 4. Déploiement Netlify

Le projet est déjà accompagné d'un `netlify.toml`. Tu peux pousser le dossier vers GitHub puis importer le dépôt dans Netlify. Le dossier publié est la racine du projet.

## 5. Prochaine étape

La prochaine version doit remplacer le mode local par :
- Supabase Database
- Supabase Auth
- Supabase Storage pour les couvertures
- RLS
- création/modification/suppression de chapitres
- brouillons/publication
- recherche en base
- audio optionnel
