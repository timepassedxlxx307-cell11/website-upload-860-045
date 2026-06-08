(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-menu]');
        var search = document.querySelector('.nav-search');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
            if (search) {
                search.classList.toggle('is-open');
            }
        });
    }

    function initSearchForms() {
        var forms = document.querySelectorAll('[data-global-search]');
        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input) {
                    return;
                }
                var value = input.value.trim();
                if (!value) {
                    event.preventDefault();
                    window.location.href = 'search.html';
                }
            });
        });
    }

    function getQueryValue() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function initLocalFilters() {
        var input = document.querySelector('[data-local-search]');
        var typeSelect = document.querySelector('[data-category-filter]');
        var pageCategorySelect = document.querySelector('[data-page-category-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-empty-state]');
        var queryInput = document.querySelector('[data-query-input]');
        if (!cards.length) {
            return;
        }
        if (queryInput) {
            queryInput.value = getQueryValue();
        }
        function apply() {
            var text = input ? input.value.trim().toLowerCase() : '';
            var typeValue = typeSelect ? typeSelect.value : 'all';
            var pageCategory = pageCategorySelect ? pageCategorySelect.value : 'all';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var category = card.getAttribute('data-category') || '';
                var typeMatch = typeValue === 'all' || haystack.indexOf(typeValue.toLowerCase()) !== -1;
                var pageCategoryMatch = pageCategory === 'all' || category === pageCategory;
                var textMatch = !text || haystack.indexOf(text) !== -1;
                var show = typeMatch && pageCategoryMatch && textMatch;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        if (input) {
            input.addEventListener('input', apply);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', apply);
        }
        if (pageCategorySelect) {
            pageCategorySelect.addEventListener('change', apply);
        }
        apply();
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function initPlayers() {
        var videos = Array.prototype.slice.call(document.querySelectorAll('.movie-video'));
        if (!videos.length) {
            return;
        }
        videos.forEach(function (video) {
            var source = video.getAttribute('data-src');
            var message = document.querySelector('[data-player-message]');
            if (!source) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (message) {
                        message.hidden = false;
                        message.textContent = '播放暂时不可用，请稍后重试。';
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (message) {
                message.hidden = false;
                message.textContent = '当前设备暂时无法播放，请更换浏览器重试。';
            }
            video.addEventListener('click', function () {
                togglePlay(video);
            });
        });
        document.querySelectorAll('[data-player]').forEach(function (button) {
            button.addEventListener('click', function () {
                var id = button.getAttribute('data-player');
                var video = document.getElementById(id);
                if (!video) {
                    return;
                }
                if (button.classList.contains('fullscreen-toggle')) {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else if (video.requestFullscreen) {
                        video.requestFullscreen();
                    }
                } else {
                    togglePlay(video);
                }
            });
        });
    }

    function togglePlay(video) {
        if (video.paused) {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        } else {
            video.pause();
        }
    }

    ready(function () {
        initMenu();
        initSearchForms();
        initLocalFilters();
        initHero();
        initPlayers();
    });
}());
