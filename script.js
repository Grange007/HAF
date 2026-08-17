document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("[data-header]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const revealItems = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const navTargets = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-35% 0px -55%", threshold: 0 });

    navTargets.forEach((section) => sectionObserver.observe(section));
  }

  const taskVideos = document.querySelectorAll(".task-video");

  taskVideos.forEach((video) => {
    const media = video.closest(".task-media");
    const toggle = media?.querySelector(".video-toggle");

    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;

    video.addEventListener("volumechange", () => {
      if (!video.muted || video.volume !== 0) {
        video.muted = true;
        video.volume = 0;
      }
    });

    const updateToggle = () => {
      const isPlaying = !video.paused;
      toggle?.classList.toggle("is-playing", isPlaying);
      if (toggle) {
        const command = isPlaying ? "Pause" : "Play";
        const task = video.getAttribute("aria-label") || "task video";
        toggle.setAttribute("aria-label", `${command} ${task}`);
        toggle.setAttribute("title", `${command} video`);
      }
    };

    toggle?.addEventListener("click", () => {
      if (video.paused) {
        video.dataset.userPaused = "false";
        video.play().catch(() => {});
      } else {
        video.dataset.userPaused = "true";
        video.pause();
      }
      updateToggle();
    });

    video.addEventListener("play", updateToggle);
    video.addEventListener("pause", updateToggle);

    if (reducedMotion) {
      video.pause();
      video.dataset.userPaused = "true";
      updateToggle();
    }
  });

  if (!reducedMotion && "IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting && video.dataset.userPaused !== "true") {
          video.play().catch(() => {});
        } else if (!entry.isIntersecting) {
          video.pause();
        }
      });
    }, { rootMargin: "120px 0px", threshold: 0.2 });

    taskVideos.forEach((video) => videoObserver.observe(video));
  }
});
