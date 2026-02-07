# Journal des changements

## 2026-02-07
- Ajout d’une entrée de navigation multilingue « Test son » pointant vers `/[locale]/run/sound-test`, avec les traductions correspondantes en français et en anglais.
- Amélioration de l’expérience pendant une session grâce à l’intégration de l’API Screen Wake Lock, maintenant l’écran actif sur mobile tant que l’entraînement n’est pas terminé ou mis en pause.
- Extension de l’endpoint `/api/seed` pour accepter les requêtes GET et POST (protégé par jeton) et documentation du déclenchement sécurisé depuis les environnements de déploiement.
- Raffinement de l’assistant de session : démarrage automatique des entraînements, annonces vocales des étapes et signal sonore de fin pour une guidance plus claire.
