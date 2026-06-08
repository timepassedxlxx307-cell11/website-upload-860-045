(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.querySelector('[data-video-player]');
    var button = document.querySelector('[data-player-start]');
    var shell = document.querySelector('[data-player-shell]');
    var stream = typeof movieStream === 'string' ? movieStream : '';
    var initialized = false;
    var hlsInstance = null;

    if (!video || !stream) {
      return;
    }

    function hideButton() {
      if (button) {
        button.classList.add('hidden');
      }
    }

    function showButton() {
      if (button) {
        button.classList.remove('hidden');
      }
    }

    function attachStream(done) {
      if (initialized) {
        done();
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.load();
        done();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hlsInstance.loadSource(stream);
        });
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          done();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            showButton();
          }
        });
        window.setTimeout(done, 1300);
        return;
      }

      video.src = stream;
      video.load();
      done();
    }

    function playVideo() {
      hideButton();
      attachStream(function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            showButton();
          });
        }
      });
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    if (shell) {
      shell.addEventListener('click', function (event) {
        if (!initialized && event.target !== button && !button.contains(event.target)) {
          playVideo();
        }
      });
    }

    video.addEventListener('play', hideButton);
    video.addEventListener('pause', function () {
      if (!video.ended) {
        showButton();
      }
    });
    video.addEventListener('ended', showButton);

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
