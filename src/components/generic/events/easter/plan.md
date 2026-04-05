# Thème de Pâques et Printemps pour Ecole-Directe-Plus

Ce thème vise à apporter une ambiance printanière et festive pour Pâques.

## 1. Composants principaux
- **EasterFall.jsx** : Remplace `Snowfall.jsx`. Fait tomber des œufs de Pâques colorés et des fleurs (marguerites, cerisiers).
- **FlowerGarland.jsx** : Remplace `garland.jsx`. Une guirlande de fleurs suspendue en haut de l'écran avec des couleurs pastels.
- **SpringBorder.css** : Remplace `snow.css`. Ajoute de l'herbe et des fleurs sur le haut des fenêtres et des éléments du header.

## 2. Période de l'événement
- Le thème sera actif durant tout le mois d'avril.
- Date de Pâques 2026 : 5 avril.

## 3. Détails d'implémentation
- Utilisation de CSS animations pour la chute des éléments.
- Utilisation de caractères Unicode pour les fleurs (✿, ❀, ❃) et les œufs (peut-être des emojis ou des formes SVG).
- Palette de couleurs : Pastels (Jaune, Rose, Vert menthe, Lavande).

## 4. Intégration
- Modifier `setPeriodEvent.js` pour inclure l'événement `easter`.
- Adapter `LandingPage.jsx`, `Window.jsx`, and `Header.jsx` pour réagir à `currentPeriodEvent === "easter"`.
