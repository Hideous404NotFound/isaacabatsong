import { SITE_URL, site, services as allServices } from "./content.mjs";

export const esc = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const routes = (lang) =>
  lang === "fr"
    ? {
        home: "/",
        work: "/projets/",
        gallery: "/galerie/",
        services: "/services/",
        about: "/a-propos/",
        contact: "/contact/",
        legal: "/mentions-legales/"
      }
    : {
        home: "/en/",
        work: "/en/projects/",
        gallery: "/en/gallery/",
        services: "/en/services/",
        about: "/en/about/",
        contact: "/en/contact/",
        legal: "/en/legal/"
      };

export const servicePath = (lang, service) =>
  lang === "fr" ? `/services/${service.slug}/` : `/en/services/${service.slugEn}/`;

export const projectPath = (lang, project) =>
  lang === "fr" ? `/projets/${project.slug}/` : `/en/projects/${project.slug}/`;

const ICONS = {
  arrow:
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><path d="M4 12h15M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowLeft:
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><path d="M20 12H5M11 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chevron:
    '<svg class="icon icon--chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><path d="m7 10 5 5 5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  sun:
    '<svg class="icon icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke-linecap="round"/></svg>',
  moon:
    '<svg class="icon icon--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5 8.5 8.5 0 1 0 20.5 14.3Z" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  menu:
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round"/></svg>',
  close:
    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18" stroke-linecap="round"/></svg>'
};

export const icon = (name) => ICONS[name] || "";

export function imageTag(
  img,
  { alt, sizes, loading = "lazy", fetchpriority, className = "" } = {}
) {
  if (!img) return "";
  return [
    "<img",
    ` src="${img.src}"`,
    ` srcset="${img.srcset}"`,
    ` sizes="${sizes}"`,
    ` width="${img.width}"`,
    ` height="${img.height}"`,
    ` alt="${esc(alt)}"`,
    ` loading="${loading}"`,
    ' decoding="async"',
    fetchpriority ? ` fetchpriority="${fetchpriority}"` : "",
    className ? ` class="${className}"` : "",
    ">"
  ].join("");
}

export function mediaButton(
  img,
  { alt, caption, sizes = "100vw", loading = "lazy", ui, className = "" }
) {
  return [
    `<button class="media-open ${className}" type="button"`,
    " data-lightbox",
    ` data-full="${img.full}"`,
    ` data-caption="${esc(caption || alt)}"`,
    ` data-alt="${esc(alt)}"`,
    ` aria-label="${esc(ui.openImage)} : ${esc(alt)}">`,
    imageTag(img, { alt, sizes, loading }),
    "</button>"
  ].join("");
}

export function lightboxDialog(ui) {
  return `
  <dialog class="lightbox" id="lightbox" aria-label="${esc(ui.lightbox)}">
    <div class="lightbox__bar">
      <span class="lightbox__count" data-lightbox-count></span>
      <button class="lightbox__close" type="button" data-lightbox-close aria-label="${esc(ui.closeImage)}">${icon("close")}</button>
    </div>
    <button class="lightbox__nav lightbox__nav--prev" type="button" data-lightbox-prev aria-label="${esc(ui.previousImage)}">${icon("arrowLeft")}</button>
    <figure class="lightbox__figure">
      <img data-lightbox-img alt="">
      <figcaption data-lightbox-caption></figcaption>
    </figure>
    <button class="lightbox__nav lightbox__nav--next" type="button" data-lightbox-next aria-label="${esc(ui.nextImage)}">${icon("arrow")}</button>
  </dialog>`;
}

function header({ lang, ui, navKey, altPath }) {
  const r = routes(lang);
  const other = ui.otherLang;
  const current = lang === "fr" ? "FR" : "EN";
  const otherLabel = other === "fr" ? "FR" : "EN";
  const homeLabel = lang === "fr" ? "Accueil" : "Home";
  const overview = lang === "fr" ? "Vue d'ensemble" : "Overview";
  const active = (key) => (navKey === key ? " is-active" : "");

  const serviceLinks = allServices
    .map(
      (s) =>
        `<a href="${servicePath(lang, s)}">${esc(s.title[lang])}</a>`
    )
    .join("");

  return `
  <a class="skip-link" href="#main">${esc(ui.skip)}</a>
  <header class="site-header">
    <div class="container nav">
      <a class="brand" href="${r.home}" aria-label="${esc(site.name)}, ${esc(homeLabel)}">
        <span>ISAAC ABATSONG</span><span class="brand-dot" aria-hidden="true">.</span>
      </a>

      <nav class="nav-links" aria-label="${esc(ui.menu)}">
        <a class="nav-link${active("work")}" href="${r.work}">${esc(ui.nav.work)}</a>
        <details class="nav-drop" data-nav-drop>
          <summary class="nav-link${active("services")}">${esc(ui.nav.services)}${icon("chevron")}</summary>
          <div class="nav-drop__panel">
            <a href="${r.services}"><span>${esc(overview)}</span><span aria-hidden="true">${icon("arrow")}</span></a>
            ${serviceLinks}
          </div>
        </details>
        <a class="nav-link${active("gallery")}" href="${r.gallery}">${esc(ui.nav.gallery)}</a>
        <a class="nav-link${active("about")}" href="${r.about}">${esc(ui.nav.about)}</a>
      </nav>

      <div class="nav-actions">
        <div class="lang-switch" role="group" aria-label="${esc(ui.language)}">
          <span aria-current="true">${current}</span>
          <span aria-hidden="true">/</span>
          <a href="${altPath}" hreflang="${other}" lang="${other}">${otherLabel}</a>
        </div>
        <button class="icon-btn theme-toggle" type="button" data-theme-toggle
          aria-label="${esc(ui.themeToLight)}"
          data-label-light="${esc(ui.themeToLight)}"
          data-label-dark="${esc(ui.themeToDark)}">
          ${icon("sun")}${icon("moon")}
        </button>
        <a class="btn btn--primary nav-cta" href="${r.contact}">${esc(ui.ctaShort)} ${icon("arrow")}</a>
        <button class="icon-btn menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu" aria-label="${esc(ui.menu)}" data-label-open="${esc(ui.menu)}" data-label-close="${esc(ui.close)}">
          ${icon("menu")}${icon("close")}
        </button>
      </div>
    </div>

    <div class="mobile-menu" id="mobile-menu" data-menu hidden>
      <nav class="mobile-menu__nav" aria-label="${esc(ui.menu)}">
        <a href="${r.work}">${esc(ui.nav.work)}</a>
        <a href="${r.services}">${esc(ui.nav.services)}</a>
        <div class="mobile-menu__sub">
          ${serviceLinks}
        </div>
        <a href="${r.gallery}">${esc(ui.nav.gallery)}</a>
        <a href="${r.about}">${esc(ui.nav.about)}</a>
        <a href="${r.contact}">${esc(ui.nav.contact)}</a>
      </nav>
      <div class="mobile-menu__foot">
        <a class="btn btn--primary" href="${r.contact}">${esc(ui.ctaShort)} ${icon("arrow")}</a>
        <a class="btn btn--ghost" href="${site.phoneHref}" target="_blank" rel="noopener noreferrer">${esc(ui.contactWhatsapp)}</a>
        <p>${esc(site.location[lang])} · ${esc(ui.response)}</p>
      </div>
    </div>
  </header>`;
}

function footer({ lang, ui }) {
  const r = routes(lang);
  const year = new Date().getFullYear();
  const serviceLinks = allServices
    .map((s) => `<a href="${servicePath(lang, s)}">${esc(s.title[lang])}</a>`)
    .join("");

  return `
  <footer class="footer">
    <div class="container footer__top">
      <div class="footer__brand">
        <a class="brand" href="${r.home}">
          <span>ISAAC ABATSONG</span><span class="brand-dot" aria-hidden="true">.</span>
        </a>
        <p>${esc(ui.footerTagline)}</p>
        <p class="footer__location">${esc(site.location[lang])}</p>
      </div>
      <nav class="footer__col" aria-label="${esc(ui.footerNav)}">
        <h2>${esc(ui.footerNav)}</h2>
        <a href="${r.work}">${esc(ui.nav.work)}</a>
        <a href="${r.services}">${esc(ui.nav.services)}</a>
        <a href="${r.gallery}">${esc(ui.nav.gallery)}</a>
        <a href="${r.about}">${esc(ui.nav.about)}</a>
        <a href="${r.contact}">${esc(ui.nav.contact)}</a>
      </nav>
      <nav class="footer__col" aria-label="${esc(ui.footerServices)}">
        <h2>${esc(ui.footerServices)}</h2>
        ${serviceLinks}
      </nav>
      <div class="footer__col">
        <h2>${esc(ui.footerContact)}</h2>
        <a href="${site.phoneHref}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a href="mailto:${site.email}">${esc(site.email)}</a>
        <a href="${site.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="${site.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a>
      </div>
    </div>
    <div class="container footer__bottom">
      <p>© ${year} ${esc(site.name)}. ${esc(ui.footerRights)}</p>
      <div class="footer__legal">
        <a href="${r.legal}">${esc(ui.footerLegal)}</a>
        <span aria-hidden="true">·</span>
        <span>${esc(ui.footerBuilt)}</span>
      </div>
    </div>
  </footer>`;
}

export function ctaSection(lang, ui) {
  return `
  <section class="section cta" aria-labelledby="cta-title">
    <div class="container cta__grid">
      <div>
        <p class="eyebrow">${esc(ui.contactKicker)}</p>
        <h2 id="cta-title">${esc(ui.contactCtaTitle)}</h2>
        <p>${esc(ui.contactCtaText)}</p>
      </div>
      <div class="cta__actions">
        <a class="btn btn--primary" href="${site.phoneHref}" target="_blank" rel="noopener noreferrer">${esc(ui.contactWhatsapp)} ${icon("arrow")}</a>
        <a class="btn btn--ghost btn--email" href="mailto:${site.email}">${esc(site.email)}</a>
      </div>
    </div>
  </section>`;
}

export function breadcrumb(lang, items) {
  const home = lang === "fr" ? "Accueil" : "Home";
  const all = [{ label: home, href: routes(lang).home }, ...items];
  return `
  <nav class="breadcrumb" aria-label="${lang === "fr" ? "Fil d'Ariane" : "Breadcrumb"}">
    <ol>
      ${all
        .map((item, index) => {
          const isLast = index === all.length - 1;
          return isLast
            ? `<li><span aria-current="page">${esc(item.label)}</span></li>`
            : `<li><a href="${item.href}">${esc(item.label)}</a></li>`;
        })
        .join("")}
    </ol>
  </nav>`;
}

export function breadcrumbLd(lang, items) {
  const home = lang === "fr" ? "Accueil" : "Home";
  const all = [{ label: home, href: routes(lang).home }, ...items];
  return {
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`
    }))
  };
}

export function jsonLdScript(object) {
  const json = JSON.stringify(object).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

export function personLd(lang, heroImage) {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: "Isaac Abatsong",
    alternateName: "Isa'c Octave Hans Abatsong",
    jobTitle:
      lang === "fr"
        ? "Graphiste et stratège de marque"
        : "Graphic designer and brand strategist",
    description:
      lang === "fr"
        ? "Graphiste, stratège visuel et community manager basé à Yaoundé. Identités visuelles, campagnes et gestion de pages."
        : "Graphic designer, visual strategist and community manager based in Yaoundé. Visual identities, campaigns and page management.",
    url: `${SITE_URL}${routes(lang).home}`,
    image: `${SITE_URL}${heroImage.full}`,
    email: `mailto:${site.email}`,
    telephone: "+237690463256",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Yaoundé",
      addressCountry: "CM"
    },
    sameAs: [site.facebook, site.linkedin],
    knowsAbout:
      lang === "fr"
        ? ["Design graphique", "Identité visuelle", "Stratégie de contenu", "Community management", "Référencement", "GEO"]
        : ["Graphic design", "Visual identity", "Content strategy", "Community management", "SEO", "GEO"],
    knowsLanguage: ["fr", "en"]
  };
}

export function professionalServiceLd(lang) {
  return {
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#service`,
    name: "Isaac Abatsong",
    description:
      lang === "fr"
        ? "Design graphique, stratégie de contenu et community management pour les marques, institutions et projets."
        : "Graphic design, content strategy and community management for brands, institutions and projects.",
    url: `${SITE_URL}${routes(lang).services}`,
    telephone: "+237690463256",
    email: site.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Yaoundé",
      addressCountry: "CM"
    },
    areaServed: [
      { "@type": "Country", name: lang === "fr" ? "Cameroun" : "Cameroon" },
      { "@type": "Place", name: lang === "fr" ? "À distance" : "Remote" }
    ],
    serviceType:
      lang === "fr"
        ? ["Design graphique", "Stratégie de contenu", "Community management"]
        : ["Graphic design", "Content strategy", "Community management"],
    sameAs: [site.facebook, site.linkedin]
  };
}

export function layout({
  lang,
  ui,
  title,
  description,
  path,
  altPath,
  navKey = "",
  image,
  imageAlt,
  jsonLd = [],
  body,
  assets,
  bodyClass = "",
  preload,
  noindex = false
}) {
  const r = routes(lang);
  const canonical = `${SITE_URL}${path}`;
  const altUrl = `${SITE_URL}${altPath}`;
  const frUrl = lang === "fr" ? canonical : altUrl;
  const enUrl = lang === "en" ? canonical : altUrl;
  const fullTitle = title.includes("Isaac Abatsong")
    ? title
    : `${title} · Isaac Abatsong`;
  const ogImage = `${SITE_URL}${image}`;
  const heroImage = { full: image };

  const graph = [
    personLd(lang, heroImage),
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Isaac Abatsong",
      inLanguage: ["fr", "en"],
      publisher: { "@id": `${SITE_URL}/#person` }
    },
    ...jsonLd
  ];

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="Isaac Abatsong">
  <meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="fr" href="${frUrl}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="x-default" href="${frUrl}">
  <meta name="theme-color" content="#000000">
  <meta name="color-scheme" content="dark light">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Isaac Abatsong">
  <meta property="og:title" content="${esc(fullTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(imageAlt)}">
  <meta property="og:locale" content="${lang === "fr" ? "fr_FR" : "en_US"}">
  <meta property="og:locale:alternate" content="${lang === "fr" ? "en_US" : "fr_FR"}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(fullTitle)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${ogImage}">

  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;600;700&family=Syne:wght@700&display=swap" rel="stylesheet">
  <script>
    (function () {
      try {
        if (localStorage.getItem("ia-theme") === "light") {
          document.documentElement.setAttribute("data-theme", "light");
        }
      } catch (e) {}
    })();
  </script>
  <link rel="stylesheet" href="/assets/${assets.css}">
  ${preload ? `<link rel="preload" as="image" href="${preload.src}" imagesrcset="${preload.srcset}" imagesizes="${preload.sizes}" fetchpriority="high">` : ""}
  ${jsonLdScript({ "@context": "https://schema.org", "@graph": graph })}
</head>
<body class="${bodyClass}">
  ${header({ lang, ui, navKey, altPath })}
  <main id="main">
    ${body}
  </main>
  ${footer({ lang, ui })}
  ${lightboxDialog(ui)}
  <script src="/assets/${assets.js}" defer></script>
</body>
</html>`;
}
