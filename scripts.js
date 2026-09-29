// iOS Safari only applies :active (the card press capsule) when a touch listener exists.
document.addEventListener("touchstart", function () {}, { passive: true });

// Card attention bars: shown by default; when a group of cards scrolls into view, each card's
// bar grows in 0.2s after the previous one. Without IntersectionObserver the bars simply show.
(function () {
  var CARD_SELECTOR = ".service-card, .pricing-card, .topic-card, .who-card, .monthly-card, .why-pillar, .contact-way, .expect-list li";
  var STAGGER_S = 0.2;
  var cards = Array.prototype.slice.call(document.querySelectorAll(CARD_SELECTOR));
  if (!cards.length || !("IntersectionObserver" in window)) {
    return;
  }

  var groups = [];
  cards.forEach(function (card) {
    if (groups.indexOf(card.parentElement) === -1) {
      groups.push(card.parentElement);
    }
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) {
        return;
      }
      var groupCards = Array.prototype.slice.call(entry.target.children).filter(function (el) {
        return cards.indexOf(el) !== -1;
      });
      groupCards.forEach(function (card, i) {
        card.style.setProperty("--cap-delay", (i * STAGGER_S).toFixed(1) + "s");
        card.classList.add("cap-in");
        // Drop the delay once revealed so hover-out snaps back without waiting.
        setTimeout(function () {
          card.style.removeProperty("--cap-delay");
        }, (i * STAGGER_S + 0.6) * 1000);
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  document.documentElement.classList.add("caps-pending");
  groups.forEach(function (group) {
    observer.observe(group);
  });
})();

// Mobile menu, La Mesillera-style: X morph, full-screen panel, page lock.
// Each page's own script already toggles .nav-links.active on the button; this keeps the
// button/page state in sync and adds the close paths (link tap, empty-panel tap, Escape,
// widening back to desktop).
(function () {
  var DESKTOP_QUERY = "(min-width: 981px)";
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (!toggle || !links) {
    return;
  }

  function sync() {
    var open = links.classList.contains("active");
    toggle.classList.toggle("open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  function close() {
    links.classList.remove("active");
    sync();
  }

  toggle.setAttribute("aria-controls", "navLinks");
  toggle.addEventListener("click", sync);
  links.addEventListener("click", function (e) {
    if (e.target === links || e.target.closest("a")) {
      close();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && links.classList.contains("active")) {
      close();
    }
  });
  window.matchMedia(DESKTOP_QUERY).addEventListener("change", function (e) {
    if (e.matches) {
      close();
    }
  });
  sync();
})();
