/* ==========================================================================
   Un Viaje Astral — interacciones compartidas
   ========================================================================== */
(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector("[data-header]");
  const progress = document.querySelector("[data-scroll-progress]");
  const toTop = document.querySelector("[data-to-top]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-menu-panel]");
  const main = document.querySelector("main");
  const footer = document.querySelector(".site-footer");
  const floats = document.querySelectorAll(".whatsapp-float, .to-top");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header, progreso y botón de subida ---------------------------------- */
  let ticking = false;

  const updateScrollUI = () => {
    const y = window.scrollY || 0;
    header?.classList.toggle("is-scrolled", y > 24);
    toTop?.classList.toggle("is-visible", y > 640);

    if (progress) {
      const max = root.scrollHeight - window.innerHeight;
      progress.style.width = max > 0 ? `${Math.min(100, (y / max) * 100)}%` : "0%";
    }

    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateScrollUI);
    }
  };

  updateScrollUI();
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate, { passive: true });

  toTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* Año dinámico -------------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  /* Menú móvil ---------------------------------------------------------- */
  if (toggle && panel) {
    let restoreFocus = true;

    const focusables = () =>
      [...document.querySelectorAll(".site-header a, .site-header button, .menu-panel a, .menu-panel button")].filter(
        (element) => element.offsetParent !== null && !element.hasAttribute("disabled")
      );

    const setBackgroundInert = (inert) => {
      [main, footer, ...floats].forEach((element) => {
        if (!element) return;
        if (inert) element.setAttribute("inert", "");
        else element.removeAttribute("inert");
      });
    };

    const openMenu = () => {
      restoreFocus = true;
      body.classList.add("menu-open");
      panel.classList.add("is-open");
      panel.removeAttribute("inert");
      panel.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Cerrar menú");
      const label = toggle.querySelector(".menu-btn__text");
      if (label) label.textContent = "Cerrar";
      setBackgroundInert(true);
      panel.scrollTop = 0;
      window.setTimeout(() => panel.querySelector("a")?.focus(), 60);
    };

    const closeMenu = ({ restore = true } = {}) => {
      body.classList.remove("menu-open");
      panel.classList.remove("is-open");
      panel.setAttribute("inert", "");
      panel.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menú");
      const label = toggle.querySelector(".menu-btn__text");
      if (label) label.textContent = "Menú";
      setBackgroundInert(false);
      if (restore && restoreFocus) toggle.focus();
    };

    toggle.addEventListener("click", () => {
      if (body.classList.contains("menu-open")) closeMenu();
      else openMenu();
    });

    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        const href = link.getAttribute("href") || "";
        const hash = href.startsWith("#") ? href : "";
        closeMenu({ restore: false });
        if (!hash) return;

        window.setTimeout(() => {
          const target = document.querySelector(hash);
          if (!target) return;
          target.setAttribute("tabindex", "-1");
          try {
            target.focus({ preventScroll: true });
          } catch {
            target.focus();
          }
          target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
        }, 60);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (!body.classList.contains("menu-open")) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") return;

      const items = focusables();
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.matchMedia("(min-width: 961px)").addEventListener("change", (event) => {
      if (event.matches && body.classList.contains("menu-open")) closeMenu({ restore: false });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960 && body.classList.contains("menu-open")) {
        closeMenu({ restore: false });
      }
    });
  }

  /* Revelado al hacer scroll -------------------------------------------- */
  const revealItems = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  /* Navegación activa --------------------------------------------------- */
  const navLinks = [...document.querySelectorAll("[data-nav-section]")];

  if (navLinks.length && "IntersectionObserver" in window) {
    const sections = navLinks
      .map((link) => document.getElementById(link.dataset.navSection))
      .filter(Boolean);

    const setActive = (id) => {
      navLinks.forEach((link) => {
        const active = link.dataset.navSection === id;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    const navObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-32% 0px -56% 0px", threshold: [0, 0.2, 0.5, 0.8] }
    );

    sections.forEach((section) => navObserver.observe(section));
  }
})();
