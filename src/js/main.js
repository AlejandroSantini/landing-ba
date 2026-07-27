document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupModal();
  setupForm();
  setupScrollVisibility();
  setupFaqAccordion();
});

// Acordeón de Preguntas Frecuentes (FAQ)
function setupFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      if (!item) return;
      const isActive = item.classList.contains('active');

      // Cerrar otros abiertos (comportamiento acordeón limpio)
      document.querySelectorAll('.faq-item.active').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('active');
          const openQuestion = openItem.querySelector('.faq-question');
          if (openQuestion) openQuestion.setAttribute('aria-expanded', 'false');
        }
      });

      if (isActive) {
        item.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// Ocultar Navbar y Botón Flotante de WhatsApp en la vista inicial, mostrándolos al scrollear
function setupScrollVisibility() {
  const header = document.querySelector('.header');
  const whatsappFloat = document.querySelector('.whatsapp-float');

  const handleScroll = () => {
    if (window.scrollY > 90) {
      if (header) header.classList.add('visible');
      if (whatsappFloat) whatsappFloat.classList.add('visible');
    } else {
      if (header) header.classList.remove('visible');
      if (whatsappFloat) whatsappFloat.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// Navegación Responsive con Animación & Telón de Fondo (Backdrop)
function setupNavigation() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const navContainer = document.getElementById('nav-container');
  const backdrop = document.getElementById('nav-backdrop');
  if (!toggleBtn || !navContainer) return;

  const openMenu = () => {
    toggleBtn.classList.add('active');
    navContainer.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    toggleBtn.classList.remove('active');
    navContainer.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
  };

  toggleBtn.addEventListener('click', () => {
    const isOpen = toggleBtn.classList.contains('active');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }

  navContainer.querySelectorAll('.nav-link, .open-modal-btn').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// Modal Diagnóstico
function setupModal() {
  const overlay = document.getElementById('modal-overlay');
  const openBtns = document.querySelectorAll('.open-modal-btn');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!overlay) return;

  const openModal = () => {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    const firstInput = overlay.querySelector('input, select');
    if (firstInput) firstInput.focus();
  };

  const closeModal = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  openBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  }));

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeModal();
    }
  });
}

// Formulario de Contacto FormSubmit AJAX (Prueba: alejandro.j.santini@gmail.com)
function setupForm() {
  const form = document.getElementById('diagnostico-form');
  const submitBtn = document.getElementById('form-submit-btn');
  const responseMsg = document.getElementById('form-response-msg');
  if (!form) return;

  // CORREO DESTINO (Cambiar a ventas@batec.com.ar cuando desees pasar a producción)
  const targetEmail = 'alejandro.j.santini@gmail.com';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Filtro anti-spam Honeypot
    const honeypot = form.querySelector('[name="website_hp"]');
    if (honeypot && honeypot.value) {
      return;
    }

    const company = form.querySelector('#company_name').value.trim();
    const phone = form.querySelector('#phone_number').value.trim();
    const need = form.querySelector('#need_type').value;
    const message = form.querySelector('#notes')?.value.trim() || 'Sin comentarios adicionales';

    if (!company || !phone || !need) return;

    // Estado visual de carga
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Enviando solicitud...</span>';
    }
    if (responseMsg) {
      responseMsg.style.display = 'none';
      responseMsg.className = 'form-response-msg';
    }

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `Nuevo Diagnóstico Técnico B2B: ${company}`,
          _template: 'table',
          _captcha: 'false',
          'Empresa / Comercio': company,
          'Teléfono / WhatsApp': phone,
          'Servicio de Interés': need,
          'Detalle o Consulta': message
        })
      });

      const data = await response.json();

      if (response.ok && data.success === "true") {
        if (responseMsg) {
          responseMsg.className = 'form-response-msg success';
          responseMsg.innerHTML = '✅ <strong>¡Solicitud enviada con éxito!</strong> Recibirás la respuesta en tu correo a la brevedad.';
          responseMsg.style.display = 'block';
        }

        form.reset();

        // Cerrar modal tras 3 segundos
        setTimeout(() => {
          const overlay = document.getElementById('modal-overlay');
          if (overlay) overlay.classList.remove('active');
          document.body.style.overflow = '';
          if (responseMsg) responseMsg.style.display = 'none';
        }, 3200);

      } else {
        throw new Error(data.message || 'Error al enviar');
      }

    } catch (err) {
      console.error('Error FormSubmit:', err);
      if (responseMsg) {
        responseMsg.className = 'form-response-msg error';
        responseMsg.innerHTML = '❌ Ocurrió un inconveniente. También podés consultarnos directamente por <a href="https://wa.me/5493446548884" target="_blank" style="text-decoration:underline;">WhatsApp</a>.';
        responseMsg.style.display = 'block';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Enviar Solicitud</span>';
      }
    }
  });
}
