(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       CONFIGURACIÓN
       ========================================= */

    const CONFIG = {
      inicial: {
        pdf: "PLAN DE ESTUDIOS PEI.docx.pdf",
        title: "Profesorado en Educación Inicial"
      },

      primaria: {
        pdf: "PLAN DE ESTUDIOS PEP.docx.pdf",
        title: "Profesorado en Educación Primaria"
      }
    };


    /* =========================================
       ELEMENTOS
       ========================================= */

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

    const logo = document.querySelector(
      ".site-logo"
    );

    const header = document.querySelector(
      ".site-header"
    );


    /* =========================================
       ESTADO
       ========================================= */

    let activeCareer =
      body.dataset.career || "none";


    /* =========================================
       UTILIDADES
       ========================================= */

    function isValidCareer(career) {
      return Object.prototype.hasOwnProperty.call(
        CONFIG,
        career
      );
    }


    function getProgram(career) {

      if (!isValidCareer(career)) {
        return null;
      }

      return document.getElementById(
        "program-" + career
      );
    }


    /* =========================================
       SELECCIÓN DE CARRERA
       ========================================= */

    function selectCareer(
      career,
      shouldScroll = true
    ) {

      if (!isValidCareer(career)) {
        closeCareer(false);
        return;
      }

      activeCareer = career;

      body.dataset.career =
        career;


      /* -----------------------------------------
         Actualizar cards
         ----------------------------------------- */

      cards.forEach(function (card) {

        const isActive =
          card.dataset.career === career;

        card.setAttribute(
          "aria-expanded",
          String(isActive)
        );

        card.setAttribute(
          "aria-current",
          isActive
            ? "true"
            : "false"
        );

      });


      /* -----------------------------------------
         Mostrar únicamente el programa elegido
         ----------------------------------------- */

      programs.forEach(function (program) {

        const isActive =
          program.id ===
          "program-" + career;

        program.classList.toggle(
          "is-active",
          isActive
        );

        if (isActive) {

          const details =
            Array.from(
              program.querySelectorAll(
                "details"
              )
            );

          /*
           * Al abrir la carrera:
           * mostrar inicialmente solo
           * el primer año.
           */

          details.forEach(
            function (detail, index) {
              detail.open =
                index === 0;
            }
          );

        }

      });


      /* -----------------------------------------
         Actualizar URL
         ----------------------------------------- */

      const hash =
        career === "inicial"
          ? "educacion-inicial"
          : "educacion-primaria";


      if (
        window.location.hash !==
        "#" + hash
      ) {

        history.replaceState(
          null,
          "",
          "#" + hash
        );

      }


      /* -----------------------------------------
         Scroll suave
         ----------------------------------------- */

      if (shouldScroll) {

        const target =
          getProgram(career);

        if (target) {

          window.requestAnimationFrame(
            function () {

              target.scrollIntoView({
                behavior: "smooth",
                block: "start"
              });

            }
          );

        }

      }

    }


    /* =========================================
       CERRAR CARRERA
       ========================================= */

    function closeCareer(
      shouldScroll = true
    ) {

      activeCareer =
        "none";

      body.dataset.career =
        "none";


      cards.forEach(function (card) {

        card.setAttribute(
          "aria-expanded",
          "false"
        );

        card.setAttribute(
          "aria-current",
          "false"
        );

      });


      programs.forEach(function (program) {

        program.classList.remove(
          "is-active"
        );

      });


      if (
        window.location.hash
      ) {

        history.replaceState(
          null,
          "",
          window.location.pathname +
          window.location.search
        );

      }


      if (shouldScroll) {

        const offer =
          document.getElementById(
            "oferta"
          );

        if (offer) {

          offer.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }

      }

    }


    /* =========================================
       DESCARGA DIRECTA DEL PDF
       ========================================= */

    function downloadPlan(
      career
    ) {

      if (!isValidCareer(career)) {
        return;
      }


      const config =
        CONFIG[career];


      /*
       * Nombre del archivo dentro
       * del mismo proyecto de Vercel.
       */

      const filePath =
        encodeURI(
          config.pdf
        );


      /*
       * Crear enlace temporal.
       */

      const link =
        document.createElement(
          "a"
        );


      link.href =
        filePath;

      link.download =
        config.pdf;

      link.rel =
        "noopener";

      link.style.display =
        "none";


      document.body.appendChild(
        link
      );


      /*
       * Ejecutar descarga.
       */

      link.click();


      /*
       * Limpiar.
       */

      window.setTimeout(
        function () {

          link.remove();

        },
        300
      );

    }


    /* =========================================
       CLICK EN LAS CARDS
       ========================================= */

    cards.forEach(function (card) {

      card.addEventListener(
        "click",
        function () {

          const career =
            card.dataset.career;

          selectCareer(
            career,
            true
          );

        }
      );

    });


    /* =========================================
       BOTONES INTERNOS
       ========================================= */

    document.addEventListener(
      "click",
      function (event) {

        const actionButton =
          event.target.closest(
            "[data-action]"
          );


        if (!actionButton) {
          return;
        }


        const action =
          actionButton.dataset.action;


        /* -------------------------------------
           VOLVER
           ------------------------------------- */

        if (
          action === "back"
        ) {

          closeCareer(true);

          return;
        }


        /* -------------------------------------
           DESCARGAR / IMPRIMIR
           -------------------------------------
           
           El botón visual puede seguir
           llamándose "Imprimir plan",
           pero ahora descarga el PDF.
           ------------------------------------- */

        if (
          action === "print" ||
          action === "download"
        ) {

          const career =
            body.dataset.career;

          if (
            isValidCareer(career)
          ) {

            downloadPlan(
              career
            );

          }

        }

      }
    );


    /* =========================================
       SCROLL DEL HEADER
       ========================================= */

    function updateHeaderOnScroll() {

      const scrolled =
        window.scrollY > 40;


      body.classList.toggle(
        "is-scrolled",
        scrolled
      );


      if (header) {

        header.classList.toggle(
          "is-scrolled",
          scrolled
        );

      }

      if (logo) {

        logo.classList.toggle(
          "is-scrolled",
          scrolled
        );

      }

    }


    window.addEventListener(
      "scroll",
      updateHeaderOnScroll,
      {
        passive: true
      }
    );


    /*
     * Ejecutar una vez al cargar.
     */

    updateHeaderOnScroll();


    /* =========================================
       HASH DE LA URL
       ========================================= */

    function readHash() {

      const hash =
        window.location.hash
          .replace(
            "#",
            ""
          )
          .trim()
          .toLowerCase();


      if (
        hash ===
        "educacion-inicial"
      ) {

        selectCareer(
          "inicial",
          false
        );

        return;
      }


      if (
        hash ===
        "educacion-primaria"
      ) {

        selectCareer(
          "primaria",
          false
        );

        return;
      }


      closeCareer(false);

    }


    window.addEventListener(
      "hashchange",
      readHash
    );


    /* =========================================
       TECLADO
       ========================================= */

    document.addEventListener(
      "keydown",
      function (event) {

        /*
         * Escape:
         * cerrar programa.
         */

        if (
          event.key ===
          "Escape"
        ) {

          if (
            isValidCareer(
              activeCareer
            )
          ) {

            closeCareer(true);

          }

          return;
        }


        /*
         * Enter / Space sobre
         * elementos interactivos personalizados.
         */

        const target =
          event.target;


        if (
          target.classList &&
          target.classList.contains(
            "selector-card"
          )
        ) {

          if (
            event.key === "Enter" ||
            event.key === " "
          ) {

            event.preventDefault();

            target.click();

          }

        }

      }
    );


    /* =========================================
       EVITAR DOBLE APERTURA DE DETAILS
       ========================================= */

    programs.forEach(function (program) {

      const details =
        Array.from(
          program.querySelectorAll(
            "details"
          )
        );


      details.forEach(function (detail) {

        detail.addEventListener(
          "toggle",
          function () {

            /*
             * La animación queda a cargo de CSS.
             * Este listener existe para mantener
             * el comportamiento estable sin
             * modificar el contenido.
             */

          }
        );

      });

    });


    /* =========================================
       INICIALIZACIÓN
       ========================================= */

    readHash();

  });

})();
