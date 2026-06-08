(function() {
  function closestScope(element) {
    return element.closest('[data-filter-scope]') || document;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function() {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        show(index);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function() {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function() {
        show(current + 1);
        restart();
      });
    }
    start();
  }

  function applyFilters(scope) {
    var container = scope.querySelector('[data-filter-scope]') || scope;
    var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
    var input = scope.querySelector('[data-local-search]');
    var selectors = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-field]'));
    var query = normalize(input ? input.value : '');
    var filters = {};
    selectors.forEach(function(select) {
      filters[select.getAttribute('data-filter-field')] = normalize(select.value);
    });

    cards.forEach(function(card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' '));
      var visible = !query || haystack.indexOf(query) !== -1;
      Object.keys(filters).forEach(function(key) {
        var value = filters[key];
        if (value && normalize(card.getAttribute('data-' + key)) !== value) {
          visible = false;
        }
      });
      card.classList.toggle('is-filtered-out', !visible);
    });
  }

  function setupLocalFilters() {
    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-local-search], [data-filter-field]'));
    filterInputs.forEach(function(control) {
      var scope = closestScope(control.parentElement || control);
      control.addEventListener('input', function() {
        applyFilters(scope);
      });
      control.addEventListener('change', function() {
        applyFilters(scope);
      });
    });
  }

  function renderSearch(input, panel) {
    var query = normalize(input.value);
    var root = document.documentElement.getAttribute('data-root') || './';
    if (!query || !window.SEARCH_DATA) {
      panel.classList.remove('is-open');
      panel.innerHTML = '';
      return;
    }
    var results = window.SEARCH_DATA.filter(function(item) {
      return normalize([item.title, item.year, item.type, item.region, item.genre, item.category, item.desc].join(' ')).indexOf(query) !== -1;
    }).slice(0, 10);
    if (!results.length) {
      panel.innerHTML = '<div class="search-empty">暂无匹配影片</div>';
      panel.classList.add('is-open');
      return;
    }
    panel.innerHTML = results.map(function(item) {
      var url = root + item.url;
      return '<a class="search-result" href="' + url + '"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span></a>';
    }).join('');
    panel.classList.add('is-open');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function(char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupGlobalSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));
    inputs.forEach(function(input) {
      var wrapper = input.parentElement;
      var panel = wrapper ? wrapper.querySelector('[data-search-panel]') : null;
      if (!panel) {
        panel = document.querySelector('[data-search-panel]');
      }
      if (!panel) {
        return;
      }
      input.addEventListener('input', function() {
        renderSearch(input, panel);
      });
      input.addEventListener('focus', function() {
        renderSearch(input, panel);
      });
    });
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.nav-search') && !event.target.closest('.mobile-menu')) {
        document.querySelectorAll('[data-search-panel]').forEach(function(panel) {
          panel.classList.remove('is-open');
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    setupMenu();
    setupHero();
    setupLocalFilters();
    setupGlobalSearch();
  });
}());
