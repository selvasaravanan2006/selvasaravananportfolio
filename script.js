/* =========================================================
   Selva Saravanan A. - Portfolio scripts (vanilla JS)
   ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Dynamic year ---------- */
  var year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Theme toggle (persisted) ---------- */
  var themeBtn = $("#themeToggle");
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeBtn) {
      var isDark = theme === "dark";
      themeBtn.setAttribute("aria-pressed", String(!isDark));
      themeBtn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    }
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#000000" : "#f4f6fb");
  }
  var saved = null;
  try { saved = localStorage.getItem("selva-theme"); } catch (e) { /* storage unavailable */ }
  applyTheme(saved === "light" ? "light" : "dark");

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("selva-theme", next); } catch (e) { /* ignore */ }
    });
  }

  /* ---------- Mobile menu ---------- */
  var burger = $("#hamburger");
  var navLinks = $("#navLinks");
  function setMenu(open) {
    if (!burger || !navLinks) return;
    navLinks.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (burger) {
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
  }
  $$(".nav-link").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  document.addEventListener("click", function (e) {
    if (navLinks && navLinks.classList.contains("open") && !navLinks.contains(e.target) && !burger.contains(e.target)) setMenu(false);
  });
  window.addEventListener("resize", function () { if (window.innerWidth > 900) setMenu(false); });

  /* ---------- Header state, progress bar, back-to-top ---------- */
  var header = $("#siteHeader");
  var progress = $("#scrollProgress");
  var toTop = $("#toTop");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle("scrolled", y > 20);
    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    if (toTop) toTop.classList.toggle("show", y > 600);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  /* ---------- Active nav link on scroll ---------- */
  var sections = $$("main section[id]");
  var links = $$(".nav-link");
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          links.forEach(function (l) {
            l.classList.toggle("active", l.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Typing animation ---------- */
  var typingEl = $("#typingText");
  var phrases = ["Software Developer", "Web Developer", "Problem Solver"];
  if (typingEl) {
    if (prefersReduced) {
      typingEl.textContent = phrases[0];
    } else {
      var p = 0, c = 0, deleting = false;
      var tick = function () {
        var word = phrases[p];
        c += deleting ? -1 : 1;
        typingEl.textContent = word.substring(0, c);
        var delay = deleting ? 45 : 85;
        if (!deleting && c === word.length) { deleting = true; delay = 1500; }
        else if (deleting && c === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 400; }
        setTimeout(tick, delay);
      };
      typingEl.textContent = "";
      setTimeout(tick, 600);
    }
  }

  /* ---------- Interactive project cards ---------- */
  $$("[data-project]").forEach(function (card) {
    function toggle() {
      var open = card.classList.toggle("open");
      card.setAttribute("aria-expanded", String(open));
    }
    card.addEventListener("click", function (e) {
      if (e.target.closest("a")) return; // let links work normally
      toggle();
    });
    card.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && e.target === card) { e.preventDefault(); toggle(); }
    });
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- Contact form validation ---------- */
  var form = $("#contactForm");
  if (form) {
    var status = $("#formStatus");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? "" : "Please enter your name (at least 2 characters)."; },
      email: function (v) { return emailRe.test(v.trim()) ? "" : "Please enter a valid email address."; },
      subject: function (v) { return v.trim().length >= 3 ? "" : "Please enter a subject (at least 3 characters)."; },
      message: function (v) { return v.trim().length >= 10 ? "" : "Your message should be at least 10 characters."; }
    };
    function validateField(input) {
      var msg = rules[input.name](input.value);
      var wrap = input.closest(".field");
      var err = $("#" + input.id + "-err");
      wrap.classList.toggle("invalid", !!msg);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg;
      return !msg;
    }
    var inputs = $$("input, textarea", form);
    inputs.forEach(function (input) {
      input.addEventListener("blur", function () { validateField(input); });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("invalid")) validateField(input);
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "";
      var firstBad = null;
      inputs.forEach(function (input) {
        if (!validateField(input) && !firstBad) firstBad = input;
      });
      if (firstBad) { firstBad.focus(); status.textContent = "Please fix the highlighted fields."; return; }

      // No backend is configured, so we open the visitor's mail app with the message pre-filled.
      // Replace RECIPIENT_EMAIL with your real address (or connect a service such as Formspree).
      var RECIPIENT_EMAIL = "";
      var body = "Name: " + form.name.value.trim() + "\nEmail: " + form.email.value.trim() + "\n\n" + form.message.value.trim();
      if (RECIPIENT_EMAIL) {
        window.location.href = "mailto:" + RECIPIENT_EMAIL + "?subject=" + encodeURIComponent(form.subject.value.trim()) + "&body=" + encodeURIComponent(body);
        status.textContent = "Opening your email app. Please press send there to deliver the message.";
      } else {
        status.textContent = "Form is valid, but no email address is configured yet, so nothing was sent. See the note in script.js.";
      }
    });
  }
})();
