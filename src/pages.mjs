import {
  SITE_URL,
  site,
  ui as uiContent,
  hero,
  services,
  projects,
  experiences,
  education,
  tools,
  spokenLanguages,
  about,
  legal,
  personalPhotos
} from "./content.mjs";
import {
  esc,
  icon,
  imageTag,
  mediaButton,
  layout,
  ctaSection,
  breadcrumb,
  breadcrumbLd,
  professionalServiceLd,
  routes,
  servicePath,
  projectPath
} from "./render.mjs";

const pAlt = (lang, project, img) =>
  `${project.title[lang]}, ${img.label[lang]}`;

function metaDescription(text, maxLength = 158) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;

  const cut = clean.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const safeCut = lastSpace > 80 ? lastSpace : maxLength - 1;
  return `${cut.slice(0, safeCut).trim()}…`;
}

function sectionHead(kicker, title, text, id = "") {
  return `
  <div class="section-head">
    <div>
      <p class="eyebrow">${esc(kicker)}</p>
      <h2${id ? ` id="${id}"` : ""}>${esc(title)}</h2>
    </div>
    ${text ? `<p class="section-head__text">${esc(text)}</p>` : ""}
  </div>`;
}

function workItem(lang, ui, project, img, index) {
  return `
  <article class="work-item">
    <div class="work-media">
      <a href="${projectPath(lang, project)}" aria-label="${esc(project.title[lang])}">
        ${imageTag(img, {
          alt: pAlt(lang, project, img),
          sizes: "(min-width: 900px) 50vw, 100vw"
        })}
      </a>
    </div>
    <div class="work-body">
      <p class="work-index"><span aria-hidden="true">${String(index + 1).padStart(2, "0")}</span> <span aria-hidden="true">·</span> ${esc(project.category[lang])}</p>
      <h3 class="work-title"><a href="${projectPath(lang, project)}">${esc(project.title[lang])}</a></h3>
      <p class="work-tagline">${esc(project.tagline[lang])}</p>
      <p class="work-meta">${esc(project.year)}</p>
      <a class="text-link" href="${projectPath(lang, project)}">${esc(ui.viewProject)} ${icon("arrow")}</a>
    </div>
  </article>`;
}

function archiveItem(lang, ui, project, img, index) {
  return `
  <article class="archive-item">
    <a class="archive-media" href="${projectPath(lang, project)}" aria-label="${esc(project.title[lang])}">
      ${imageTag(img, {
        alt: pAlt(lang, project, img),
        sizes: "(min-width: 900px) 50vw, 100vw",
        loading: index < 2 ? "eager" : "lazy",
        fetchpriority: index === 0 ? "high" : undefined
      })}
    </a>
    <div class="archive-body">
      <p class="meta">${esc(project.category[lang])} <span aria-hidden="true">·</span> ${esc(project.year)}</p>
      <h2><a href="${projectPath(lang, project)}">${esc(project.title[lang])}</a></h2>
      <p class="archive-tagline">${esc(project.tagline[lang])}</p>
      <a class="text-link" href="${projectPath(lang, project)}">${esc(ui.viewProject)} ${icon("arrow")}</a>
    </div>
  </article>`;
}

function serviceRow(lang, service) {
  return `
  <a class="service-row" href="${servicePath(lang, service)}">
    <span class="service-num">${esc(service.num)}</span>
    <span class="service-row__body">
      <span class="service-row__title">${esc(service.title[lang])}</span>
      <span class="service-row__desc">${esc(service.short[lang])}</span>
    </span>
    <span class="service-row__arrow" aria-hidden="true">${icon("arrow")}</span>
  </a>`;
}

function processList(steps) {
  return `
  <ol class="process">
    ${steps
      .map(
        (step, index) => `
      <li class="process-step">
        <span class="process-num">${String(index + 1).padStart(2, "0")}</span>
        <h3>${esc(step.title)}</h3>
        <p>${esc(step.text)}</p>
      </li>`
      )
      .join("")}
  </ol>`;
}

function personalCarousel(lang, ui, images) {
  return `
  <section class="section" aria-labelledby="photos-title">
    <div class="container">
      <div class="section-head">
        <div>
          <p class="eyebrow">${esc(ui.aboutKicker)}</p>
          <h2 id="photos-title">${esc(ui.personalPhotos)}</h2>
        </div>
        <p class="section-head__text">${esc(ui.personalPhotosIntro)}</p>
      </div>
      <div class="carousel" data-carousel>
        <div class="carousel-track" data-carousel-track tabindex="0" role="region" aria-label="${esc(ui.personalPhotos)}">
          ${images.personal
            .map(
              (img, index) => `
          <figure class="carousel-item">
            ${imageTag(img, {
              alt: img.alt[lang],
              sizes: "(min-width: 900px) 30vw, 78vw"
            })}
            <figcaption><span aria-hidden="true">${String(index + 1).padStart(2, "0")}</span> / ${String(images.personal.length).padStart(2, "0")}</figcaption>
          </figure>`
            )
            .join("")}
        </div>
        <div class="carousel-nav">
          <button class="carousel-btn" type="button" data-carousel-prev aria-label="${esc(ui.carouselPrev)}">${icon("arrowLeft")}</button>
          <button class="carousel-btn" type="button" data-carousel-next aria-label="${esc(ui.carouselNext)}">${icon("arrow")}</button>
        </div>
      </div>
    </div>
  </section>`;
}

function pageHead(kicker, title, intro) {
  return `
  <header class="page-head">
    <div class="container">
      <p class="eyebrow">${esc(kicker)}</p>
      <h1>${esc(title)}</h1>
      <p class="lead">${esc(intro)}</p>
    </div>
  </header>`;
}

export function buildPages({ images, assets }) {
  const pages = [];
  const all = projects.slice().sort((a, b) => a.order - b.order);

  // ---------------------------------------------------------------- HOME FR
  {
    const lang = "fr";
    const ui = uiContent[lang];
    const r = routes(lang);
    const h = hero[lang];
    const featured = all.filter((p) => p.featured).slice(0, 3);
    const path = "/";
    const altPath = "/en/";
    const title = "Isaac Abatsong · Graphiste & stratège de marque à Yaoundé";
    const description =
      "Design graphique, stratégie de contenu et community management à Yaoundé. Des identités et des pages qui aident les marques à être vues et choisies.";

    const body = `
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">${esc(h.eyebrow)}</p>
          <h1>${esc(h.title).replace("stratégique.", '<span class="accent">stratégique.</span>')}</h1>
          <p class="hero-intro">${esc(h.intro)}</p>
          <div class="hero-actions">
            <a class="btn btn--primary" href="${r.work}">${esc(h.primary)} ${icon("arrow")}</a>
            <a class="btn btn--ghost" href="${r.contact}">${esc(h.secondary)}</a>
          </div>
          <dl class="hero-stats">
            ${h.stats
              .map(
                (stat) =>
                  `<div class="stat"><dt>${esc(stat.label)}</dt><dd>${esc(stat.value)}</dd></div>`
              )
              .join("")}
          </dl>
        </div>
        <figure class="hero-portrait">
          ${imageTag(images.hero, {
            alt: h.portraitAlt,
            sizes: "(min-width: 900px) 34vw, 100vw",
            loading: "eager",
            fetchpriority: "high"
          })}
          <figcaption>${esc(site.location[lang])} <span aria-hidden="true">·</span> ${esc(ui.role)}</figcaption>
        </figure>
      </div>
    </section>

    <div class="strip">
      <div class="container strip__inner">
        <span>Design graphique</span><span aria-hidden="true">·</span>
        <span>Stratégie</span><span aria-hidden="true">·</span>
        <span>Community management</span><span aria-hidden="true">·</span>
        <span>${esc(site.location[lang])}</span>
      </div>
    </div>

    <section class="section" aria-labelledby="work-title">
      <div class="container">
        ${sectionHead(ui.workKicker, ui.allWork, ui.allWorkIntro, "work-title")}
        <div class="work-list">
          ${featured
            .map((p, i) => workItem(lang, ui, p, images.projects[p.slug].cover, i))
            .join("")}
        </div>
        <p class="section-foot"><a class="btn btn--ghost" href="${r.work}">${esc(ui.viewAllWork)} ${icon("arrow")}</a></p>
      </div>
    </section>

    <section class="section services-section" aria-labelledby="services-title">
      <div class="container">
        ${sectionHead(ui.servicesKicker, ui.nav.services, ui.servicesIntro, "services-title")}
        <div class="service-list">
          ${services.map((s) => serviceRow(lang, s)).join("")}
        </div>
      </div>
    </section>

    <section class="section about-teaser" aria-labelledby="about-title">
      <div class="container split">
        <figure class="split__media">
          ${imageTag(images.personal[0], {
            alt: images.personal[0].alt[lang],
            sizes: "(min-width: 900px) 44vw, 100vw"
          })}
        </figure>
        <div class="split__body">
          <p class="eyebrow">${esc(ui.aboutKicker)}</p>
          <h2 id="about-title">${esc(about[lang].title)}</h2>
          <p>${esc(about[lang].intro)}</p>
          <a class="btn btn--ghost" href="${r.about}">${esc(ui.readAbout)} ${icon("arrow")}</a>
        </div>
      </div>
    </section>

    ${ctaSection(lang, ui)}
    `;

    pages.push({
      path,
      lang,
      key: "home",
      html: layout({
        lang,
        ui,
        title,
        description,
        path,
        altPath,
        navKey: "home",
        image: "/og/default.jpg",
        imageAlt: "Isaac Abatsong, graphiste et stratège de marque",
        jsonLd: [
          professionalServiceLd(lang),
          {
            "@type": "ItemList",
            name: "Travaux sélectionnés",
            itemListElement: featured.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.title[lang],
              url: `${SITE_URL}${projectPath(lang, p)}`
            }))
          }
        ],
        body,
        assets,
        preload: {
          src: images.hero.src,
          srcset: images.hero.srcset,
          sizes: "(min-width: 900px) 34vw, 100vw"
        }
      }),
      priority: "1.0",
      changefreq: "monthly"
    });
  }

  // ---------------------------------------------------------------- HOME EN
  {
    const lang = "en";
    const ui = uiContent[lang];
    const r = routes(lang);
    const h = hero[lang];
    const featured = all.filter((p) => p.featured).slice(0, 3);
    const path = "/en/";
    const altPath = "/";
    const title = "Isaac Abatsong · Graphic designer & brand strategist";
    const description =
      "Graphic design, content strategy and community management in Yaoundé. Identities and pages that help brands get seen and chosen.";

    const body = `
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">${esc(h.eyebrow)}</p>
          <h1>${esc(h.title).replace("strategic visual communication.", '<span class="accent">strategic visual communication.</span>')}</h1>
          <p class="hero-intro">${esc(h.intro)}</p>
          <div class="hero-actions">
            <a class="btn btn--primary" href="${r.work}">${esc(h.primary)} ${icon("arrow")}</a>
            <a class="btn btn--ghost" href="${r.contact}">${esc(h.secondary)}</a>
          </div>
          <dl class="hero-stats">
            ${h.stats
              .map(
                (stat) =>
                  `<div class="stat"><dt>${esc(stat.label)}</dt><dd>${esc(stat.value)}</dd></div>`
              )
              .join("")}
          </dl>
        </div>
        <figure class="hero-portrait">
          ${imageTag(images.hero, {
            alt: h.portraitAlt,
            sizes: "(min-width: 900px) 34vw, 100vw",
            loading: "eager",
            fetchpriority: "high"
          })}
          <figcaption>${esc(site.location[lang])} <span aria-hidden="true">·</span> ${esc(ui.role)}</figcaption>
        </figure>
      </div>
    </section>

    <div class="strip">
      <div class="container strip__inner">
        <span>Graphic design</span><span aria-hidden="true">·</span>
        <span>Strategy</span><span aria-hidden="true">·</span>
        <span>Community management</span><span aria-hidden="true">·</span>
        <span>${esc(site.location[lang])}</span>
      </div>
    </div>

    <section class="section" aria-labelledby="work-title">
      <div class="container">
        ${sectionHead(ui.workKicker, ui.allWork, ui.allWorkIntro, "work-title")}
        <div class="work-list">
          ${featured
            .map((p, i) => workItem(lang, ui, p, images.projects[p.slug].cover, i))
            .join("")}
        </div>
        <p class="section-foot"><a class="btn btn--ghost" href="${r.work}">${esc(ui.viewAllWork)} ${icon("arrow")}</a></p>
      </div>
    </section>

    <section class="section services-section" aria-labelledby="services-title">
      <div class="container">
        ${sectionHead(ui.servicesKicker, ui.nav.services, ui.servicesIntro, "services-title")}
        <div class="service-list">
          ${services.map((s) => serviceRow(lang, s)).join("")}
        </div>
      </div>
    </section>

    <section class="section about-teaser" aria-labelledby="about-title">
      <div class="container split">
        <figure class="split__media">
          ${imageTag(images.personal[0], {
            alt: images.personal[0].alt[lang],
            sizes: "(min-width: 900px) 44vw, 100vw"
          })}
        </figure>
        <div class="split__body">
          <p class="eyebrow">${esc(ui.aboutKicker)}</p>
          <h2 id="about-title">${esc(about[lang].title)}</h2>
          <p>${esc(about[lang].intro)}</p>
          <a class="btn btn--ghost" href="${r.about}">${esc(ui.readAbout)} ${icon("arrow")}</a>
        </div>
      </div>
    </section>

    ${ctaSection(lang, ui)}
    `;

    pages.push({
      path,
      lang,
      key: "home",
      html: layout({
        lang,
        ui,
        title,
        description,
        path,
        altPath,
        navKey: "home",
        image: "/og/default.jpg",
        imageAlt: "Isaac Abatsong, graphic designer and brand strategist",
        jsonLd: [
          professionalServiceLd(lang),
          {
            "@type": "ItemList",
            name: "Selected work",
            itemListElement: featured.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.title[lang],
              url: `${SITE_URL}${projectPath(lang, p)}`
            }))
          }
        ],
        body,
        assets,
        preload: {
          src: images.hero.src,
          srcset: images.hero.srcset,
          sizes: "(min-width: 900px) 34vw, 100vw"
        }
      }),
      priority: "1.0",
      changefreq: "monthly"
    });
  }

  // ---------------------------------------------------------------- PROJECTS INDEX
  for (const lang of ["fr", "en"]) {
    const ui = uiContent[lang];
    const r = routes(lang);
    const path = r.work;
    const altPath = routes(lang === "fr" ? "en" : "fr").work;
    const title = lang === "fr" ? "Projets · Isaac Abatsong" : "Projects · Isaac Abatsong";
    const description =
      lang === "fr"
        ? "Huit projets de design graphique, campagnes et community management. Chaque dossier s'ouvre sur l'ensemble des visuels."
        : "Eight graphic design, campaign and community management projects. Each folder opens on the full set of visuals.";

    const body = `
    ${pageHead(ui.workKicker, ui.nav.work, ui.allWorkIntro)}
    <section class="section section--flush">
      <div class="container archive">
        ${all
          .map((p, i) => archiveItem(lang, ui, p, images.projects[p.slug].cover, i))
          .join("")}
      </div>
    </section>
    ${ctaSection(lang, ui)}`;

    pages.push({
      path,
      lang,
      key: "work",
      html: layout({
        lang,
        ui,
        title,
        description,
        path,
        altPath,
        navKey: "work",
        image: "/og/default.jpg",
        imageAlt: lang === "fr" ? "Projets d'Isaac Abatsong" : "Isaac Abatsong projects",
        jsonLd: [
          {
            "@type": "CollectionPage",
            name: title,
            description,
            url: `${SITE_URL}${path}`,
            inLanguage: lang
          },
          {
            "@type": "ItemList",
            name: ui.nav.work,
            itemListElement: all.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.title[lang],
              url: `${SITE_URL}${projectPath(lang, p)}`
            }))
          },
          breadcrumbLd(lang, [{ label: ui.nav.work, href: path }])
        ],
        body,
        assets
      }),
      priority: "0.9",
      changefreq: "monthly"
    });
  }

  // ---------------------------------------------------------------- PROJECT PAGES
  for (const project of all) {
    for (const lang of ["fr", "en"]) {
      const ui = uiContent[lang];
      const r = routes(lang);
      const path = projectPath(lang, project);
      const altPath = projectPath(lang === "fr" ? "en" : "fr", project);
      const projectImages = images.projects[project.slug];
      const cover = projectImages.cover;
      const gallery = projectImages.gallery;
      const remaining = gallery.filter((img) => img.file !== cover.file);
      const title = `${project.title[lang]} · ${ui.project}`;
      const description = metaDescription(
        `${project.tagline[lang]} ${project.description[lang][0]}`
      );
      const index = all.findIndex((p) => p.slug === project.slug);
      const next = all[(index + 1) % all.length];
      const prev = all[(index - 1 + all.length) % all.length];
      const roleText = project.role[lang].join(" · ");

      const body = `
      <article>
        <header class="project-hero">
          <div class="container">
            ${breadcrumb(lang, [
              { label: ui.nav.work, href: r.work },
              { label: project.title[lang], href: path }
            ])}
            <div class="project-head">
              <div class="project-head__text">
                <p class="eyebrow">${esc(project.category[lang])}</p>
                <h1>${esc(project.title[lang])}</h1>
                <p class="subtitle">${esc(project.tagline[lang])}</p>
              </div>
              <dl class="project-meta">
                <div><dt>${esc(ui.client)}</dt><dd>${esc(project.client)}</dd></div>
                <div><dt>${esc(ui.year)}</dt><dd>${esc(project.year)}</dd></div>
                <div><dt>${esc(ui.roleLabel)}</dt><dd>${esc(roleText)}</dd></div>
                <div><dt>${esc(ui.imageCount)}</dt><dd>${gallery.length}</dd></div>
              </dl>
            </div>
          </div>
        </header>

        <div class="container project-cover">
          ${mediaButton(cover, {
            alt: pAlt(lang, project, cover),
            caption: `${project.title[lang]} · ${cover.label[lang]}`,
            sizes: "(min-width: 1280px) 1200px, 100vw",
            loading: "eager",
            ui
          })}
        </div>

        <section class="section project-content" aria-labelledby="project-about">
          <div class="container project-body">
            <div class="project-desc">
              <h2 id="project-about" class="meta">${esc(ui.project)}</h2>
              ${project.description[lang].map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
            </div>
            <aside class="project-aside" aria-label="${esc(ui.projectMeta)}">
              <h2 class="meta">${esc(ui.projectMeta)}</h2>
              <ul class="role-list">
                ${project.role[lang].map((role) => `<li>${esc(role)}</li>`).join("")}
              </ul>
              <p class="project-aside__note">${esc(site.location[lang])} <span aria-hidden="true">·</span> ${esc(project.year)}</p>
            </aside>
          </div>
        </section>

        <section class="section" aria-labelledby="gallery-title">
          <div class="container">
            ${sectionHead(ui.galleryTitle, ui.relatedWork, `${gallery.length} ${ui.imageCount}`, "gallery-title")}
            <div class="masonry">
              ${remaining
                .map(
                  (img) => `
              <figure class="masonry-item">
                ${mediaButton(img, {
                  alt: pAlt(lang, project, img),
                  caption: `${project.title[lang]} · ${img.label[lang]}`,
                  sizes: "(min-width: 1100px) 33vw, (min-width: 640px) 50vw, 100vw",
                  ui
                })}
              </figure>`
                )
                .join("")}
            </div>
          </div>
        </section>
      </article>

      <nav class="project-next" aria-label="${esc(lang === "fr" ? "Navigation entre les projets" : "Project navigation")}">
        <div class="container project-next__inner">
          <a class="project-next__prev" href="${projectPath(lang, prev)}">
            <span class="meta">${esc(ui.prevProject)}</span>
            <span class="project-next__title">${esc(prev.title[lang])}</span>
          </a>
          <a class="project-next__next" href="${projectPath(lang, next)}">
            <span class="meta">${esc(ui.nextProject)}</span>
            <span class="project-next__title">${esc(next.title[lang])}</span>
            ${icon("arrow")}
          </a>
        </div>
      </nav>

      ${ctaSection(lang, ui)}`;

      pages.push({
        path,
        lang,
        key: `project:${project.slug}`,
        html: layout({
          lang,
          ui,
          title,
          description,
          path,
          altPath,
          navKey: "work",
          image: `/og/${project.slug}.jpg`,
          imageAlt: `${project.title[lang]}, ${project.category[lang]}`,
          jsonLd: [
            {
              "@type": "CreativeWork",
              name: project.title[lang],
              description: project.description[lang].join(" "),
              url: `${SITE_URL}${path}`,
              creator: { "@id": `${SITE_URL}/#person` },
              dateCreated: project.year,
              genre: project.category[lang],
              keywords: project.role[lang].join(", "),
              image: gallery.slice(0, 8).map((img) => `${SITE_URL}${img.full}`)
            },
            {
              "@type": "ImageGallery",
              name: `${project.title[lang]} · ${ui.galleryTitle}`,
              numberOfItems: gallery.length,
              image: gallery.map((img) => `${SITE_URL}${img.full}`),
              associatedMedia: gallery.map((img) => ({
                "@type": "ImageObject",
                contentUrl: `${SITE_URL}${img.full}`,
                width: img.fullWidth,
                height: img.fullHeight,
                caption: `${project.title[lang]} · ${img.label[lang]}`
              }))
            },
            breadcrumbLd(lang, [
              { label: ui.nav.work, href: r.work },
              { label: project.title[lang], href: path }
            ])
          ],
          body,
          assets
        }),
        priority: "0.8",
        changefreq: "yearly"
      });
    }
  }

  // ---------------------------------------------------------------- GALLERY
  for (const lang of ["fr", "en"]) {
    const ui = uiContent[lang];
    const r = routes(lang);
    const path = r.gallery;
    const altPath = routes(lang === "fr" ? "en" : "fr").gallery;
    const title = lang === "fr" ? "Galerie · Isaac Abatsong" : "Gallery · Isaac Abatsong";
    const description = ui.galleryIntro;

    const body = `
    ${pageHead(ui.galleryKicker, ui.galleryTitle, ui.galleryIntro)}
    <section class="section section--flush">
      <div class="container">
        <div class="masonry">
          ${images.gallery
            .map(
              (img) => `
          <figure class="masonry-item">
            ${mediaButton(img, {
              alt: img.label[lang],
              caption: img.label[lang],
              sizes: "(min-width: 1100px) 33vw, (min-width: 640px) 50vw, 100vw",
              ui
            })}
          </figure>`
            )
            .join("")}
        </div>
      </div>
    </section>
    ${ctaSection(lang, ui)}`;

    pages.push({
      path,
      lang,
      key: "gallery",
      html: layout({
        lang,
        ui,
        title,
        description,
        path,
        altPath,
        navKey: "gallery",
        image: "/og/default.jpg",
        imageAlt: lang === "fr" ? "Galerie de visuels d'Isaac Abatsong" : "Isaac Abatsong visual gallery",
        jsonLd: [
          {
            "@type": "CollectionPage",
            name: title,
            description,
            url: `${SITE_URL}${path}`,
            inLanguage: lang
          },
          {
            "@type": "ImageGallery",
            name: ui.galleryTitle,
            numberOfItems: images.gallery.length,
            image: images.gallery.map((img) => `${SITE_URL}${img.full}`)
          },
          breadcrumbLd(lang, [{ label: ui.galleryTitle, href: path }])
        ],
        body,
        assets
      }),
      priority: "0.7",
      changefreq: "monthly"
    });
  }

  // ---------------------------------------------------------------- SERVICES OVERVIEW
  for (const lang of ["fr", "en"]) {
    const ui = uiContent[lang];
    const r = routes(lang);
    const path = r.services;
    const altPath = routes(lang === "fr" ? "en" : "fr").services;
    const title = lang === "fr"
      ? "Design, stratégie et community management · Isaac Abatsong"
      : "Design, strategy and community management · Isaac Abatsong";
    const description = metaDescription(
      services.map((service) => service.short[lang]).join(" ")
    );

    const body = `
    ${pageHead(ui.servicesKicker, ui.nav.services, ui.servicesIntro)}
    <section class="section section--flush">
      <div class="container">
        <div class="service-list">
          ${services.map((s) => serviceRow(lang, s)).join("")}
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="process-title">
      <div class="container">
        ${sectionHead(
          ui.process,
          lang === "fr" ? "Une méthode simple, sans tunnel." : "A simple method, no maze.",
          lang === "fr"
            ? "Quatre étapes, des points de validation clairs et des fichiers livrés propres."
            : "Four steps, clear checkpoints and clean final files.",
          "process-title"
        )}
        ${processList(
          lang === "fr"
            ? [
                { title: "Brief", text: "On clarifie le problème, l'audience et le résultat attendu." },
                { title: "Direction", text: "Je propose une piste argumentée, pas trois options au hasard." },
                { title: "Production", text: "Création, allers-retours limités, finitions et déclinaisons." },
                { title: "Livraison", text: "Fichiers prêts à publier ou à imprimer, avec les règles d'usage." }
              ]
            : [
                { title: "Brief", text: "We clarify the problem, the audience and the expected result." },
                { title: "Direction", text: "I propose one argued direction, not three random options." },
                { title: "Production", text: "Creation, limited rounds, finishing and variations." },
                { title: "Delivery", text: "Files ready to publish or print, with usage rules." }
              ]
        )}
      </div>
    </section>
    ${ctaSection(lang, ui)}`;

    pages.push({
      path,
      lang,
      key: "services",
      html: layout({
        lang,
        ui,
        title,
        description,
        path,
        altPath,
        navKey: "services",
        image: "/og/default.jpg",
        imageAlt: lang === "fr" ? "Services d'Isaac Abatsong" : "Isaac Abatsong services",
        jsonLd: [
          {
            "@type": "CollectionPage",
            name: title,
            description,
            url: `${SITE_URL}${path}`,
            inLanguage: lang
          },
          {
            "@type": "ItemList",
            itemListElement: services.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: s.title[lang],
              url: `${SITE_URL}${servicePath(lang, s)}`
            }))
          },
          breadcrumbLd(lang, [{ label: ui.nav.services, href: path }])
        ],
        body,
        assets
      }),
      priority: "0.9",
      changefreq: "monthly"
    });
  }

  // ---------------------------------------------------------------- SERVICE PAGES
  const relatedProjects = {
    "design-graphique": ["identites-visuelles", "nevra-sports"],
    strategie: ["portfolio-2026", "sante-express"],
    "community-management": ["sante-express", "istc-isare"]
  };

  for (const service of services) {
    for (const lang of ["fr", "en"]) {
      const ui = uiContent[lang];
      const r = routes(lang);
      const path = servicePath(lang, service);
      const altPath = servicePath(lang === "fr" ? "en" : "fr", service);
      const title = service.seoTitle[lang];
      const description = metaDescription(
        `${service.short[lang]} ${service.intro[lang][0]}`
      );
      const serviceImages = images.services[service.slug];

      const body = `
      <article>
        <header class="project-hero service-hero">
          <div class="container">
            ${breadcrumb(lang, [
              { label: ui.nav.services, href: r.services },
              { label: service.title[lang], href: path }
            ])}
            <div class="project-head">
              <div class="project-head__text">
                <p class="eyebrow">${esc(service.num)} · ${esc(ui.nav.services)}</p>
                <h1>${esc(service.title[lang])}</h1>
                <p class="subtitle">${esc(service.short[lang])}</p>
              </div>
              <div class="service-hero__intro">
                ${service.intro[lang].map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
              </div>
            </div>
          </div>
        </header>

        <div class="container media-strip">
          ${serviceImages
            .map(
              (img) => `
          <figure>
            ${mediaButton(img, {
              alt: `${service.title[lang]}, ${img.label[lang]}`,
              caption: `${service.title[lang]} · ${img.label[lang]}`,
              sizes: "(min-width: 900px) 33vw, 100vw",
              ui
            })}
          </figure>`
            )
            .join("")}
        </div>

        <section class="section" aria-labelledby="deliverables-title">
          <div class="container two-col">
            <div>
              <p class="eyebrow">${esc(ui.deliverables)}</p>
              <h2 id="deliverables-title">${lang === "fr" ? "Ce que vous obtenez" : "What you get"}</h2>
            </div>
            <ul class="check-list">
              ${service.deliverables[lang].map((item) => `<li>${esc(item)}</li>`).join("")}
            </ul>
          </div>
        </section>

        ${
          service.pages
            ? `
        <section class="section" aria-labelledby="managed-title">
          <div class="container">
            ${sectionHead(
              ui.managedPages,
              lang === "fr" ? "Trois pages, trois contextes." : "Three pages, three contexts.",
              lang === "fr"
                ? "Avril à juillet 2025 : animation, contenus et réponses pour ces trois comptes."
                : "April to July 2025: animation, content and replies for these three accounts.",
              "managed-title"
            )}
            <ul class="managed-pages">
              ${service.pages[lang]
                .map(
                  (item, index) => `
              <li>
                <span class="managed-num" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
                <span class="managed-name">${esc(item.name)}</span>
                <span class="managed-detail">${esc(item.detail)}</span>
              </li>`
                )
                .join("")}
            </ul>
          </div>
        </section>`
            : ""
        }

        <section class="section" aria-labelledby="process-title">
          <div class="container">
            ${sectionHead(
              ui.process,
              lang === "fr" ? "Comment on avance." : "How we move forward.",
              "",
              "process-title"
            )}
            ${processList(service.process[lang])}
          </div>
        </section>

        <section class="section" aria-labelledby="related-title">
          <div class="container">
            ${sectionHead(ui.relatedWork, lang === "fr" ? "Quelques exemples." : "A few examples.", "", "related-title")}
            <div class="related-list">
              ${relatedProjects[service.slug]
                .map((slug) => all.find((p) => p.slug === slug))
                .filter(Boolean)
                .map(
                  (project) => `
              <a class="related-row" href="${projectPath(lang, project)}">
                <span class="related-row__title">${esc(project.title[lang])}</span>
                <span class="related-row__meta">${esc(project.category[lang])}</span>
                <span class="related-row__arrow" aria-hidden="true">${icon("arrow")}</span>
              </a>`
                )
                .join("")}
            </div>
          </div>
        </section>

        ${ctaSection(lang, ui)}
      </article>`;

      pages.push({
        path,
        lang,
        key: `service:${service.slug}`,
        html: layout({
          lang,
          ui,
          title,
          description,
          path,
          altPath,
          navKey: "services",
          image: "/og/default.jpg",
          imageAlt: `${service.title[lang]}, Isaac Abatsong`,
          jsonLd: [
            {
              "@type": "Service",
              name: service.title[lang],
              serviceType: service.title[lang],
              description: service.short[lang],
              url: `${SITE_URL}${path}`,
              provider: { "@id": `${SITE_URL}/#person` },
              areaServed: [
                { "@type": "Country", name: lang === "fr" ? "Cameroun" : "Cameroon" },
                { "@type": "Place", name: lang === "fr" ? "À distance" : "Remote" }
              ]
            },
            breadcrumbLd(lang, [
              { label: ui.nav.services, href: r.services },
              { label: service.title[lang], href: path }
            ])
          ],
          body,
          assets
        }),
        priority: "0.8",
        changefreq: "monthly"
      });
    }
  }

  // ---------------------------------------------------------------- ABOUT
  for (const lang of ["fr", "en"]) {
    const ui = uiContent[lang];
    const r = routes(lang);
    const path = r.about;
    const altPath = routes(lang === "fr" ? "en" : "fr").about;
    const title = lang === "fr" ? "À propos · Isaac Abatsong, graphiste et stratège de marque" : "About · Isaac Abatsong, graphic designer and brand strategist";
    const description =
      lang === "fr"
        ? "Graphiste, stratège visuel et community manager à Yaoundé. Parcours, expériences, formation, outils et photos."
        : "Graphic designer, visual strategist and community manager in Yaoundé. Background, experience, education, tools and photos.";

    const body = `
    <header class="page-head about-head">
      <div class="container about-head__grid">
        <div>
          <p class="eyebrow">${esc(ui.aboutKicker)}</p>
          <h1>${esc(about[lang].title)}</h1>
          <p class="lead">${esc(about[lang].intro)}</p>
        </div>
        <figure class="about-portrait">
          ${imageTag(images.hero, {
            alt: hero[lang].portraitAlt,
            sizes: "(min-width: 900px) 34vw, 100vw",
            loading: "eager",
            fetchpriority: "high"
          })}
        </figure>
      </div>
    </header>

    <section class="section" aria-labelledby="story-title">
      <div class="container split split--text">
        <div class="split__body">
          <p class="eyebrow">${lang === "fr" ? "Le parcours" : "The story"}</p>
          <h2 id="story-title" class="sr-only">${lang === "fr" ? "Mon parcours" : "My story"}</h2>
          ${about[lang].paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
        </div>
        <blockquote class="quote">
          <p class="subtitle">“${esc(about[lang].quote)}”</p>
          <footer>${esc(about[lang].quoteAuthor)}</footer>
        </blockquote>
      </div>
    </section>

    <section class="section" aria-labelledby="experience-title">
      <div class="container">
        ${sectionHead(
          ui.experience,
          lang === "fr" ? "Ce que j'ai fait, concrètement." : "What I have actually done.",
          "",
          "experience-title"
        )}
        <ol class="timeline">
          ${experiences[lang]
            .map(
              (item) => `
          <li class="timeline-item">
            <p class="timeline-period">${esc(item.period)}</p>
            <div class="timeline-body">
              <h3>${esc(item.role)}</h3>
              <p class="timeline-org">${esc(item.org)}</p>
              <p>${esc(item.text)}</p>
            </div>
          </li>`
            )
            .join("")}
        </ol>
      </div>
    </section>

    <section class="section" aria-labelledby="education-title">
      <div class="container two-col">
        <div>
          ${sectionHead(ui.education, lang === "fr" ? "Formation" : "Education", "", "education-title")}
          <ol class="education">
            ${education[lang]
              .map(
                (item) => `
            <li>
              <span class="education-year">${esc(item.year)}</span>
              <span class="education-title">${esc(item.title)}</span>
              <span class="education-place">${esc(item.place)}</span>
            </li>`
              )
              .join("")}
          </ol>
        </div>
        <div class="skills">
          <div>
            <p class="eyebrow">${esc(ui.tools)}</p>
            <ul class="tool-list">
              ${tools[lang].map((tool) => `<li>${esc(tool)}</li>`).join("")}
            </ul>
          </div>
          <div>
            <p class="eyebrow">${esc(ui.languages)}</p>
            <ul class="lang-list">
              ${spokenLanguages[lang]
                .map(
                  (language) =>
                    `<li><span>${esc(language.name)}</span><span>${esc(language.level)}</span></li>`
                )
                .join("")}
            </ul>
          </div>
        </div>
      </div>
    </section>

    ${personalCarousel(lang, ui, images)}
    ${ctaSection(lang, ui)}`;

    pages.push({
      path,
      lang,
      key: "about",
      html: layout({
        lang,
        ui,
        title,
        description,
        path,
        altPath,
        navKey: "about",
        image: "/og/default.jpg",
        imageAlt: hero[lang].portraitAlt,
        jsonLd: [
          {
            "@type": "AboutPage",
            name: title,
            description,
            url: `${SITE_URL}${path}`,
            inLanguage: lang,
            about: { "@id": `${SITE_URL}/#person` }
          },
          breadcrumbLd(lang, [{ label: ui.nav.about, href: path }])
        ],
        body,
        assets
      }),
      priority: "0.8",
      changefreq: "yearly"
    });
  }

  // ---------------------------------------------------------------- CONTACT
  for (const lang of ["fr", "en"]) {
    const ui = uiContent[lang];
    const r = routes(lang);
    const path = r.contact;
    const altPath = routes(lang === "fr" ? "en" : "fr").contact;
    const title = lang === "fr"
      ? "Contact · Isaac Abatsong, graphiste à Yaoundé"
      : "Contact · Isaac Abatsong, designer in Yaoundé";
    const description = ui.contactIntro;

    const body = `
    ${pageHead(ui.contactKicker, ui.contactTitle, ui.contactIntro)}
    <section class="section section--flush">
      <div class="container">
        <div class="contact-list">
          <a class="contact-row" href="${site.phoneHref}" target="_blank" rel="noopener noreferrer">
            <span class="contact-label">${esc(ui.contactWhatsapp)}</span>
            <span class="contact-main"><span class="contact-value">${esc(site.phoneDisplay)}</span><span class="contact-text">${esc(ui.contactWhatsappText)}</span></span>
            <span class="contact-arrow" aria-hidden="true">${icon("arrow")}</span>
          </a>
          <a class="contact-row" href="mailto:${site.email}">
            <span class="contact-label">${esc(ui.contactEmail)}</span>
            <span class="contact-main"><span class="contact-value">${esc(site.email)}</span><span class="contact-text">${esc(ui.contactEmailText)}</span></span>
            <span class="contact-arrow" aria-hidden="true">${icon("arrow")}</span>
          </a>
          <a class="contact-row" href="${site.linkedin}" target="_blank" rel="noopener noreferrer">
            <span class="contact-label">${esc(ui.contactLinkedin)}</span>
            <span class="contact-main"><span class="contact-value">${esc(site.linkedinLabel)}</span><span class="contact-text">${esc(ui.contactLinkedinText)}</span></span>
            <span class="contact-arrow" aria-hidden="true">${icon("arrow")}</span>
          </a>
          <a class="contact-row" href="${site.facebook}" target="_blank" rel="noopener noreferrer">
            <span class="contact-label">${esc(ui.contactFacebook)}</span>
            <span class="contact-main"><span class="contact-value">${esc(site.facebookLabel)}</span><span class="contact-text">${esc(ui.contactFacebookText)}</span></span>
            <span class="contact-arrow" aria-hidden="true">${icon("arrow")}</span>
          </a>
        </div>

        <div class="info-list">
          <div class="info-row"><span class="meta">${esc(ui.basedIn)}</span><span>${esc(site.location[lang])}</span></div>
          <div class="info-row"><span class="meta">${esc(ui.availability)}</span><span>${esc(site.availability[lang])}</span></div>
          <div class="info-row"><span class="meta">${esc(ui.response)}</span><span>${esc(site.responseTime[lang])}</span></div>
        </div>

        <section class="mapbox" data-mapbox>
          <figure>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3980.905510745293!2d11.55148129999999!3d3.8304453000000014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x108bc5347ce2ba5d%3A0x76de28d6bce0db35!2sAwae%20Escalier!5e0!3m2!1sfr!2scm!4v1756861700602!5m2!1sfr!2scm"
              width="600"
              height="450"
              style="border:0;"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="${lang === "fr" ? "Carte Google Maps - Yaoundé, Awae Escalier" : "Google Maps - Yaoundé, Awae Escalier"}"></iframe>
          </figure>
        </section>

        <p class="contact-note">${esc(ui.noForm)}</p>
      </div>
    </section>`;

    pages.push({
      path,
      lang,
      key: "contact",
      html: layout({
        lang,
        ui,
        title,
        description,
        path,
        altPath,
        navKey: "contact",
        image: "/og/default.jpg",
        imageAlt: "Isaac Abatsong, contact",
        jsonLd: [
          {
            "@type": "ContactPage",
            name: title,
            description,
            url: `${SITE_URL}${path}`,
            inLanguage: lang,
            about: { "@id": `${SITE_URL}/#person` }
          },
          professionalServiceLd(lang),
          breadcrumbLd(lang, [{ label: ui.nav.contact, href: path }])
        ],
        body,
        assets
      }),
      priority: "0.8",
      changefreq: "yearly"
    });
  }

  // ---------------------------------------------------------------- LEGAL
  for (const lang of ["fr", "en"]) {
    const ui = uiContent[lang];
    const r = routes(lang);
    const path = r.legal;
    const altPath = routes(lang === "fr" ? "en" : "fr").legal;
    const title = `${legal[lang].title} · Isaac Abatsong`;
    const description =
      lang === "fr"
        ? "Éditeur, hébergement, propriété intellectuelle et données personnelles du site d'Isaac Abatsong."
        : "Publisher, hosting, intellectual property and personal data for Isaac Abatsong's website.";

    const body = `
    ${pageHead(ui.legalTitle, legal[lang].title, lang === "fr" ? "Les informations essentielles, sans jargon inutile." : "The essential information, without unnecessary jargon.")}
    <section class="section section--flush">
      <div class="container legal">
        ${legal[lang].sections
          .map((section, index) => {
            const id = `legal-${section.title
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")}-${index + 1}`;
            return `
        <section class="legal-section" aria-labelledby="${id}">
          <h2 id="${id}">${esc(section.title)}</h2>
          <p>${esc(section.body)}</p>
        </section>`;
          })
          .join("")}
      </div>
    </section>`;

    pages.push({
      path,
      lang,
      key: "legal",
      html: layout({
        lang,
        ui,
        title,
        description,
        path,
        altPath,
        navKey: "",
        image: "/og/default.jpg",
        imageAlt: "Isaac Abatsong",
        jsonLd: [
          {
            "@type": "WebPage",
            name: title,
            description,
            url: `${SITE_URL}${path}`,
            inLanguage: lang
          },
          breadcrumbLd(lang, [{ label: ui.footerLegal, href: path }])
        ],
        body,
        assets
      }),
      priority: "0.2",
      changefreq: "yearly"
    });
  }

  return pages;
}

export function buildNotFound({ images, assets }) {
  const lang = "fr";
  const ui = uiContent[lang];
  const r = routes(lang);
  const title = "Page introuvable · Isaac Abatsong";
  const description = ui.notFoundText;

  const body = `
  <section class="notfound">
    <div class="container">
      <p class="eyebrow">404</p>
      <h1>${esc(ui.notFoundTitle)}</h1>
      <p class="lead">${esc(ui.notFoundText)}</p>
      <div class="hero-actions">
        <a class="btn btn--primary" href="${r.home}">${esc(ui.backHome)} ${icon("arrow")}</a>
        <a class="btn btn--ghost" href="${r.work}">${esc(ui.nav.work)}</a>
      </div>
    </div>
  </section>`;

  return layout({
    lang,
    ui,
    title,
    description,
    path: "/404.html",
    altPath: "/en/",
    navKey: "",
    image: "/og/default.jpg",
    imageAlt: "Isaac Abatsong",
    jsonLd: [],
    body,
    assets,
    noindex: true
  });
}
