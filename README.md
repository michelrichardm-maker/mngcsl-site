# MNG — Site web

Site vitrine bilingue (FR/EN) de **MRMT NEXTGen Conseils & Associés Inc.**
Site statique, sans dépendance de build à l'exécution — prêt pour GitHub + Vercel.

## Structure

```
/
├── index.html                 Accueil
├── services.html              Services (5 pôles + méthode + FAQ)
├── a-propos.html              À propos (mission, valeurs, parcours)
├── realisations.html          Études de cas
├── blog.html                  Blog (avec filtres)
├── contact.html               Contact (formulaire complet)
├── tarification.html          Tarification (3 formules + comparatif)
├── carrieres.html             Carrières (postes)
├── confidentialite.html       Politique de confidentialité (Loi 25 / LPRPDE)
├── conditions.html            Conditions d'utilisation
├── cookies.html               Politique cookies
├── accessibilite.html         Déclaration d'accessibilité
├── mentions-legales.html      Mentions légales
├── 404.html                   Page d'erreur
├── assets/
│   ├── css/styles.css         Design system global (une seule feuille)
│   ├── js/main.js             Script global (langue, nav, formulaires…)
│   └── img/                   favicon.svg, apple-touch-icon.png, og-image.jpg
├── favicon.ico
├── robots.txt
├── sitemap.xml
├── vercel.json                Sécurité, redirections, cache
├── .well-known/security.txt
└── build/                     Générateur des pages (non déployé)
```


## Aperçu local

Chaque page `.html` est **autonome** (CSS et JavaScript intégrés) : tu peux **double-cliquer sur `index.html`** — ou n'importe quelle page — et elle s'affiche correctement, sans avoir besoin du dossier `assets/` à côté. Les photos et la police se chargent depuis Internet ; hors ligne, la mise en page reste intacte.

## Déploiement (GitHub → Vercel)

1. Créez un dépôt GitHub et poussez le contenu de ce dossier.
2. Sur Vercel : **Add New → Project → Import** le dépôt.
3. Framework Preset : **Other**. Build Command : *(vide)*. Output Directory : *(racine, vide)*.
4. Déployez, puis pointez votre domaine `mngcsl.ca` dans **Settings → Domains**.

`vercel.json` applique automatiquement les en-têtes de sécurité, les redirections et le cache.

## Modifier le contenu

Le HTML est généré à partir de gabarits Python dans `build/` (en-tête, nav et pied de page
partagés — modifiés à un seul endroit). Pour régénérer après une modification :

```bash
cd build && python3 build.py
```

Vous pouvez aussi éditer directement les fichiers `.html` si vous préférez.

## À personnaliser avant la mise en ligne

- **Google Analytics** : l'identifiant `G-EFTEX2VSMY` est en place dans `build/partials.py`.
- **Formspree** : les formulaires pointent vers `https://formspree.io/f/xjgqzowp`.
- **Réseaux sociaux** : liens `linkedin/twitter/instagram/youtube` `.com/…/mngcsl` à confirmer.
- **Pages légales** : gabarits professionnels à faire valider par un conseiller juridique.
- **Image OG / favicon** : remplaçables par vos visuels définitifs dans `assets/img/`.
- **Réalisations / blog** : contenus d'exemple à remplacer par vos vrais projets et articles.

## Sécurité (en-têtes appliqués)

Content-Security-Policy · HSTS · X-Content-Type-Options · X-Frame-Options ·
Referrer-Policy · Permissions-Policy · Cross-Origin-Opener-Policy.
