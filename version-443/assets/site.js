(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var panel = document.querySelector("[data-mobile-menu]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero-carousel]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function restart() {
            window.clearInterval(timer);
            start();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        show(0);
        start();
    }

    function initSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
        if (!inputs.length || !window.MOVIE_SEARCH_DATA) {
            return;
        }

        inputs.forEach(function (input) {
            var wrap = input.closest("[data-search-wrap]");
            var panel = wrap ? wrap.querySelector("[data-search-results]") : null;
            if (!panel) {
                return;
            }

            function render() {
                var query = input.value.trim().toLowerCase();
                if (!query) {
                    panel.classList.remove("is-visible");
                    panel.innerHTML = "";
                    return;
                }
                var results = window.MOVIE_SEARCH_DATA.filter(function (item) {
                    return [item.title, item.category, item.year, item.tags].join(" ").toLowerCase().indexOf(query) !== -1;
                }).slice(0, 8);
                panel.innerHTML = results.map(function (item) {
                    return '<a class="search-result-item" href="' + item.url + '"><strong>' + item.title + '</strong><span>' + item.category + ' · ' + item.year + ' · ' + item.desc + '</span></a>';
                }).join("");
                panel.classList.toggle("is-visible", results.length > 0);
            }

            input.addEventListener("input", render);
            input.addEventListener("focus", render);
            document.addEventListener("click", function (event) {
                if (wrap && !wrap.contains(event.target)) {
                    panel.classList.remove("is-visible");
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initSearch();
    });
})();
