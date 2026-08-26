# Club Lillois de Judo Kendo

Site statique du Club Lillois de Judo Kendo, construit avec Astro, Tailwind CSS et Pages CMS.

## Développement

Prérequis : Node.js 20 ou une version LTS plus récente.

```sh
npm install
npm run dev
```

Commandes de contrôle :

```sh
npm run check
npm run format:check
npm run build
```

`npm run format` applique Prettier au code et aux fichiers de configuration. Les archives et médias sont exclus.

## Contenu

Les collections Astro se trouvent dans `src/content` :

- `articles` : actualités et articles du club ;
- `disciplines` : pages des sections ;
- `events` : évènements ;
- `staff` : enseignants et responsables.

Les schémas de validation sont définis dans `src/content/config.ts`. La configuration Pages CMS est dans `.pages.yml`. Toute modification d’un champ doit être répercutée dans les deux fichiers.

Les entrées avec `draft: true` sont visibles en développement et exclues du site de production.

### URLs et archives

Les pages de détail utilisent une date issue du contenu :

- `/articles/AAAA/MM/JJ/slug`, à partir de `pubDate` ;
- `/evenements/AAAA/MM/JJ/slug`, à partir de `startDate`.

Les helpers de `src/utils/dateUtils.js` doivent être utilisés pour construire ces liens. Les anciennes routes sans date ne sont pas conservées.

La liste des articles accepte les paramètres `q`, `author`, `tag`, `from`, `to` et `page`. Les filtres sont appliqués côté navigateur et conservés dans l’URL. À partir de sept articles, des pages statiques complémentaires sont générées sous `/articles/page/N`.

Les événements dont la date de fin précède la date de début sont refusés par le schéma. La page événements affiche directement les cartes dans les sections « À venir » et « Passés », et exclut les brouillons en production.

Chaque nom présent dans `coordinator`, `enseignantsReferents` ou `enseignantsAssistants` doit correspondre exactement à une entrée de `src/content/staff`. La page équipe vérifie cette relation pendant le build et sépare l’encadrement technique des fonctions administratives.

## Gestion des ressources

### Ressources accessibles dans le CMS

`public/uploads` contient les images et documents éditoriaux. Pages CMS peut les sélectionner, les ajouter, les renommer ou les supprimer. Le chemin enregistré dans le contenu commence par `/uploads/`.

Avant le développement et chaque build, `npm run images:generate` crée automatiquement des variantes AVIF et WebP de 320 à 1280 px dans `public/generated/uploads`, ainsi que leur manifeste dans `src/_data/responsive-images.json`. Le composant `ResponsiveImage.astro` fournit les `srcset` adaptés et conserve le fichier `/uploads/` original comme fallback. La commande peut aussi être lancée manuellement après une modification importante des médias.

Sous-dossiers recommandés :

- `disciplines` pour les logos et illustrations de sections ;
- `events` pour les affiches d’évènements ;
- `staff` pour les portraits ;
- `generic` pour les illustrations réutilisables ;
- `inscriptions` pour les tarifs et documents éditoriaux.

### Ressources non accessibles dans le CMS

`src/assets` contient les ressources liées au design et traitées par Astro : image d’accueil, fond de carte, portrait par défaut et feuilles de style. Elles doivent être importées dans le code.

`public/documents` contient les fichiers techniques servis tels quels.

`public/archives` est une copie historique de l’ancien site. Elle est exclue du formatage et ne doit pas être utilisée par les pages actives.

## Déploiement

La production est générée dans `dist` avec :

```sh
npm run build
```

Le workflow GitHub Pages est défini dans `.github/workflows/gh-pages.yml`.
