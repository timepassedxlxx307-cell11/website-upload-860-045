(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("data-target") || "./search.html";
        var joiner = target.indexOf("?") === -1 ? "?" : "&";
        window.location.href = target + joiner + "q=" + encodeURIComponent(query);
      });
    });

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        active = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      }

      function start() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          var index = Number(dot.getAttribute("data-hero-dot"));
          show(index);
          start();
        });
      });

      start();
    }

    var queryInput = document.querySelector("[data-query-input]");

    if (queryInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      queryInput.value = query;
    }

    document.querySelectorAll("[data-filter-list]").forEach(function (list) {
      var panel = list.previousElementSibling;
      var input = panel ? panel.querySelector("[data-filter-input]") : null;
      var buttons = panel ? Array.prototype.slice.call(panel.querySelectorAll("[data-filter-button]")) : [];
      var items = Array.prototype.slice.call(list.querySelectorAll(".movie-item"));
      var activeFilter = "all";

      function applyFilter() {
        var keyword = normalize(input ? input.value : "");
        var genre = normalize(activeFilter);

        items.forEach(function (item) {
          var text = normalize(item.getAttribute("data-search-text"));
          var itemGenre = normalize(item.getAttribute("data-genre"));
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchGenre = genre === "all" || itemGenre.indexOf(genre) !== -1 || text.indexOf(genre) !== -1;
          item.classList.toggle("is-hidden", !(matchKeyword && matchGenre));
        });
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter-value") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          applyFilter();
        });
      });

      applyFilter();
    });
  });
}());
