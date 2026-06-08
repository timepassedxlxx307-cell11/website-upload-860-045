import { H as Hls } from "./hls-dru42stk.js";

function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
        return;
    }
    callback();
}

ready(function () {
    var video = document.querySelector("video[data-video-src]");
    if (!video) {
        return;
    }
    var button = document.querySelector("[data-video-cover]");
    var source = video.getAttribute("data-video-src");
    var loaded = false;

    function loadVideo() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function begin() {
        loadVideo();
        if (button) {
            button.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
        if (!loaded) {
            begin();
        }
    });
});
