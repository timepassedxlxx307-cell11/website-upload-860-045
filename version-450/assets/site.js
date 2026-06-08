(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (menuButton && panel) {
    menuButton.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('is-missing');
      img.removeAttribute('src');
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function restart() {
      window.clearInterval(timer);
      play();
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    play();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var searchList = document.querySelector('[data-search-list]');
  var searchStatus = document.querySelector('[data-search-status]');
  if (searchInput && searchList) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;
    var cards = Array.prototype.slice.call(searchList.querySelectorAll('.movie-card'));
    function filter() {
      var q = searchInput.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var matched = !q || text.indexOf(q) !== -1;
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (searchStatus) {
        searchStatus.textContent = q ? '已为你筛选匹配内容。' : '输入关键词后即可筛选片库内容。';
      }
    }
    searchInput.addEventListener('input', filter);
    filter();
  }

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-layer');
    var stream = video ? video.getAttribute('data-stream') : '';
    var attached = false;
    function attachPlayer() {
      if (!video || !stream) {
        return;
      }
      if (!attached) {
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }
      if (button) {
        button.setAttribute('hidden', '');
      }
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener('click', attachPlayer);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        attachPlayer();
      }
    });
    video.addEventListener('play', function () {
      if (button) {
        button.setAttribute('hidden', '');
      }
    });
  }
})();
