(() => {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------------------------------------------------
     Thème clair / sombre
     --------------------------------------------------------- */

  const themeButton = document.querySelector("[data-theme-toggle]");
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function isLightTheme() {
    return root.getAttribute("data-theme") === "light";
  }

  function syncThemeButton() {
    if (!themeButton) return;
    const light = isLightTheme();
    themeButton.setAttribute(
      "aria-label",
      light ? themeButton.dataset.labelDark : themeButton.dataset.labelLight
    );
    if (themeMeta) {
      themeMeta.setAttribute("content", light ? "#ffffff" : "#000000");
    }
  }

  if (themeButton) {
    syncThemeButton();
    themeButton.addEventListener("click", () => {
      const next = isLightTheme() ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("ia-theme", next);
      } catch (error) {
        /* stockage indisponible, le thème reste actif pour la visite */
      }
      syncThemeButton();
    });
  }

  /* ---------------------------------------------------------
     Menu mobile
     --------------------------------------------------------- */

  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-menu]");
  let menuReturnFocus = null;

  function setMenu(open) {
    if (!menuButton || !mobileMenu) return;

    mobileMenu.hidden = !open;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open
        ? menuButton.dataset.labelClose || "Fermer le menu"
        : menuButton.dataset.labelOpen || "Menu"
    );
    document.body.classList.toggle("nav-open", open);

    if (open) {
      menuReturnFocus = document.activeElement;
      const firstLink = mobileMenu.querySelector("a, button");
      if (firstLink) firstLink.focus();
    } else if (menuReturnFocus && typeof menuReturnFocus.focus === "function") {
      menuReturnFocus.focus();
      menuReturnFocus = null;
    }
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      setMenu(mobileMenu.hidden);
    });

    mobileMenu.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !mobileMenu.hidden) {
        setMenu(false);
      }
    });

    const desktop = window.matchMedia("(min-width: 1000px)");
    const handleDesktop = (event) => {
      if (event.matches && !mobileMenu.hidden) setMenu(false);
    };

    if (typeof desktop.addEventListener === "function") {
      desktop.addEventListener("change", handleDesktop);
    } else if (typeof desktop.addListener === "function") {
      desktop.addListener(handleDesktop);
    }
  }

  /* ---------------------------------------------------------
     Sous-menu Services
     --------------------------------------------------------- */

  const dropdowns = Array.from(document.querySelectorAll("[data-nav-drop]"));

  if (dropdowns.length) {
    document.addEventListener("click", (event) => {
      dropdowns.forEach((dropdown) => {
        if (!dropdown.contains(event.target)) dropdown.open = false;
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      dropdowns.forEach((dropdown) => {
        if (!dropdown.open) return;
        dropdown.open = false;
        const summary = dropdown.querySelector("summary");
        if (summary) summary.focus();
      });
    });
  }

  /* ---------------------------------------------------------
     Lightbox
     --------------------------------------------------------- */

  const dialog = document.getElementById("lightbox");

  if (dialog) {
    const dialogImage = dialog.querySelector("[data-lightbox-img]");
    const dialogCaption = dialog.querySelector("[data-lightbox-caption]");
    const dialogCount = dialog.querySelector("[data-lightbox-count]");
    const closeButton = dialog.querySelector("[data-lightbox-close]");
    const previousButton = dialog.querySelector("[data-lightbox-prev]");
    const nextButton = dialog.querySelector("[data-lightbox-next]");
    const triggers = Array.from(document.querySelectorAll("[data-lightbox]"));
    let currentIndex = 0;
    let opener = null;

    function pad(value) {
      return String(value).padStart(2, "0");
    }

    function showImage(index) {
      if (!triggers.length || !dialogImage) return;

      currentIndex = (index + triggers.length) % triggers.length;
      const trigger = triggers[currentIndex];

      dialogImage.src = trigger.dataset.full || "";
      dialogImage.alt = trigger.dataset.alt || "";
      if (dialogCaption) {
        dialogCaption.textContent = trigger.dataset.caption || "";
      }
      if (dialogCount) {
        dialogCount.textContent = `${pad(currentIndex + 1)} / ${pad(triggers.length)}`;
      }
      if (previousButton) previousButton.disabled = triggers.length < 2;
      if (nextButton) nextButton.disabled = triggers.length < 2;
    }

    triggers.forEach((trigger, index) => {
      trigger.addEventListener("click", () => {
        opener = trigger;
        showImage(index);
        if (!dialog.open) dialog.showModal();
      });
    });

    if (closeButton) {
      closeButton.addEventListener("click", () => dialog.close());
    }

    if (previousButton) {
      previousButton.addEventListener("click", () => showImage(currentIndex - 1));
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => showImage(currentIndex + 1));
    }

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showImage(currentIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showImage(currentIndex + 1);
      }
    });

    dialog.addEventListener("close", () => {
      dialogImage.removeAttribute("src");
      dialogImage.alt = "";
      if (dialogCaption) dialogCaption.textContent = "";
      if (opener && typeof opener.focus === "function") opener.focus();
      opener = null;
    });
  }

  /* ---------------------------------------------------------
     Carrousel photos
     --------------------------------------------------------- */

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector("[data-carousel-track]");
    const previous = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");

    if (!track) return;

    function scrollByPage(direction) {
      const amount = Math.max(track.clientWidth * 0.8, 260);
      track.scrollBy({
        left: direction * amount,
        behavior: reduceMotion.matches ? "auto" : "smooth"
      });
    }

    function updateButtons() {
      const maxScroll = track.scrollWidth - track.clientWidth - 1;
      if (previous) previous.disabled = track.scrollLeft <= 1;
      if (next) next.disabled = track.scrollLeft >= maxScroll;
    }

    if (previous) {
      previous.addEventListener("click", () => scrollByPage(-1));
    }

    if (next) {
      next.addEventListener("click", () => scrollByPage(1));
    }

    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    updateButtons();
  });
})();
