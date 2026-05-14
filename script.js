const root = document.documentElement;
const themeToggle = document.querySelector("#themeToggle");
const printButton = document.querySelector("#printButton");
const copyEmail = document.querySelector("#copyEmail");
const toast = document.querySelector("#toast");
const progress = document.querySelector("#scrollProgress");
const navLinks = [...document.querySelectorAll(".nav a")];
const storyPanels = [...document.querySelectorAll(".story-panel")];
const lightbox = document.querySelector("#photoLightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxTitle = lightbox?.querySelector("strong");
const lightboxClose = lightbox?.querySelector(".lightbox-close");

const savedTheme = localStorage.getItem("resume-theme");
if (savedTheme) {
  root.dataset.theme = savedTheme;
}

const hashAliases = {
  "#qa": "#work",
  "#photo": "#photography",
  "#weather": "#campus",
};

if (hashAliases[window.location.hash]) {
  const nextHash = hashAliases[window.location.hash];
  window.history.replaceState(null, "", nextHash);
  requestAnimationFrame(() => document.querySelector(nextHash)?.scrollIntoView());
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1900);
}

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
}

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "" : "dark";
  if (nextTheme) {
    root.dataset.theme = nextTheme;
    localStorage.setItem("resume-theme", nextTheme);
  } else {
    delete root.dataset.theme;
    localStorage.removeItem("resume-theme");
  }
});

printButton?.addEventListener("click", () => {
  window.print();
});

copyEmail?.addEventListener("click", async () => {
  const email = copyEmail.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    showToast("邮箱已复制");
  } catch {
    showToast(email);
  }
});

document.querySelectorAll(".detail-toggle").forEach((button) => {
  button.dataset.openLabel = button.textContent;
  button.dataset.closedLabel = button.textContent.replace("收起", "展开");
  button.addEventListener("click", () => {
    const card = button.closest(".reveal-card");
    const isOpen = card.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.textContent = isOpen ? button.dataset.openLabel : button.dataset.closedLabel;
  });
});

document.querySelectorAll(".photo-tile").forEach((tile) => {
  tile.addEventListener("click", () => {
    if (!lightbox || !lightboxImage || !lightboxTitle) return;
    lightboxImage.src = tile.dataset.photo;
    lightboxImage.alt = tile.dataset.title || "摄影作品";
    lightboxTitle.textContent = tile.dataset.title || "摄影作品";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  });
});

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
}

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});

const panelObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });

    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  {
    rootMargin: "-22% 0px -48% 0px",
    threshold: [0.15, 0.35, 0.65],
  }
);

storyPanels.forEach((panel) => panelObserver.observe(panel));

document.querySelectorAll("[data-tilt]").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateX(${y * -4}deg) rotateY(${x * 4}deg) translateY(-2px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();
