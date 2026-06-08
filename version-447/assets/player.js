(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  window.setupMoviePlayer = function (sourceUrl) {
    onReady(function () {
      var stage = document.querySelector("[data-player]");
      if (!stage) {
        return;
      }
      var video = stage.querySelector("video");
      var overlay = stage.querySelector(".player-overlay");
      if (!video || !overlay || !sourceUrl) {
        return;
      }
      var hls = null;
      var loaded = false;
      var pendingPlay = false;

      function hideOverlay() {
        overlay.classList.add("is-hidden");
      }

      function attemptPlay() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }

      function loadStream() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
          video.addEventListener("loadedmetadata", function () {
            if (pendingPlay) {
              attemptPlay();
            }
          }, { once: true });
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (pendingPlay) {
              attemptPlay();
            }
          });
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              hls = null;
              loaded = false;
              overlay.classList.remove("is-hidden");
            }
          });
          return;
        }
        video.src = sourceUrl;
      }

      function startPlayback() {
        pendingPlay = true;
        hideOverlay();
        loadStream();
        attemptPlay();
      }

      overlay.addEventListener("click", startPlayback);
      video.addEventListener("play", hideOverlay);
      video.addEventListener("click", function () {
        if (!loaded) {
          startPlayback();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };
})();
