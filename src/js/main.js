document.addEventListener("DOMContentLoaded", () => {
  setupHeroSlider();
  setupCoverageMap();
  setupModal();
  setupForm();
  setupScrollVisibility();
  setupFaqAccordion();
});

// Hero Carretera — Control de 3 secciones por flechas, marcador inferior y gesto de deslizar (swipe)
function setupHeroSlider() {
  const heroSection = document.getElementById("hero-slider");
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  const prevBtn = document.getElementById("hero-prev-btn");
  const nextBtn = document.getElementById("hero-next-btn");
  const slidesContainer = document.querySelector(".hero-slides-container");

  if (!slides.length) return;

  let current = 0;
  let autoTimer = null;
  const INTERVAL_MS = 5500;

  const goToSlide = (index) => {
    slides[current]?.classList.remove("active");
    dots[current]?.classList.remove("active");

    current = (index + slides.length) % slides.length;

    slides[current]?.classList.add("active");
    dots[current]?.classList.add("active");
  };

  const startAuto = () => {
    stopAuto();
    autoTimer = setInterval(() => {
      goToSlide(current + 1);
    }, INTERVAL_MS);
  };

  const stopAuto = () => {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  };

  // Eventos de flechas
  prevBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    goToSlide(current - 1);
    startAuto();
  });

  nextBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    goToSlide(current + 1);
    startAuto();
  });

  // Eventos de dots
  dots.forEach((dot, idx) => {
    dot.addEventListener("click", (e) => {
      e.preventDefault();
      const targetIdx = parseInt(dot.dataset.slide ?? idx, 10);
      goToSlide(targetIdx);
      startAuto();
    });
  });

  // Soporte de Deslizar (Touch Swipe & Mouse Drag)
  let startX = 0;
  let endX = 0;

  const handleSwipe = () => {
    const diffX = startX - endX;
    const threshold = 50; // Mínimo 50px de movimiento para cambiar
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Deslizar izquierda -> Siguiente
        goToSlide(current + 1);
      } else {
        // Deslizar derecha -> Anterior
        goToSlide(current - 1);
      }
      startAuto();
    }
  };

  if (slidesContainer || heroSection) {
    const target = slidesContainer || heroSection;

    target.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    target.addEventListener("touchend", (e) => {
      endX = e.changedTouches[0].clientX;
      handleSwipe();
    }, { passive: true });

    target.addEventListener("mousedown", (e) => {
      startX = e.clientX;
    });

    target.addEventListener("mouseup", (e) => {
      endX = e.clientX;
      handleSwipe();
    });
  }

  startAuto();
}

// Mapa de Cobertura Interactivo (chips de ciudades mueven el mapa)
function setupCoverageMap() {
  const chips = document.querySelectorAll("#coverage-chips .coverage-chip");
  const mapIframe = document.getElementById("coverage-map");
  if (!chips.length || !mapIframe) return;

  const API_KEY = "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const query = chip.dataset.query;
      const zoom = chip.dataset.zoom || "12";
      if (!query) return;

      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");

      mapIframe.src = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${query}&zoom=${zoom}`;
    });
  });
}

// Acordeón de Preguntas Frecuentes (FAQ)
function setupFaqAccordion() {
  const faqQuestions = document.querySelectorAll(".faq-question");
  faqQuestions.forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      if (!item) return;
      const isActive = item.classList.contains("active");

      // Cerrar otros abiertos (comportamiento acordeón limpio)
      document.querySelectorAll(".faq-item.active").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("active");
          const openQuestion = openItem.querySelector(".faq-question");
          if (openQuestion) openQuestion.setAttribute("aria-expanded", "false");
        }
      });

      if (isActive) {
        item.classList.remove("active");
        btn.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("active");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

// Control de visibilidad del Header Fijo (CTA Bar) y Botón Flotante de WhatsApp al scrollear
function setupScrollVisibility() {
  const whatsappFloat = document.querySelector(".whatsapp-float");
  const ctaBar = document.querySelector(".cta-bar");

  const handleScroll = () => {
    const scrollY = window.scrollY;

    // Header fijo: solo visible al empezar a scrollear (> 80px)
    if (ctaBar) {
      if (scrollY > 80) {
        ctaBar.classList.add("visible");
      } else {
        ctaBar.classList.remove("visible");
      }
    }

    // Botón flotante WhatsApp
    if (whatsappFloat) {
      if (scrollY > 150) {
        whatsappFloat.classList.add("visible");
      } else {
        whatsappFloat.classList.remove("visible");
      }
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}

// Modal Diagnóstico
function setupModal() {
  const overlay = document.getElementById("modal-overlay");
  const openBtns = document.querySelectorAll(".open-modal-btn");
  const closeBtn = document.getElementById("modal-close-btn");

  if (!overlay) return;

  const openModal = () => {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    const firstInput = overlay.querySelector("input, select");
    if (firstInput) firstInput.focus();
  };

  const closeModal = () => {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  };

  openBtns.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    }),
  );

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      closeModal();
    }
  });
}

// Formulario de Contacto FormSubmit AJAX (Prueba: alejandro.j.santini@gmail.com)
function setupForm() {
  const form = document.getElementById("diagnostico-form");
  const submitBtn = document.getElementById("form-submit-btn");
  const responseMsg = document.getElementById("form-response-msg");
  if (!form) return;

  // CORREO DESTINO (Cambiar a ventas@batec.com.ar cuando desees pasar a producción)
  const targetEmail = "alejandro.j.santini@gmail.com";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Filtro anti-spam Honeypot
    const honeypot = form.querySelector('[name="website_hp"]');
    if (honeypot && honeypot.value) {
      return;
    }

    const company = form.querySelector("#company_name").value.trim();
    const phone = form.querySelector("#phone_number").value.trim();
    const need = form.querySelector("#need_type").value;
    const message =
      form.querySelector("#notes")?.value.trim() ||
      "Sin comentarios adicionales";

    if (!company || !phone || !need) return;

    // Estado visual de carga
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = "<span>Enviando solicitud...</span>";
    }
    if (responseMsg) {
      responseMsg.style.display = "none";
      responseMsg.className = "form-response-msg";
    }

    try {
      const response = await fetch(
        `https://formsubmit.co/ajax/${targetEmail}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            _subject: `Nuevo Diagnóstico Técnico B2B: ${company}`,
            _template: "table",
            _captcha: "false",
            "Empresa / Comercio": company,
            "Teléfono / WhatsApp": phone,
            "Servicio de Interés": need,
            "Detalle o Consulta": message,
          }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success === "true") {
        if (responseMsg) {
          responseMsg.className = "form-response-msg success";
          responseMsg.innerHTML =
            "✅ <strong>¡Solicitud enviada con éxito!</strong> Recibirás la respuesta en tu correo a la brevedad.";
          responseMsg.style.display = "block";
        }

        form.reset();

        // Cerrar modal tras 3 segundos
        setTimeout(() => {
          const overlay = document.getElementById("modal-overlay");
          if (overlay) overlay.classList.remove("active");
          document.body.style.overflow = "";
          if (responseMsg) responseMsg.style.display = "none";
        }, 3200);
      } else {
        throw new Error(data.message || "Error al enviar");
      }
    } catch (err) {
      console.error("Error FormSubmit:", err);
      if (responseMsg) {
        responseMsg.className = "form-response-msg error";
        responseMsg.innerHTML =
          'Ocurrió un inconveniente. También podés consultarnos directamente por <a href="https://wa.me/5493446548884?text=%C2%A1Hola!%20%F0%9F%91%8B%20Estuve%20mirando%20la%20web%20y%20me%20gustar%C3%ADa%20recibir%20m%C3%A1s%20informaci%C3%B3n.%20%C2%BFPodr%C3%ADan%20ayudarme%3F" target="_blank" style="text-decoration:underline;">WhatsApp</a>.';
        responseMsg.style.display = "block";
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = "<span>Enviar Solicitud</span>";
      }
    }
  });
}
