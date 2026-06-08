(function () {
    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var mobile = document.querySelector('.mobile-nav');
        if (!button || !mobile) {
            return;
        }
        button.addEventListener('click', function () {
            var isOpen = button.classList.toggle('is-open');
            mobile.classList.toggle('is-open', isOpen);
            button.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function initSearch() {
        var input = document.querySelector('.site-search');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title][data-meta]'));
        var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
        var notice = document.querySelector('.no-results');
        var activeFilter = '';
        if (!input && chips.length === 0) {
            return;
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            var filter = normalize(activeFilter);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta'));
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedFilter = !filter || haystack.indexOf(filter) !== -1;
                var show = matchedQuery && matchedFilter;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (notice) {
                notice.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                activeFilter = chip.getAttribute('data-filter') || '';
                apply();
            });
        });
        apply();
    }

    function initHeroMotion() {
        var hero = document.querySelector('.hero');
        if (!hero) {
            return;
        }
        window.addEventListener('scroll', function () {
            var offset = Math.min(window.scrollY * 0.22, 90);
            hero.style.backgroundPosition = 'center calc(50% + ' + offset + 'px)';
        }, { passive: true });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initSearch();
        initHeroMotion();
    });
})();
