(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movie-video');
    var overlay = document.getElementById('movie-play-button');
    var shell = document.querySelector('[data-player-shell]');
    var hls = null;
    var attached = false;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (overlay) {
              overlay.classList.remove('is-hidden');
              overlay.innerHTML = '<span class="play-icon">▶</span><strong>重新播放</strong>';
            }
          }
        });
        return;
      }

      if (overlay) {
        overlay.innerHTML = '<span class="play-icon">▶</span><strong>播放暂不可用</strong>';
      }
    }

    function start() {
      attachSource();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          video.addEventListener('canplay', function playWhenReady() {
            video.removeEventListener('canplay', playWhenReady);
            video.play();
          });
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        start();
      });
    }

    if (shell) {
      shell.addEventListener('click', function (event) {
        if (event.target === video && video.paused) {
          start();
        }
      });
    }

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
