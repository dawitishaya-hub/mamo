(() => {
  document.documentElement.classList.add("js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Page ready fade */
  requestAnimationFrame(() => document.body.classList.add("is-ready"));

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* Active nav link */
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a").forEach((a) => {
    const target = (a.getAttribute("href") || "").split("#")[0] || "index.html";
    if (target === here) a.setAttribute("aria-current", "page");
  });

  /* Sticky header */
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 36);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile nav */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    const close = () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
      document.body.style.overflow = open ? "" : "hidden";
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
    window.addEventListener("keydown", (e) => e.key === "Escape" && close());
  }

  /* Scroll reveal with stagger */
  const revealEls = document.querySelectorAll(".reveal, .reveal-scale");
  document.querySelectorAll("[data-stagger]").forEach((group) => {
    const step = Number(group.getAttribute("data-stagger")) || 90;
    Array.from(group.children).forEach((child, i) => {
      if (!child.classList.contains("reveal") && !child.classList.contains("reveal-scale")) {
        child.classList.add("reveal");
      }
      child.style.setProperty("--d", `${i * step}ms`);
    });
  });

  const allReveal = document.querySelectorAll(".reveal, .reveal-scale");
  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    allReveal.forEach((el) => io.observe(el));
  } else {
    allReveal.forEach((el) => el.classList.add("is-visible"));
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Counters */
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = Number(el.getAttribute("data-count"));
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.firstChild.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
      else el.firstChild.textContent = target.toLocaleString();
    };
    if (suffix && !el.querySelector("small")) {
      const s = document.createElement("small");
      s.textContent = suffix;
      el.appendChild(s);
    }
    if (reduceMotion) {
      el.firstChild.textContent = target.toLocaleString();
      return;
    }
    requestAnimationFrame(tick);
  };

  if (counters.length) {
    counters.forEach((el) => {
      if (!el.firstChild || el.firstChild.nodeType !== 3) el.insertBefore(document.createTextNode("0"), el.firstChild);
      else el.firstChild.textContent = "0";
    });
    if ("IntersectionObserver" in window) {
      const cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            runCounter(entry.target);
            cio.unobserve(entry.target);
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach((el) => cio.observe(el));
    } else {
      counters.forEach(runCounter);
    }
  }

  /* Parallax on media */
  const parallaxEls = document.querySelectorAll("[data-parallax]");
  if (parallaxEls.length && !reduceMotion) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        const strength = Number(el.getAttribute("data-parallax")) || 24;
        const scale = Number(el.getAttribute("data-scale")) || 1.12;
        const img = el.querySelector("img");
        if (img) img.style.transform = `scale(${scale}) translateY(${(-progress * strength).toFixed(2)}px)`;
      });
      ticking = false;
    };
    const request = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
  }

  /* Demo form */
  document.querySelectorAll("form.form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      const original = btn.textContent;
      btn.textContent = "Received — thank you";
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        form.reset();
      }, 2400);
    });
  });
})();
