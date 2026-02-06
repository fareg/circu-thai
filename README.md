## CircuThai — Exercise Programming App

CircuThai est une application Next.js 15 (App Router) qui aide les praticiens et patients a composer, enregistrer et executer des sequences d'exercices favorisant le drainage lymphatique. L'interface mobile-first combine catalogue preseeded, assembleur visuel, piste audio (Web Audio API + Howler), timers precis et persistence Firebase Firestore temps reel, avec i18n FR/EN via next-intl.

### Pile technique
- Next.js 15 + React Server Components deployable sur Vercel
- Tailwind CSS personnalise, Space Grotesk, animations vitre/glass
- Firebase Firestore pour stocker exercices/programmes/sessions, export/import JSON
- Zustand pour futur etat global (hook audio dedie deja disponible)
- next-intl (FR par defaut) pour nav/flows, Radix UI pour primitives acces
- Web Audio API + Howler pour beep, TTS et musique de fond
- Vitest + Testing Library + mocks Firestore pour tests unitaires

### Scripts npm
- `npm run dev` : demarre le serveur Next.js sur http://localhost:3000 (redirige automatiquement vers `/fr`).
- `npm run build` : compile l'app pour la production.
- `npm start` : lance le build genere (utile pour tester localement avant Vercel).
- `npm run lint` : verifie les regles ESLint configurees par Next.
- `npm run test` : execute les tests Vitest (timer + helpers Firestore) en environnement node.
- `npm run seed` : injecte le catalogue d'exercices et les programmes par defaut dans Firestore.

### Tester en local
1. `npm install`
2. Creer `.env.local` a la racine du dossier `circu-thai/` avec les cles `NEXT_PUBLIC_FIREBASE_*` fournies par la console Firebase.
3. `npm run seed` (a executer une fois par environnement pour recreer le catalogue/exemples dans Firestore).
4. `npm run dev`
5. Ouvrir http://localhost:3000 (la locale FR charge la navigation, mais l'URL `/en/...` est disponible si besoin).
6. Les donnees (exercices + programmes + sessions) vivent dans Firestore; utilisez les boutons Import/Export sur `/programs` pour sauvegarder/restaurer.

### Tests

```bash
npm run test
```

Vitest se base sur des mocks Firestore en memoire. Les tests couvrent le formatage du timer et les helpers Firestore (export/import/reindexation).

### Deploiement Vercel

1. Creer un projet Vercel pointe sur ce repo.
2. Configurer les builds avec la commande `npm run build` et `npm start` comme commande de sortie.
3. Les locales sont gerees via middleware next-intl; aucune configuration supplementaire n'est necessaire.

Pensez a activer Analytics ou Logflare depuis le dashboard Vercel pour suivre `program.start/program.complete` (evenements logs en console en mode dev).
