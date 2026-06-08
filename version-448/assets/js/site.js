(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var forms = document.querySelectorAll('[data-search-form]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeIndex = 0;

  function activateSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      activateSlide(index);
    });
  });

  if (slides.length > 1) {
    activateSlide(0);
    window.setInterval(function () {
      activateSlide(activeIndex + 1);
    }, 5200);
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var filterInput = filterRoot.querySelector('[data-filter-input]');
    var yearSelect = filterRoot.querySelector('[data-filter-year]');
    var typeSelect = filterRoot.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
    var empty = filterRoot.querySelector('[data-filter-empty]');

    function applyFilter() {
      var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchType = !type || card.getAttribute('data-type') === type;
        var show = matchQuery && matchYear && matchType;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [filterInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }

  var searchBox = document.querySelector('[data-search-results]');
  if (searchBox && window.SEARCH_ITEMS) {
    var params = new URLSearchParams(window.location.search);
    var queryText = (params.get('q') || '').trim();
    var titleNode = document.querySelector('[data-search-title]');
    var summaryNode = document.querySelector('[data-search-summary]');

    if (titleNode) {
      titleNode.textContent = queryText ? '搜索：' + queryText : '影片搜索';
    }

    function render(items) {
      if (!items.length) {
        searchBox.innerHTML = '<div class="empty-filter is-visible">没有找到匹配的影片</div>';
        if (summaryNode) {
          summaryNode.textContent = '换一个关键词试试看';
        }
        return;
      }

      if (summaryNode) {
        summaryNode.textContent = '为你匹配到相关影片';
      }

      searchBox.innerHTML = items.slice(0, 240).map(function (item) {
        return '<article class="movie-card">' +
          '<a class="movie-card__poster" href="' + item.href + '">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="movie-card__play">立即观看</span>' +
          '</a>' +
          '<div class="movie-card__body">' +
          '<div class="movie-card__meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
          '<h3><a href="' + item.href + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p>' + escapeHtml(item.oneLine) + '</p>' +
          '<div class="tag-list">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>' +
          '</div>' +
          '</article>';
      }).join('');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    if (queryText) {
      var lower = queryText.toLowerCase();
      render(window.SEARCH_ITEMS.filter(function (item) {
        return [item.title, item.region, item.type, item.year, item.genre, item.oneLine, item.tags.join(' ')].join(' ').toLowerCase().indexOf(lower) !== -1;
      }));
    } else {
      render(window.SEARCH_ITEMS.slice(0, 120));
    }
  }
})();
