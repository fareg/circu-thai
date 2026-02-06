# Déploiement CircuThai sur Vercel

## 1. Préparer le dépôt
1. Vérifier que `npm run test` passe en local.
2. Commiter/pousser le dossier `circu-thai/` sur GitHub (ou GitLab/Bitbucket).

## 2. Créer le projet Vercel
1. Aller sur <https://vercel.com> → **Add New Project**.
2. Sélectionner le dépôt, garder les réglages Next.js par défaut :
   - Install command : `npm install`
   - Build command : `npm run build`
   - Output : `Next.js`
3. Branch à déployer : `main` (ou la branche principale du repo).

## 3. Variables d’environnement
Dans **Settings → Environment Variables**, ajouter les clés issues de `.env.local` :
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```
Copier les valeurs fournies par la console Firebase (section Project Settings → SDK setup & config). Répéter pour chaque environnement (Production, Preview, Development) si besoin.

## 4. Initialiser Firestore
1. Depuis la console Firebase, créer la base Firestore (mode Production, choisir la région).
2. Déployer des règles adaptées (lecture/écriture sécurisées). Pour le développement uniquement, des règles ouvertes peuvent être utilisées temporairement.
3. Localement, exécuter `npm run seed` avec `.env.local` afin de peupler les collections `exercises` et `programs`. Cette commande peut être relancée sans risque : elle n’ajoute que les documents manquants et affiche ce qui a été fait.
4. Vérifier dans la console Firestore que les collections contiennent les programmes attendus (dont `aqua-guided-20`).

## 5. Lancer le déploiement
1. Cliquer sur **Deploy** dans Vercel. La build installe les dépendances, exécute `npm run build` puis publie l’application.
2. Une fois la build terminée, tester `https://<slug>.vercel.app/fr` et `…/programs` pour s’assurer que les données Firestore remontent.

## 6. Étapes post-déploiement recommandées
- Activer Vercel Analytics / Logs pour suivre les événements `program.create`/`program.delete`.
- Mettre à jour les règles Firestore pour restreindre les écritures accessibles publiquement.
- Configurer un second projet Firebase (optionnel) si l’environnement de production doit être isolé des seeds locaux.
- Documenter les mises à jour dans ce fichier si le flux change (ex : scripts supplémentaires, extensions Vercel, etc.).
