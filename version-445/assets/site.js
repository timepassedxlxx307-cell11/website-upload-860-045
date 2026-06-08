(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', function () {
        mobilePanel.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-slide-dot]'));
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentSlide = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === currentSlide);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === currentSlide);
      });
    }

    function startSlides() {
      if (timer || slides.length < 2) {
        return;
      }

      timer = window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }

    function resetSlides() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      startSlides();
    }

    var prev = document.querySelector('[data-slide-prev]');
    var next = document.querySelector('[data-slide-next]');

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(currentSlide - 1);
        resetSlides();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(currentSlide + 1);
        resetSlides();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide-dot')) || 0);
        resetSlides();
      });
    });

    showSlide(0);
    startSlides();

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.js-search'));
    var typeFilter = document.querySelector('.js-type-filter');
    var categoryFilter = document.querySelector('.js-category-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function syncSearch(value, origin) {
      searchInputs.forEach(function (input) {
        if (input !== origin) {
          input.value = value;
        }
      });
    }

    function applyFilters(origin) {
      var query = normalize(searchInputs[0] ? searchInputs[0].value : '');
      var typeValue = typeFilter ? typeFilter.value : '';
      var categoryValue = categoryFilter ? categoryFilter.value : '';
      var visible = 0;

      if (origin && origin.classList.contains('js-search')) {
        query = normalize(origin.value);
        syncSearch(origin.value, origin);
      }

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var typeMatch = !typeValue || card.getAttribute('data-type') === typeValue;
        var categoryMatch = !categoryValue || card.getAttribute('data-category') === categoryValue;
        var queryMatch = !query || text.indexOf(query) !== -1;
        var shouldShow = typeMatch && categoryMatch && queryMatch;
        card.classList.toggle('hidden-card', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0 && cards.length > 0);
      }
    }

    searchInputs.forEach(function (input) {
      input.addEventListener('input', function () {
        applyFilters(input);
      });
    });

    if (typeFilter) {
      typeFilter.addEventListener('change', function () {
        applyFilters(typeFilter);
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', function () {
        applyFilters(categoryFilter);
      });
    }
  });
})();
