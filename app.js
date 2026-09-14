(function () {
  "use strict";

  /*
   * ==========================================
   * CONFIGURACIÓN
   * ==========================================
   */

  const VALID_CAREERS = new Set([
    "inicial",
    "primaria"
  ]);


  /*
   * ==========================================
   * ELEMENTOS
   * ==========================================
   */

  const body = document.body;

  const cards = Array.from(
    document.querySelectorAll(
      ".selector-card[data-career]"
    )
  );

  const programs = Array.from(
    document.querySelectorAll(
      ".program"
    )
  );

  const offerSection =
    document.getElementById("oferta");

  const sectionTitle =
    document.getElementById("section-title");

  const printSheet =
    document.getElementById("print-sheet");

  const printContent =
    document.getElementById("print-content");


  /*
   * Carrera que está actualmente
   * seleccionada para impresión.
   */

  let printCareer = null;


  /*
   * ==========================================
   * UTILIDADES
   * ==========================================
   */

  function isValidCareer(career) {
    return VALID_CAREERS.has(career);
  }


  function getProgram(career) {

    if (!isValidCareer(career)) {
      return null;
    }

    return document.getElementById(
      `program-${career}`
    );
  }


  /*
   * ==========================================
   * SELECCIÓN DE PROFESORADO
   * ==========================================
   */

  function setCareer(
    career,
    options = {}
  ) {

    const {
      scroll = true
    } = options;

    const valid =
      isValidCareer(career);


    /*
     * Estado global.
     */

    body.dataset.career =
      valid
        ? career
        : "none";


    /*
     * Actualiza las cards.
     */

    cards.forEach((card) => {

      const active =
        valid &&
        card.dataset.career === career;

      card.setAttribute(
        "aria-expanded",
        String(active)
      );

      card.setAttribute(
        "aria-current",
        active
          ? "true"
          : "false"
      );

    });


    /*
     * Muestra un solo programa.
     */

    programs.forEach((program) => {

      const active =
        valid &&
        program.id ===
          `program-${career}`;

      program.classList.toggle(
        "is-active",
        active
      );


      /*
       * Cuando se abre un programa,
       * abrimos inicialmente el primer año.
       */

      if (active) {

        const details =
          Array.from(
            program.querySelectorAll(
              "details"
            )
          );

        details.forEach(
          (detail, index) => {

            detail.open =
              index === 0;

          }
        );

      }

    });


    /*
     * Desplazamiento suave.
     */

    if (
      valid &&
      scroll &&
      offerSection
    ) {

      window.requestAnimationFrame(() => {

        offerSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      });

    }

  }


  /*
   * ==========================================
   * IMPRESIÓN
   * ==========================================
   *
   * La impresión se hace mediante una copia
   * temporal del programa seleccionado.
   *
   * De este modo no alteramos permanentemente
   * la versión visible de la página.
   */


  function preparePrintClone(career) {

    if (!printContent) {
      return null;
    }

    const source =
      getProgram(career);

    if (!source) {
      return null;
    }


    /*
     * Limpiar cualquier impresión anterior.
     */

    printContent.innerHTML = "";


    /*
     * Clonamos solamente el programa.
     */

    const clone =
      source.cloneNode(true);


    /*
     * El clon no necesita ID porque
     * solo existe para impresión.
     */

    clone.removeAttribute("id");


    clone.classList.add(
      "print-program"
    );


    /*
     * Nos aseguramos de que esté visible.
     */

    clone.style.display =
      "block";


    /*
     * Para imprimir deben estar abiertos
     * los cuatro años.
     */

    clone
      .querySelectorAll("details")
      .forEach((detail) => {

        detail.open = true;

      });


    /*
     * Añadimos el clon al contenedor
     * exclusivo de impresión.
     */

    printContent.appendChild(
      clone
    );


    return clone;
  }


  /*
   * ==========================================
   * AJUSTE A UNA SOLA PÁGINA
   * ==========================================
   *
   * Área imprimible:
   *
   * A4:
   * 210 × 297 mm
   *
   * Márgenes:
   * 20 mm
   *
   * Resultado:
   * 170 × 257 mm
   *
   * Medimos el contenido real y lo reducimos
   * mediante transform: scale() si supera
   * la altura disponible.
   */

  function fitPrintToOnePage() {

    if (!printContent) {
      return;
    }


    /*
     * Estado inicial.
     */

    printContent.style.transform =
      "scale(1)";

    printContent.style.transformOrigin =
      "top left";

    printContent.style.width =
      "170mm";


    /*
     * Forzar cálculo del layout.
     */

    void printContent.offsetHeight;


    /*
     * Altura natural del contenido.
     */

    const naturalHeight =
      printContent.scrollHeight;


    /*
     * Altura física disponible.
     */

    const sheetHeight =
      printSheet
        ? printSheet.clientHeight
        : 0;


    if (
      naturalHeight <= 0 ||
      sheetHeight <= 0
    ) {
      return;
    }


    /*
     * Escala necesaria.
     *
     * Nunca ampliamos.
     */

    const scale =
      Math.min(
        1,
        sheetHeight /
          naturalHeight
      );


    /*
     * Aplicamos escala.
     */

    printContent.style.transform =
      `scale(${scale})`;


    /*
     * Compensamos el ancho para que
     * transform-origin funcione correctamente.
     */

    printContent.style.width =
      `calc(170mm / ${scale})`;

  }


  /*
   * ==========================================
   * ABRIR MODO IMPRESIÓN
   * ==========================================
   */

  function openPrintMode(career) {

    if (!isValidCareer(career)) {
      return;
    }

    if (!printSheet || !printContent) {
      return;
    }


    /*
     * Guardamos la carrera.
     */

    printCareer = career;


    /*
     * Activamos estado de impresión.
     */

    body.dataset.printing =
      "true";

    body.dataset.career =
      career;


    /*
     * Preparamos copia.
     */

    const clone =
      preparePrintClone(
        career
      );


    if (!clone) {

      closePrintMode();

      return;
    }


    /*
     * Esperamos a que el navegador
     * termine de renderizar el clon.
     *
     * Dos frames dan mayor estabilidad
     * en Chrome y navegadores basados
     * en Chromium.
     */

    requestAnimationFrame(() => {

      requestAnimationFrame(() => {

        fitPrintToOnePage();

        /*
         * Abrir diálogo de impresión.
         */

        window.print();

      });

    });

  }


  /*
   * ==========================================
   * CERRAR MODO IMPRESIÓN
   * ==========================================
   */

  function closePrintMode() {

    body.removeAttribute(
      "data-printing"
    );


    /*
     * Limpiar clon.
     */

    if (printContent) {

      printContent.innerHTML =
        "";

      printContent.style.transform =
        "";

      printContent.style.width =
        "";

      printContent.style.transformOrigin =
        "";

    }


    /*
     * Restaurar carrera.
     */

    if (
      printCareer &&
      isValidCareer(printCareer)
    ) {

      setCareer(
        printCareer,
        {
          scroll: false
        }
      );

    }


    printCareer = null;

  }


  /*
   * ==========================================
   * CLICK EN CARDS
   * ==========================================
   */

  cards.forEach((card) => {

    card.addEventListener(
      "click",
      () => {

        const career =
          card.dataset.career;

        setCareer(
          career
        );

      }
    );

  });


  /*
   * ==========================================
   * ACCIONES INTERNAS
   * ==========================================
   */

  document.addEventListener(
    "click",
    (event) => {

      const action =
        event.target.closest(
          "[data-action]"
        );


      if (!action) {
        return;
      }


      const actionType =
        action.dataset.action;


      /*
       * VOLVER
       */

      if (
        actionType === "back"
      ) {

        setCareer(
          "none",
          {
            scroll: false
          }
        );


        if (sectionTitle) {

          sectionTitle.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }

        return;
      }


      /*
       * IMPRIMIR
       */

      if (
        actionType === "print"
      ) {

        const activeCareer =
          body.dataset.career;


        if (
          isValidCareer(
            activeCareer
          )
        ) {

          openPrintMode(
            activeCareer
          );

        }

      }

    }
  );


  /*
   * ==========================================
   * EVENTO AFTERPRINT
   * ==========================================
   */

  window.addEventListener(
    "afterprint",
    () => {

      closePrintMode();

    }
  );


  /*
   * ==========================================
   * RESIZE
   * ==========================================
   *
   * Útil si el navegador recalcula dimensiones
   * antes de lanzar realmente el diálogo.
   */

  window.addEventListener(
    "resize",
    () => {

      if (
        body.dataset.printing ===
        "true"
      ) {

        fitPrintToOnePage();

      }

    }
  );


  /*
   * ==========================================
   * HASH / URL
   * ==========================================
   *
   * Permite:
   *
   * #educacion-inicial
   * #educacion-primaria
   */

  window.addEventListener(
    "hashchange",
    () => {

      const hash =
        window.location.hash
          .replace("#", "")
          .trim();


      if (
        hash ===
        "educacion-inicial"
      ) {

        setCareer(
          "inicial",
          {
            scroll: true
          }
        );

        return;
      }


      if (
        hash ===
        "educacion-primaria"
      ) {

        setCareer(
          "primaria",
          {
            scroll: true
          }
        );

        return;
      }


      if (!hash) {

        setCareer(
          "none",
          {
            scroll: false
          }
        );

      }

    }
  );


  /*
   * ==========================================
   * CARGA INICIAL
   * ==========================================
   */

  const initialHash =
    window.location.hash
      .replace("#", "")
      .trim();


  if (
    initialHash ===
    "educacion-inicial"
  ) {

    setCareer(
      "inicial",
      {
        scroll: false
      }
    );

  }


  if (
    initialHash ===
    "educacion-primaria"
  ) {

    setCareer(
      "primaria",
      {
        scroll: false
      }
    );

  }


  /*
   * ==========================================
   * ATAJO CTRL/CMD + P
   * ==========================================
   */

  document.addEventListener(
    "keydown",
    (event) => {

      const isPrintShortcut =
        (
          event.ctrlKey ||
          event.metaKey
        ) &&
        event.key.toLowerCase() ===
          "p";


      if (!isPrintShortcut) {
        return;
      }


      const activeCareer =
        body.dataset.career;


      if (
        !isValidCareer(
          activeCareer
        )
      ) {
        return;
      }


      event.preventDefault();


      openPrintMode(
        activeCareer
      );

    }
  );

})();
