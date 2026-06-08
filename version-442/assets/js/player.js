(function () {
  function showMessage(stage, text) {
    var box = stage.querySelector("[data-player-message]");

    if (!box) {
      return;
    }

    box.textContent = text;
    box.classList.add("is-visible");
    window.setTimeout(function () {
      box.classList.remove("is-visible");
    }, 3600);
  }

  function startVideo(video, stage) {
    stage.classList.add("is-playing");
    video.controls = true;
    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        showMessage(stage, "轻触播放区域继续观看");
      });
    }
  }

  window.initMoviePlayer = function (videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);

    if (!video || !button || !streamUrl) {
      return;
    }

    var stage = video.closest(".video-stage") || video.parentElement;
    var mounted = false;
    var hlsInstance = null;

    function mount(callback) {
      if (mounted) {
        callback();
        return;
      }

      mounted = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.load();
        callback();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          callback();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
            return;
          }

          showMessage(stage, "播放暂时不可用，请稍后重试");
        });
        return;
      }

      video.src = streamUrl;
      video.load();
      callback();
    }

    function play() {
      mount(function () {
        startVideo(video, stage);
      });
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
}());
