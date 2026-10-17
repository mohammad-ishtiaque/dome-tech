// Page-level visual behaviour: scroll reveals, number counters and the pitch rail.
// Re-runs on every navigation. `?capture` turns everything static for Figma import / screenshots.
import { useEffect } from "react";
import { useLocation } from "react-router";

export function useSiteEffects() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const capture = /[?&]capture\b/.test(search);
    root.classList.toggle("capture", capture);
    root.classList.remove("no-js");

    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (capture || reduce || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const count = (el: HTMLElement) => {
      const raw = el.dataset.count || "";
      const end = parseFloat(raw);
      if (Number.isNaN(end)) return;
      const dec = (raw.split(".")[1] || "").length;
      let t0 = 0;
      const step = (t: number) => {
        t0 ||= t;
        const p = Math.min((t - t0) / 1400, 1);
        el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        en.target.classList.add("is-in");
        en.target.querySelectorAll<HTMLElement>("[data-count]").forEach(count);
        io.unobserve(en.target);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));

    // Pitch rail (numbered section index on wide screens)
    const rail = document.querySelector<HTMLElement>(".pitch-rail");
    let ro: IntersectionObserver | undefined;
    let onScroll: (() => void) | undefined;
    if (rail) {
      const links = Array.from(rail.querySelectorAll<HTMLAnchorElement>("a"));
      ro = new IntersectionObserver((entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          links.forEach((a) => a.classList.toggle("is-active", a.hash === `#${en.target.id}`));
          rail.classList.toggle("on-dark", en.target.classList.contains("section--dark") || en.target.classList.contains("invest"));
        }
      }, { rootMargin: "-45% 0px -50% 0px" });
      links.forEach((a) => { const s = document.getElementById(a.hash.slice(1)); if (s) ro!.observe(s); });
      const hero = document.querySelector<HTMLElement>(".hero");
      onScroll = () => rail.classList.toggle("is-visible", window.scrollY > (hero ? hero.offsetHeight * 0.6 : 400));
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => { io.disconnect(); ro?.disconnect(); if (onScroll) window.removeEventListener("scroll", onScroll); };
  }, [pathname, search]);
}
