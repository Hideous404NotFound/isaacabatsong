# Portfolio Isaac Abatsong

Site multi-pages, bilingue FR / EN, généré en HTML statique. Le build optimise les images en WebP, produit les `srcset`, les pages projet, le sitemap, le fichier `robots.txt` et les données structurées JSON-LD.

## Démarrage

```bash
npm install
npm run build
npm run serve
```

Le site local est disponible sur `http://localhost:4173`.

## Structure

```
build.mjs              génération du site et des images
serve.mjs              serveur local pour dist/
images/
  projets/             un dossier par projet, tous les visuels du projet
  galerie-libre/       visuels hors projets
  profil/              photos personnelles et portrait principal
src/
  content.mjs          tous les textes FR / EN, projets, services, expériences
  render.mjs           gabarit HTML, navigation, pied de page, JSON-LD
  pages.mjs            construction des pages
  styles.css           design system
  main.js              thème, menu, lightbox, carrousel
dist/                  site généré (ne pas modifier à la main)
```

## Ajouter ou remplacer des images

### Un projet

1. Déposez les visuels dans `images/projets/mon-projet/`.
2. Ajoutez une entrée dans `projects` dans `src/content.mjs` avec `slug`, `folder`, `cover`, `title`, `description`, etc.
3. Relancez `npm run build`.

Toutes les images du dossier apparaissent automatiquement dans la galerie du projet. La première image sert de couverture si le fichier `cover` est introuvable.

### Des photos personnelles

Déposez les fichiers dans `images/profil/`, puis relancez le build. Toutes les images du dossier sont reprises dans le carrousel de la page À propos. Le portrait principal reste `image-de-isaac-abatsong-3.png`. Pour un texte alternatif sur mesure, ajoutez l'image dans `personalPhotos` dans `src/content.mjs`.

### La galerie libre

Déposez les fichiers dans `images/galerie-libre/`. Pour un libellé propre, ajoutez une entrée dans `galleryItems` dans `src/content.mjs`. Sinon, un libellé est généré à partir du nom du fichier.

## Modifier les textes

Tout le contenu éditorial est dans `src/content.mjs` : navigation, hero, projets, services, parcours, formation, mentions légales. Les pages sont assemblées dans `src/pages.mjs`.

Le titre principal du hero doit rester exact :

> Je transforme votre image pour attirer plus de clients avec une communication visuelle stratégique.

## URL et référencement

L'URL canonique est définie par `SITE_URL` dans `src/content.mjs` :

```js
export const SITE_URL = "https://isaacabatsong.netlify.app";
```

Changez cette valeur le jour où le site passe sur un domaine définitif. Le sitemap, les balises canoniques, les alternates `hreflang` et les images Open Graph en dépendent.

Chaque page contient :

- un titre et une description uniques ;
- une URL canonique et les versions FR / EN ;
- les balises Open Graph et Twitter ;
- des données JSON-LD (`Person`, `WebSite`, `ProfessionalService`, `CreativeWork`, `ImageGallery`, `Service`, `BreadcrumbList`) ;
- le contenu complet dans le HTML, sans dépendre de JavaScript.

`robots.txt` autorise explicitement les robots des moteurs de recherche et des moteurs génératifs (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot).

## Contact

Le site n'utilise pas de formulaire. Les contacts sont directs :

- WhatsApp : `+237 690 46 32 56`
- E-mail : `isaacabatsong32@gmail.com`
- LinkedIn : `https://www.linkedin.com/in/isaacabatsong`
- Facebook : `https://www.facebook.com/isaacabatsong`

## Déploiement Netlify

Le fichier `netlify.toml` est déjà configuré :

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Importez le dossier dans Netlify, ou connectez le dépôt. Netlify installe les dépendances, lance le build et publie `dist/`.

## Notes de contenu à confirmer

Les deux CV fournis comportent deux variantes pour certains éléments. Le site a été rédigé de façon à rester juste sans trancher :

- le baccalauréat est mentionné sans série ;
- l'anglais est indiqué comme intermédiaire ;
- la formation en génie logiciel (2023 à 2025) et la licence en marketing digital (2026) sont présentées comme deux étapes.

À ajuster dans `src/content.mjs` si nécessaire.
