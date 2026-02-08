# Journal des changements

## v0.1.0 — 2026-02-07
- Ajout d’une entrée de navigation multilingue « Test son » pointant vers `/[locale]/run/sound-test`, avec les traductions correspondantes en français et en anglais.
- Amélioration de l’expérience pendant une session grâce à l’intégration de l’API Screen Wake Lock, maintenant l’écran actif sur mobile tant que l’entraînement n’est pas terminé ou mis en pause.
- Extension de l’endpoint `/api/seed` pour accepter les requêtes GET et POST (protégé par jeton) et documentation du déclenchement sécurisé depuis les environnements de déploiement.
- Raffinement de l’assistant de session : démarrage automatique des entraînements, annonces vocales des étapes et signal sonore de fin pour une guidance plus claire.

## v0.2.0 — 2026-02-08
- Sessions : démarrage manuel, contrôle « Précédent/Revenir au début », résumé des exercices et bouton retour affiché directement dans la carte « Prêt à lancer ».
- Lecture audio : prévention des doublons de musique et boutons responsives s’adaptant sur deux lignes en mobile.
- Builder : bouton « Enregistrer » dans l’en-tête, indicateur « Dernière mise à jour » et affichage des versions/localisations corrigées.
- Navigation : bandeau masqué pendant l’exécution pour maximiser la zone utile, ajout d’un badge de version dans l’UI et du lien « Accueil » contextualisé.
- Localisation : toutes les traductions françaises (y compris les exercices) utilisent désormais les accents corrects.

## v0.2.1 — 2026-02-08
- Audio : reprise automatique du contexte Web Audio avant chaque bip pour éviter les silences sur certains navigateurs mobiles.
- Slider de volume : plage 0 → 100 % avec reconversion interne (0 → 1) pour une précision accrue et une meilleure compatibilité touch.
