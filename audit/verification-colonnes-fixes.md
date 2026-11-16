# V3.1 — Colonnes fixes du calendrier annuel

Correction du 16 novembre 2026, limitée à la branche de la PR nº 1 et à la prévisualisation séparée `/v3-1/`.

## Correction

Les deux règles mobiles `position:static` sur Famille ont été supprimées. Famille reste à gauche ; Intervention utilise exactement la largeur de Famille comme décalage. Les largeurs partagées incluent bordures et padding (`border-box`). Les cellules fixes ont des fonds opaques, une séparation verticale et un niveau de superposition supérieur aux mois ; leurs en-têtes passent au-dessus des cellules de contenu.

Largeurs Famille / Intervention : 110 / 180 px sur PC, 84 / 122 px jusqu’à 680 px, 72 / 108 px jusqu’à 360 px. Le tableau conserve des cellules mensuelles tactiles de 44 px minimum. Les séparateurs Feuillus, Conifères et Tropicaux gardent leurs libellés fixes dans la zone visible.

## Validation reproductible

`node audit/verify.mjs` : 196 combinaisons annuelles, 1 344 rendus mensuels, 118 interventions et 1 416 états conservés.

`node audit/test-sticky.cjs` : Edge/Chromium réel, largeurs 1440, 390, 375 et 320 px ; émulation mobile tactile avec densité 3 sur les trois petites tailles. Pour chacune des 196 combinaisons famille × intervention et chacune des quatre largeurs, contrôle au début, au milieu et à la fin du défilement : position sticky de toutes les cellules Famille et Intervention (en-têtes inclus), décalages adjacents à 1 px près, fonds opaques, séparateurs visibles et absence de débordement de page. Les douze mois tiennent sur PC. Ouverture de fiche et Retour avec maintien du filtre « Taille structurelle lourde ». Aucune erreur JavaScript attendue ; résultats détaillés dans `validation-sticky.json`.

Captures `sticky-1440.png`, `sticky-390.png`, `sticky-375.png`, `sticky-320.png` : toutes familles, taille structurelle lourde, défilement à droite. Examen visuel PC et mobile.

Limite : aucun Safari/WebKit ni iPhone physique testé. Les tests mobiles sont une émulation Edge/Chromium, pas une certification Safari.

La PR reste en brouillon. Aucun changement de la branche main du dépôt principal, aucune fusion ni publication du site principal.
