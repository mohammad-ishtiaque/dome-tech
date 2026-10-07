/* Digital Dome — site behaviour. No dependencies, ~6KB. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  // ?capture: static, fully-revealed render for Figma import (html.to.design) and screenshots
  var CAPTURE = /[?&]capture\b/.test(location.search);
  if (CAPTURE) document.documentElement.classList.add("capture");

  var D = window.DD_DATA || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ---------- Analytics hook (privacy-friendly: Plausible / GA4 / none) ---------- */
  function track(name, props) {
    try {
      if (window.plausible) window.plausible(name, { props: props || {} });
      if (window.dataLayer) window.dataLayer.push({ event: name, ...props });
    } catch (e) { /* analytics must never break the page */ }
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-track]");
    if (el) track(el.getAttribute("data-track"), { label: (el.textContent || "").trim().slice(0, 60), page: location.pathname });
  });

  /* ---------- Header ---------- */
  var header = $(".site-header");
  if (header && !header.classList.contains("site-header--light")) {
    var onScroll = function () { header.classList.toggle("is-solid", window.scrollY > 24); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Products dropdown
  $$(".nav-drop").forEach(function (drop) {
    var btn = $("button", drop);
    var set = function (v) { drop.dataset.open = v; btn.setAttribute("aria-expanded", v); };
    btn.addEventListener("click", function (e) { e.stopPropagation(); set(drop.dataset.open !== "true"); });
    drop.addEventListener("mouseenter", function () { if (matchMedia("(hover: hover)").matches) set(true); });
    drop.addEventListener("mouseleave", function () { if (matchMedia("(hover: hover)").matches) set(false); });
    document.addEventListener("click", function () { set(false); });
    drop.addEventListener("keydown", function (e) { if (e.key === "Escape") { set(false); btn.focus(); } });
  });

  // Mobile nav
  var toggle = $(".nav-toggle"), mnav = $(".mobile-nav");
  if (toggle && mnav) {
    var setNav = function (open) {
      mnav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      mnav.inert = !open;
    };
    setNav(false);
    toggle.addEventListener("click", function () { setNav(!mnav.classList.contains("is-open")); });
    $$("a", mnav).forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });
  }

  /* ---------- Data hydration (site-data.js) ---------- */
  var STATES = { "in development": "dev", testing: "testing", beta: "beta", launching: "launching", live: "live" };
  if (D.status) {
    $$("[data-status]").forEach(function (el) {
      var v = D.status[el.getAttribute("data-status")];
      if (!v) return;
      el.textContent = v;
      el.setAttribute("data-state", STATES[v.toLowerCase()] || "dev");
    });
  }

  var metricsEl = $("[data-metrics]");
  if (metricsEl && D.metrics && D.metrics.length) {
    metricsEl.innerHTML = D.metrics.map(function (m) {
      return '<div class="metric"><b>' + esc(m.value) + "</b><span>" + esc(m.label) + "</span>" +
        (m.asOf ? "<small>Verified · as of " + esc(m.asOf) + "</small>" : "") + "</div>";
    }).join("");
    metricsEl.hidden = false;
    $$("[data-metrics-empty]").forEach(function (n) { n.hidden = true; });
  }

  var msEl = $("[data-milestones]");
  if (msEl && D.milestones && D.milestones.length) {
    var NAMES = { done: "Completed", current: "In progress", next: "Next" };
    msEl.innerHTML = D.milestones.map(function (m) {
      return '<li data-state="' + esc(m.state) + '"><span class="t-state">' + (NAMES[m.state] || "") +
        '</span><span class="t-label">' + esc(m.label) + "</span></li>";
    }).join("");
  }

  var teamEl = $("[data-leadership]");
  if (teamEl && D.leadership && D.leadership.length) {
    $("[data-leadership-grid]", teamEl).innerHTML = D.leadership.map(function (p) {
      return '<article class="person">' +
        (p.photo ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + ', ' + esc(p.role) + '" loading="lazy" width="480" height="408">' : "") +
        "<div><h3>" + esc(p.name) + '</h3><span class="role">' + esc(p.role) + "</span>" +
        (p.bio ? "<p>" + esc(p.bio) + "</p>" : "") +
        (p.linkedin ? '<p><a href="' + esc(p.linkedin) + '" rel="noopener" target="_blank">LinkedIn</a></p>' : "") +
        "</div></article>";
    }).join("");
    teamEl.hidden = false;
  }

  if (D.contact) {
    $$("[data-email]").forEach(function (a) {
      var v = D.contact[a.getAttribute("data-email")];
      if (v) { a.href = "mailto:" + v; if (!a.hasAttribute("data-keep-text")) a.textContent = v; }
    });
    $$("[data-phone]").forEach(function (el) {
      if (D.contact.phone) { el.hidden = false; el.innerHTML = '<a href="tel:' + esc(D.contact.phone.replace(/\s/g, "")) + '">' + esc(D.contact.phone) + "</a>"; }
    });
  }
  var socialEl = $("[data-social]");
  if (socialEl && D.social && D.social.length) {
    socialEl.innerHTML = D.social.map(function (s) {
      return '<li><a href="' + esc(s.url) + '" rel="noopener" target="_blank">' + esc(s.label) + "</a></li>";
    }).join("");
    socialEl.closest("[data-social-wrap]").hidden = false;
  }
  $$("[data-updated]").forEach(function (el) { if (D.updated) el.textContent = D.updated; });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Reveal + counters ---------- */
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function count(el) {
    var end = parseFloat(el.getAttribute("data-count"));
    var dec = (el.getAttribute("data-count").split(".")[1] || "").length;
    if (reduce || isNaN(end)) return;
    var t0 = null, dur = 1400;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = (0).toFixed(dec);
    requestAnimationFrame(step);
  }
  if (CAPTURE) {
    $$(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        $$("[data-count]", en.target).forEach(count);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Pitch rail ---------- */
  var rail = $(".pitch-rail");
  if (rail && "IntersectionObserver" in window) {
    var links = $$("a", rail);
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); });
        var a = map[en.target.id];
        if (a) a.classList.add("is-active");
        rail.classList.toggle("on-dark", en.target.classList.contains("section--dark") || en.target.classList.contains("invest"));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) ro.observe(s); });
    var heroEl = $(".hero");
    window.addEventListener("scroll", function () {
      rail.classList.toggle("is-visible", window.scrollY > (heroEl ? heroEl.offsetHeight * 0.6 : 400));
    }, { passive: true });
  }

  /* ---------- Inquiry paths preset the form ---------- */
  $$("[data-interest]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var sel = $("#f-interest");
      if (!sel) return;
      sel.value = btn.getAttribute("data-interest");
      $$("[data-interest]").forEach(function (b) { b.setAttribute("aria-pressed", b === btn); });
      var name = $("#f-name");
      if (name) setTimeout(function () { name.focus({ preventScroll: true }); }, 350);
      $("#inquiry").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  });
  // Deep link: investors.html?interest=invest#inquiry
  var q = new URLSearchParams(location.search).get("interest");
  if (q && $("#f-interest")) $("#f-interest").value = q;

  /* ---------- Form ---------- */
  $$("form[data-inquiry]").forEach(function (form) {
    var status = $(".form-status", form);
    var showErr = function (input, msg) {
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      var e = $("#" + input.id + "-err");
      if (e) e.textContent = msg || "";
    };
    $$("input, select, textarea", form).forEach(function (i) {
      i.addEventListener("blur", function () { if (i.getAttribute("aria-invalid") === "true") showErr(i, i.validity.valid ? "" : i.validationMessage); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      if ($(".hp input", form).value) return; // spam honeypot
      var first = null;
      $$("[required]", form).forEach(function (i) {
        var ok = i.type === "checkbox" ? i.checked : i.validity.valid;
        showErr(i, ok ? "" : (i.type === "checkbox" ? "Please confirm to continue." : i.validationMessage));
        if (!ok && !first) first = i;
      });
      if (first) { first.focus(); return; }

      var data = new FormData(form);
      var interest = data.get("interest");
      var endpoint = (D.contact && D.contact.formEndpoint) || "";
      var btn = $("button[type=submit]", form);
      btn.disabled = true;

      var done = function (ok) {
        btn.disabled = false;
        if (ok) {
          status.className = "form-status is-ok";
          status.textContent = "Thank you — your inquiry has been received. The Digital Dome team will respond within two business days.";
          form.reset();
          track("Inquiry Submitted", { interest: interest });
        } else {
          status.className = "form-status is-err";
          status.innerHTML = 'Something went wrong. Please email us directly at <a href="mailto:' + esc(D.contact.investors) + '">' + esc(D.contact.investors) + "</a>.";
        }
        status.focus();
      };

      if (endpoint) {
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) { done(r.ok); })
          .catch(function () { done(false); });
      } else {
        // No backend configured yet: hand off to the visitor's email client.
        var to = (D.contact && (interest === "enterprise" ? D.contact.general : D.contact.investors)) || "";
        var body = ["Name: " + data.get("name"), "Organization: " + (data.get("org") || "-"), "Email: " + data.get("email"),
          "Interest: " + $("#f-interest").selectedOptions[0].text, "", data.get("message") || ""].join("\n");
        location.href = "mailto:" + to + "?subject=" + encodeURIComponent("Digital Dome inquiry — " + $("#f-interest").selectedOptions[0].text) +
          "&body=" + encodeURIComponent(body);
        track("Inquiry Submitted", { interest: interest, via: "mailto" });
        btn.disabled = false;
        status.className = "form-status is-ok";
        status.textContent = "Your email app should now open with your inquiry pre-filled. If it doesn’t, write to " + to + ".";
      }
    });
  });
})();
