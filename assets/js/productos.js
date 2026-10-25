/* ==========================================================================
   Un Viaje Astral — catálogo, filtros y detalle de producto
   ========================================================================== */
(() => {
  "use strict";

  const PRODUCTS = {
    runtz: {
      name: "Runtz",
      category: "Flores y extractos",
      note: "Afrutado dulce · Efecto relajante",
      description: "Aromas y sabores: afrutado dulce. Efecto: relajante.",
      specs: [
        ["THC", "23–26%"],
        ["Aromas", "Afrutado dulce"],
        ["Efectos", "Relajante"],
        ["Formato", "Flores"]
      ]
    },
    "green-poison": {
      name: "Green Poison",
      category: "Flores y extractos",
      note: "Afrutado, especiado y dulce · Creatividad",
      description: "Aromas y sabores: afrutado, especias, skunk y dulce. Efectos: relajante y creatividad.",
      specs: [
        ["THC", "15–20%"],
        ["Aromas", "Afrutado, especias, skunk y dulce"],
        ["Efectos", "Relajante y creatividad"],
        ["Formato", "Flores"]
      ]
    },
    "sweet-mandarine-zkittlez": {
      name: "Sweet Mandarine Zkittlez",
      category: "Flores y extractos",
      note: "Cítrico, dulce y fresco · Estimulante",
      description: "Aromas y sabores: dulce, diesel, especias, naranja, mango, pino y fresco. Efectos: estimulante, creatividad y bienestar.",
      specs: [
        ["THC", "19–24%"],
        ["Aromas", "Dulce, diesel, naranja, mango y pino"],
        ["Efectos", "Estimulante, creatividad y bienestar"],
        ["Formato", "Flores"]
      ]
    },
    "cream-mandarine": {
      name: "Cream Mandarine",
      category: "Flores y extractos",
      note: "Frutos rojos y mandarina · Creativo",
      description: "Aromas y sabores: frutos rojos, agrio, cítricos, mandarina y agridulce. Efectos: psicoactivo, creativo, estimulante y relajante.",
      specs: [
        ["THC", "18–20%"],
        ["Aromas", "Frutos rojos, cítricos y mandarina"],
        ["Efectos", "Creativo, estimulante y relajante"],
        ["Formato", "Flores"]
      ]
    },
    "cbd-compassion-lime": {
      name: "CBD Compassion Lime",
      category: "Flores y extractos",
      note: "Cítrico, lima y picante · Psicoactividad reducida",
      description: "Aromas y sabores: cítricos, lima y picante. Efectos: fuertes efectos corporales y psicoactividad reducida.",
      specs: [
        ["CBD", "13,5%"],
        ["Aromas", "Cítricos, lima y picante"],
        ["Efectos", "Corporales, psicoactividad reducida"],
        ["Formato", "Flores"]
      ]
    },
    "red-pure-cbd": {
      name: "Red Pure CBD",
      category: "Flores y extractos",
      note: "Bosque, pino y frutos del bosque · Relajante",
      description: "Aromas y sabores: ciprés, terroso, pino, fresco, frutos del bosque y dulce. Efectos: relajante y medicinal.",
      specs: [
        ["CBD", "15–17%"],
        ["THC", "0,4–0,5%"],
        ["Aromas", "Ciprés, pino y frutos del bosque"],
        ["Formato", "Flores"]
      ]
    },
    prerolls: {
      name: "Pre Rolls",
      category: "Flores y extractos",
      note: "Armados a mano · Combustión pareja",
      description: "Perfectamente armados, proporcionan una combustión limpia, buen tiraje y queman de manera uniforme. Armá tu combinación favorita con las diferentes genéticas que tenemos en stock.",
      specs: [
        ["Formato", "Pre-rolls armados a mano"],
        ["Genéticas", "Según stock disponible"],
        ["Combustión", "Limpia y uniforme"],
        ["Categoría", "Flores y extractos"]
      ]
    },
    "rosin-hash": {
      name: "Rosin Hash",
      category: "Flores y extractos",
      note: "Extracción sin solventes · Alta pureza",
      description: "El rosin es una extracción libre de solventes químicos. Se trata de una técnica versátil que podemos practicar ya sea partiendo desde flores así como desde hash, dándonos la posibilidad de obtener extractos de muy alta calidad y pureza, libre de residuos. Consultá el stock de genéticas disponibles.",
      specs: [
        ["Extracción", "Sin solventes químicos"],
        ["Origen", "Hash"],
        ["Pureza", "Alta, libre de residuos"],
        ["Genéticas", "Según stock disponible"]
      ]
    },
    "rosin-de-flor": {
      name: "Rosin de Flor",
      category: "Flores y extractos",
      note: "Extracción sin solventes · Alta pureza",
      description: "El rosin es una extracción libre de solventes químicos. Se trata de una técnica versátil que podemos practicar partiendo desde flores, dándonos la posibilidad de obtener extractos de muy alta calidad y pureza, libre de residuos. Consultá el stock de genéticas disponibles.",
      specs: [
        ["Extracción", "Sin solventes químicos"],
        ["Origen", "Flores"],
        ["Pureza", "Alta, libre de residuos"],
        ["Genéticas", "Según stock disponible"]
      ]
    },
    "aceite-cbd": {
      name: "Aceite CBD",
      category: "Fitoderivados",
      note: "100% CBD · Equilibrio y descanso",
      description: "Efecto ansiolítico, relajante y mejorador del sueño. Acompaña la búsqueda de un equilibrio tanto mental como corporal.",
      specs: [
        ["Composición", "100% CBD"],
        ["Concentración", "20 / 40 mg/ml"],
        ["Contenido", "10 ml"],
        ["Calidad", "Testeado en laboratorio"]
      ]
    },
    "aceite-thc-cbd": {
      name: "Aceite THC y CBD",
      category: "Fitoderivados",
      note: "Ratio 1:1 · Acompañamiento del dolor",
      description: "Efecto antiinflamatorio, ideal para el tratamiento del dolor, náuseas y falta de apetito.",
      specs: [
        ["Ratio", "1:1 THC / CBD"],
        ["Concentración", "20 / 40 mg/ml"],
        ["Contenido", "10 ml"],
        ["Calidad", "Testeado en laboratorio"]
      ]
    },
    "tintura-madre": {
      name: "Tintura Madre",
      category: "Fitoderivados",
      note: "Cannabis, lavanda y rosa mosqueta",
      description: "A base de cannabis, lavanda, rosa mosqueta, caléndula e hipérico. Contiene propiedades sedantes, antiinflamatorias, digestivas, antibacterianas, cicatrizantes, antisépticas, astringentes, antioxidantes y antimicrobianas.",
      specs: [
        ["Base", "Cannabis, lavanda, rosa mosqueta, caléndula e hipérico"],
        ["Contenido", "10 ml"],
        ["Categoría", "Fitoderivados"]
      ]
    },
    "aceites-esenciales": {
      name: "Aceites Esenciales",
      category: "Fitoderivados",
      note: "Aromaterapia · Óleo 31, almendras y caléndula",
      description: "A base de cannabis, óleo 31, almendras y caléndula. Beneficios terapéuticos: uso en aromaterapia. Relajante, antibacterial, antiséptico, mitiga la migraña.",
      specs: [
        ["Base", "Cannabis, óleo 31, almendras y caléndula"],
        ["Concentración", "20 / 40 mg/ml"],
        ["Contenido", "10 cc"],
        ["Uso", "Aromaterapia"]
      ]
    },
    "unguento-mix": {
      name: "Ungüento Mix",
      category: "Fitoderivados",
      note: "CBD + THC · Analgésico y antiinflamatorio",
      description: "Ungüento a base de cannabis. Contiene propiedades analgésicas y antiinflamatorias.",
      specs: [
        ["Composición", "CBD + THC"],
        ["Contenido", "30 cc"],
        ["Categoría", "Fitoderivados"]
      ]
    },
    "unguento-cbd": {
      name: "Ungüento CBD",
      category: "Fitoderivados",
      note: "Rosa mosqueta y lavanda · Cicatrizante",
      description: "Ungüento a base de cannabis, rosa mosqueta y lavanda. Contiene propiedades cicatrizantes e hidratantes.",
      specs: [
        ["Composición", "CBD + THC, rosa mosqueta y lavanda"],
        ["Contenido", "30 cc"],
        ["Categoría", "Fitoderivados"]
      ]
    },
    "gel-intimo": {
      name: "Gel Íntimo",
      category: "Cosmética",
      note: "Base acuosa · Sin efecto psicoactivo",
      description: "Gel íntimo cannábico de base acuosa. Apto para zonas erógenas como vulva, clítoris, ano, pene y pezones. Los efectos duran entre 40 minutos y una hora. No contiene efecto psicoactivo.",
      specs: [
        ["Propiedades", "Analgésico, reduce inflamaciones, aumenta la lubricación natural y la sensibilidad, la humedad y elasticidad de los tejidos, estimula las terminaciones sensitivas del clítoris y el flujo sanguíneo de la vulva."],
        ["Contenido", "30 cc"],
        ["Base", "Acuosa"],
        ["Psicoactividad", "No contiene"]
      ]
    },
    "jabon-liquido": {
      name: "Jabón Líquido",
      category: "Cosmética",
      note: "Aloe vera, caléndula, almendras y cannabis",
      description: "A base de aloe vera, caléndula, almendras y cannabis.",
      specs: [
        ["Ingredientes", "Aloe vera, caléndula, almendras y cannabis"],
        ["Contenido", "500 ml"],
        ["Categoría", "Cosmética"]
      ]
    },
    "jabon-solido": {
      name: "Jabón Sólido",
      category: "Cosmética",
      note: "Cannabis, aloe vera y almendras · Antibacterial",
      description: "A base de cannabis, aloe vera, caléndula y almendras. Contiene propiedades antibacteriales. Ideal para aliviar acné, arrugas o rojeces.",
      specs: [
        ["Ingredientes", "Cannabis, aloe vera, caléndula y almendras"],
        ["Propiedades", "Antibacteriales"],
        ["Contenido", "25 g"],
        ["Categoría", "Cosmética"]
      ]
    },
    "sales-de-bano": {
      name: "Sales de Baño",
      category: "Cosmética",
      note: "Aromaterapia · Relaja e hidrata",
      description: "Uso en aromaterapia. Relaja e hidrata la piel.",
      specs: [
        ["Uso", "Aromaterapia"],
        ["Beneficios", "Relaja e hidrata la piel"],
        ["Contenido", "50 ml"],
        ["Categoría", "Cosmética"]
      ]
    },
    "bombas-de-bano": {
      name: "Bombas de Baño",
      category: "Cosmética",
      note: "Aromaterapia · Relajante e hidratante",
      description: "Uso en aromaterapia. Relajante e hidratante de la piel.",
      specs: [
        ["Uso", "Aromaterapia"],
        ["Beneficios", "Relajante e hidratante"],
        ["Contenido", "16 g"],
        ["Categoría", "Cosmética"]
      ]
    },
    "yerba-buena": {
      name: "Yerba Buena",
      category: "Comestibles",
      note: "Yerba mate compuesta · No psicoactiva",
      description: "Yerba mate compuesta con cannabis. Digestiva. No psicoactiva.",
      specs: [
        ["Base", "Yerba mate compuesta con cannabis"],
        ["Propiedades", "Digestiva"],
        ["Psicoactividad", "No psicoactiva"],
        ["Contenido", "500 g"]
      ]
    },
    "morral-impermeable": {
      name: "Morral Impermeable",
      category: "Merchandising",
      note: "Interior impermeable · Bolsillos y mosquetones",
      description: "Morral con interior impermeable, bolsillos internos y externos, mosquetones y accesorio porta-tucas.",
      specs: [
        ["Interior", "Impermeable"],
        ["Bolsillos", "Internos y externos"],
        ["Accesorios", "Mosquetones y porta-tucas"],
        ["Categoría", "Merchandising"]
      ]
    },
    "morral-de-cuero": {
      name: "Morral de Cuero",
      category: "Merchandising",
      note: "Cuero · Forrería impermeable",
      description: "Morral de cuero con bolsillo secundario, correas regulables, forrería impermeable a tono, avíos metálicos en bronce viejo y deslizador metálico en bronce viejo.",
      specs: [
        ["Material", "Cuero"],
        ["Bolsillos", "Principal y secundario"],
        ["Correas", "Regulables"],
        ["Detalles", "Forrería impermeable y avíos en bronce viejo"]
      ]
    },
    "remera-oversize": {
      name: "Remera Oversize",
      category: "Merchandising",
      note: "Estampa HD · 100% algodón",
      description: "Modelo oversize con estampa HD. 4 talles disponibles.",
      specs: [
        ["Calidad", "100% algodón"],
        ["Talles", "4 talles disponibles"],
        ["Estampa", "HD"],
        ["Categoría", "Merchandising"]
      ]
    },
    "gorra-con-visera": {
      name: "Gorra con Visera",
      category: "Merchandising",
      note: "Correa regulable · Negro, gris y verde",
      description: "Gorra con visera y correa regulable.",
      specs: [
        ["Colores", "Negro, gris y verde"],
        ["Ajuste", "Correa regulable"],
        ["Categoría", "Merchandising"]
      ]
    }
  };

  const grid = document.querySelector("[data-product-grid]");
  if (!grid) return;

  const cards = [...grid.querySelectorAll("[data-product]")];
  const chips = [...document.querySelectorAll("[data-filter]")];
  const search = document.querySelector("[data-search-input]");
  const searchWrap = document.querySelector("[data-search-wrap]");
  const searchClear = document.querySelector("[data-search-clear]");
  const resultsCount = document.querySelector("#results-count");
  const clearFilters = document.querySelector("[data-clear-filters]");
  const emptyState = document.querySelector("[data-empty]");
  const resetEmpty = document.querySelector("[data-reset-empty]");
  const dialog = document.querySelector("#product-dialog");
  const dialogImage = dialog?.querySelector("[data-dialog-image]");
  const dialogCategory = dialog?.querySelector("[data-dialog-category]");
  const dialogEyebrow = dialog?.querySelector("[data-dialog-eyebrow]");
  const dialogTitle = dialog?.querySelector("[data-dialog-title]");
  const dialogNote = dialog?.querySelector("[data-dialog-note]");
  const dialogDesc = dialog?.querySelector("[data-dialog-desc]");
  const dialogSpecs = dialog?.querySelector("[data-dialog-specs]");
  const dialogWa = dialog?.querySelector("[data-dialog-wa]");

  const validCategories = new Set(["all", ...cards.map((card) => card.dataset.category)]);
  const state = { category: "all", query: "" };
  let lastTrigger = null;
  let currentSlug = "";
  let searchTimer = 0;

  const normalize = (value) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const updateURL = ({ includeProduct = false } = {}) => {
    const params = new URLSearchParams();
    if (state.category !== "all") params.set("categoria", state.category);
    if (state.query.trim()) params.set("q", state.query.trim());

    const query = params.toString();
    const hash = includeProduct && currentSlug ? `#producto-${currentSlug}` : "";
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${hash}`);
  };

  const applyFilters = ({ updateHistory = true, includeProduct = false } = {}) => {
    const terms = normalize(state.query).split(/\s+/).filter(Boolean);
    let visible = 0;

    cards.forEach((card) => {
      const matchesCategory = state.category === "all" || card.dataset.category === state.category;
      const haystack = normalize(`${card.dataset.search || ""} ${card.querySelector("h3")?.textContent || ""}`);
      const matchesQuery = terms.every((term) => haystack.includes(term));
      const show = matchesCategory && matchesQuery;

      card.hidden = !show;
      if (show) visible += 1;
    });

    if (resultsCount) {
      resultsCount.innerHTML = `Mostrando <strong>${visible}</strong> de ${cards.length} productos`;
    }

    if (emptyState) emptyState.hidden = visible !== 0;
    if (grid) grid.hidden = visible === 0;
    if (clearFilters) clearFilters.hidden = state.category === "all" && !state.query.trim();

    chips.forEach((chip) => {
      const active = chip.dataset.filter === state.category;
      chip.setAttribute("aria-pressed", String(active));
    });

    searchWrap?.classList.toggle("has-value", state.query.length > 0);

    if (updateHistory) updateURL({ includeProduct });
  };

  const resetFilters = () => {
    state.category = "all";
    state.query = "";
    if (search) search.value = "";
    applyFilters();
    search?.focus();
  };

  /* Conteos por categoría ------------------------------------------------ */
  document.querySelectorAll("[data-count-for]").forEach((span) => {
    const key = span.dataset.countFor;
    const total =
      key === "all"
        ? cards.length
        : cards.filter((card) => card.dataset.category === key).length;
    span.textContent = String(total);
  });

  /* Filtros y búsqueda --------------------------------------------------- */
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      state.category = validCategories.has(chip.dataset.filter) ? chip.dataset.filter : "all";
      applyFilters();
    });
  });

  search?.addEventListener("input", () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      state.query = search.value;
      applyFilters();
    }, 120);
  });

  searchClear?.addEventListener("click", () => {
    if (search) {
      search.value = "";
      search.focus();
    }
    state.query = "";
    applyFilters();
  });

  clearFilters?.addEventListener("click", resetFilters);
  resetEmpty?.addEventListener("click", resetFilters);

  /* Dialog de producto --------------------------------------------------- */
  const buildSpecs = (specs = []) => {
    if (!dialogSpecs) return;
    dialogSpecs.replaceChildren();
    specs.forEach(([label, value]) => {
      const wrapper = document.createElement("div");
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = label;
      detail.textContent = value;
      wrapper.append(term, detail);
      dialogSpecs.append(wrapper);
    });
  };

  const openProduct = (slug, trigger) => {
    const product = PRODUCTS[slug];
    if (!product || !dialog || !dialogTitle) return;

    currentSlug = slug;
    lastTrigger = trigger || document.querySelector(`[data-product-link="${slug}"]`);

    if (dialogImage) {
      dialogImage.src = `assets/img/${slug}.webp`;
      dialogImage.alt = product.name;
    }
    if (dialogCategory) dialogCategory.textContent = product.category;
    if (dialogEyebrow) dialogEyebrow.textContent = product.category;
    dialogTitle.textContent = product.name;
    if (dialogNote) dialogNote.textContent = product.note;
    if (dialogDesc) dialogDesc.textContent = product.description;
    buildSpecs(product.specs);

    if (dialogWa) {
      const message = encodeURIComponent(
        `Hola, quisiera consultar por ${product.name} de Un Viaje Astral.`
      );
      dialogWa.href = `https://wa.me/5493434151054?text=${message}`;
    }

    document.body.classList.add("dialog-open");
    updateURL({ includeProduct: true });

    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  };

  const closeProduct = () => {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-product-link]");
    if (!link) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

    event.preventDefault();
    openProduct(link.dataset.productLink, link);
  });

  dialog?.querySelectorAll("[data-dialog-close]").forEach((button) => {
    button.addEventListener("click", closeProduct);
  });

  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeProduct();
  });

  dialog?.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    currentSlug = "";
    updateURL();

    if (lastTrigger) {
      try {
        lastTrigger.focus({ preventScroll: true });
      } catch {
        lastTrigger.focus();
      }
      lastTrigger = null;
    }
  });

  /* Estado inicial desde la URL ----------------------------------------- */
  const params = new URLSearchParams(window.location.search);
  const categoryParam = params.get("categoria");
  const queryParam = params.get("q") || "";

  if (categoryParam && validCategories.has(categoryParam)) {
    state.category = categoryParam;
  }
  if (queryParam) {
    state.query = queryParam;
    if (search) search.value = queryParam;
  }

  applyFilters({ updateHistory: false });

  window.addEventListener("hashchange", () => {
    const nextHash = window.location.hash;
    if (nextHash.startsWith("#producto-")) {
      const slug = nextHash.replace("#producto-", "");
      if (PRODUCTS[slug] && slug !== currentSlug) openProduct(slug);
      return;
    }
    if (dialog?.open) closeProduct();
  });

  const hash = window.location.hash;
  if (hash.startsWith("#producto-")) {
    const slug = hash.replace("#producto-", "");
    if (PRODUCTS[slug]) {
      window.setTimeout(() => openProduct(slug), 80);
    }
  }
})();
