# Vérification du dashboard — 16 novembre 2026

Branche : `audit/donnees-bonsai-reims-2026-11-16`. Révision d’interface vérifiée : `bb442cfc63c1af40281bc453dd789edf3f6dccb1`.

**Proposition à examiner. Aucune fusion ni publication de la V3 autorisée.**

## Prévisualisation

[Ouvrir la version vérifiée](https://htmlpreview.github.io/?https://github.com/Monsieurdeelah/calendrier-bonsai/blob/bb442cfc63c1af40281bc453dd789edf3f6dccb1/index.html)

Cette prévisualisation tierce lit une révision fixe du dépôt ; elle ne remplace pas le site GitHub Pages actuel. Le lien du dashboard vers le rapport fonctionne. Dans ce service de prévisualisation, le lien relatif de retour du rapport aboutit à l’accueil du service : utiliser le bouton Retour du navigateur ou le lien ci-dessus. Le chemin relatif `../index.html` du rapport est correct pour le dossier du site ; aucun changement d’hébergement n’a été effectué.

## Anomalies corrigées

- Sur mobile, les deux colonnes fixes du tableau annuel occupaient presque toute la largeur : seule l’intervention reste fixe, la famille défile, les mois restent consultables.
- Juin et juillet affichaient tous deux « Jui » : abréviations distinctes « Juin » et « Juil », ainsi que « Août ».
- La ligne mekiri, ajoutée à la fin des données, réapparaissait après les azalées : regroupement annuel par famille, sans modifier les données horticoles.
- Les libellés longs et les badges se partageaient trop peu de place : badge sur une seconde ligne.
- Les couleurs seules ne suffisaient pas à lire le tableau : codes O, C, D, H, ?, N et légende commune aux deux vues.
- Les précautions du tableau annuel dépendaient d’une infobulle peu accessible au toucher : chaque case est désormais un bouton ouvrant la fiche du mois, avec précautions et références visibles. Le focus rejoint la fiche.
- Les références abrégées sont remplacées par leurs titres complets ; les doublons sont masqués à l’affichage. Les limites des sources figurent dans le titre du lien.

## Vérification visuelle et fonctionnelle réelle

Navigateur intégré, moteur Chromium ; tailles PC 1440 × 960, mobile 390 × 844 et 320 × 740. Il s’agit de dimensions simulées, pas d’un essai sur un iPhone physique ou Safari.

- Inspection des vues mensuelle et annuelle, des six états, des libellés longs et d’une fiche développée : lisibles, sans débordement horizontal de la page. Le tableau annuel conserve son propre défilement horizontal.
- Six filtres d’état testés sur chacun des douze mois : **72 contrôles**. États affichés et compteurs cohérents ; leur somme vaut 118 chaque mois.
- Les huit options de période ont aussi été parcourues en juin : actif 76 = optimal 30 + conditionnel 46 ; déconseillé 6 ; non documenté 15 ; non applicable 2 ; hors fenêtre 19 ; total 118.
- Les **13 familles** et les **23 intitulés d’intervention** ont été parcourus avec « Toutes les périodes » ; libellés et nombres cohérents.
- Les **14 vues annuelles** (toutes familles et chaque famille) ont été parcourues : 118 lignes et 1 416 boutons au total ; 10 lignes pour le pin noir et 9 pour chacun des autres groupes. Le mekiri reste dans le groupe pin noir.
- Une case « Non documenté » de marcottage du pin noir en juin ouvre la bonne fiche : famille, intervention, mois et état concordent ; confiance faible et précaution visibles.
- Option de masquage/réaffichage des précautions vérifiée : message explicite quand elles sont masquées.
- Défilement horizontal au clavier et maintien de la colonne Intervention vérifiés sur mobile ; navigation entre vues et ouverture du rapport vérifiées.
- Aucun message d’erreur dans la console observée à la fin des tests.

## Contrôles automatisés

Commande : `node audit/verify.mjs` — réussite après corrections.

- 91 lignes originales et 1 092 cases couvertes ; 118 propositions et 1 416 états.
- Égalité exacte des données intégrées avec `donnees-auditees.json`.
- Syntaxe JavaScript, identifiants, états et références cohérents.
- **1 344 combinaisons mois/famille/période** dans le DOM simulé et **14 vues annuelles**.

Le fichier `validation.json` reste le compte rendu du test simulé. Les observations visuelles réelles sont documentées ici ; ces deux types de contrôle ne sont pas confondus.

## Références et limites

Les 32 adresses du registre ont été soumises à une tentative d’ouverture avec l’outil de lecture web : **28 ont rendu un contenu exploitable**, dont le PDF FFB et les articles Galinou, Bonsai Empire, Bonsaï Entretien, Bonsai4Me, Vibel, Petit Parcours et Comité Champagne.

Les trois pièces jointes Galinou (identifiants 20, 27, 11) n’ont pas pu être rechargées par cet outil (« cache miss »). Cela ne démontre pas un lien cassé ; leurs URL ont été conservées. [Le Jardin de Moji](https://www.lejardindemoji.com/) renvoie encore 403 dans cet outil ; aucune recommandation ne lui est attribuée.

Cette étape vérifie l’interface et l’accès aux références, sans refaire l’arbitrage biologique de l’audit. Les techniques non documentées, les différences de protocole et les informations individuelles encore manquantes restent signalées. Les fenêtres mensuelles ne constituent pas une obligation de travailler.

## État avant examen

`main` était toujours au commit `5f19066d2dcf097ac7e68d435bdef1da21064bc9` lors du contrôle final de comparaison. Les modifications d’interface sont uniquement sur la branche d’audit. Aucune action de fusion, de déploiement ou de modification des réglages GitHub Pages n’a été exécutée.
