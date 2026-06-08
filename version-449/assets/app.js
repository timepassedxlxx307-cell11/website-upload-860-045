(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("open");
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
      button.textContent = isOpen ? "×" : "☰";
    });
  }

  function setupHeroSlider() {
    var root = document.querySelector("[data-hero-slider]");
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    root.addEventListener("mouseenter", function () {
      if (timer) {
        window.clearInterval(timer);
      }
    });

    root.addEventListener("mouseleave", start);
    start();
  }

  function setupCardFilter() {
    var input = document.querySelector(".js-card-filter");
    if (!input) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .compact-item"));
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-keywords") || card.textContent || "").toLowerCase();
        card.hidden = query.length > 0 && text.indexOf(query) === -1;
      });
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHTML(tag) + "</span>";
    }).join("");

    return "" +
      "<article class=\"movie-card\">" +
      "<a class=\"card-poster\" href=\"./" + escapeHTML(movie.file) + "\" aria-label=\"" + escapeHTML(movie.title) + "\">" +
      "<img src=\"" + escapeHTML(movie.cover) + "\" alt=\"" + escapeHTML(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-shade\"></span>" +
      "<span class=\"play-chip\">▶</span>" +
      "<span class=\"year-chip\">" + escapeHTML(movie.year) + "</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<div class=\"card-meta\"><a href=\"./category-" + escapeHTML(movie.categorySlug) + ".html\">" + escapeHTML(movie.categoryName) + "</a><span>" + escapeHTML(movie.type) + "</span></div>" +
      "<h3><a href=\"./" + escapeHTML(movie.file) + "\">" + escapeHTML(movie.title) + "</a></h3>" +
      "<p>" + escapeHTML(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !input || !window.MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    var heading = document.querySelector("[data-search-heading]");
    var empty = document.querySelector("[data-search-empty]");
    input.value = initial;

    function render(query) {
      var keyword = query.trim().toLowerCase();
      if (!keyword) {
        if (heading) {
          heading.textContent = "热门内容";
        }
        if (empty) {
          empty.hidden = true;
        }
        return;
      }

      var matches = window.MOVIE_INDEX.filter(function (movie) {
        return movie.searchText.toLowerCase().indexOf(keyword) !== -1;
      });

      results.innerHTML = matches.map(cardTemplate).join("");
      if (heading) {
        heading.textContent = "匹配结果：" + query.trim();
      }
      if (empty) {
        empty.hidden = matches.length > 0;
      }
    }

    render(initial);
  }

  window.initVideoPlayer = function (source) {
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector("[data-player-overlay]");
    var button = document.querySelector("[data-player-button]");
    var state = document.querySelector("[data-player-state]");
    var attached = false;
    var instance = null;

    if (!video || !overlay || !button || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return true;
      }
      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(source);
        instance.attachMedia(video);
        return true;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return true;
      }

      if (state) {
        state.hidden = false;
      }
      return false;
    }

    function beginPlayback() {
      if (!attach()) {
        return;
      }
      overlay.classList.add("is-hidden");
      video.controls = true;
      var playAction = video.play();
      if (playAction && typeof playAction.catch === "function") {
        playAction.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", beginPlayback);
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      beginPlayback();
    });
    video.addEventListener("click", function () {
      if (video.paused) {
        beginPlayback();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (instance && typeof instance.destroy === "function") {
        instance.destroy();
      }
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupCardFilter();
    setupSearchPage();
  });
})();
