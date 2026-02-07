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
- `GET|POST /api/seed?token=...` : endpoint HTTP protege (via `SEED_TRIGGER_TOKEN`) qui execute le meme seed qu'en local.

### Tester en local
1. `npm install`
2. Creer `.env.local` a la racine du dossier `circu-thai/` avec les cles `NEXT_PUBLIC_FIREBASE_*` fournies par la console Firebase.
	- Pour activer la route HTTP `/api/seed`, definir egalement `SEED_TRIGGER_TOKEN` (valeur secrete a partager uniquement avec les integrateurs/cron).
3. `npm run seed` (a executer une fois par environnement pour recreer le catalogue/exemples dans Firestore).
4. `npm run dev`
5. Ouvrir http://localhost:3000 (la locale FR charge la navigation, mais l'URL `/en/...` est disponible si besoin).
6. Les donnees (exercices + programmes + sessions) vivent dans Firestore; utilisez les boutons Import/Export sur `/programs` pour sauvegarder/restaurer.

### Endpoint Seed HTTP

Une fois `SEED_TRIGGER_TOKEN` defini, l'API `GET` ou `POST /api/seed` (en prod ou local) permet de relancer le seed sans acces shell :

```bash
curl -X GET "https://votre-app.vercel.app/api/seed?token=$SEED_TRIGGER_TOKEN"
```


### Wake Lock mobile

Pour que l'ecran des mobiles compatibles reste actif pendant l'execution d'une session, `RunController` s'appuie sur l'API [Screen Wake Lock](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API) (Android/Chrome/Edge) et retombe automatiquement sur une reprise apres interaction utilisateur pour iOS/Safari. Aucun reglages supplementaire n'est necessaire : le hook `useWakeLock` demande le verrouillage lorsque la session demarre et le relache lors des pauses/completions.

### Tests
> ⚠️ Si l'API renvoie `{ "error": "Seed route disabled" }`, cela signifie simplement que `SEED_TRIGGER_TOKEN` n'est pas defini sur l'environnement cible. Ajoutez la variable (meme valeur cote client et serveur), redeployez puis relancez l'URL avec le meme token.
### Deploiement Vercel

1. Creer un projet Vercel pointe sur ce repo.
2. Configurer les builds avec la commande `npm run build` et `npm start` comme commande de sortie.
3. Les locales sont gerees via middleware next-intl; aucune configuration supplementaire n'est necessaire.

Pensez a activer Analytics ou Logflare depuis le dashboard Vercel pour suivre `program.start/program.complete` (evenements logs en console en mode dev).
