const laptopPlayer = document.querySelector("#laptop-player");
const laptopArt = document.querySelector("#laptop-art");
const feedbackArt = document.querySelector("#feedback-art");
const swipeHint = document.querySelector("#swipe-hint");
const video = document.querySelector("#video-player");
const mobileLayout = window.matchMedia("(max-width: 700px)");
const keyboardSound = new Audio("Buddy-A2/keyboard.wav");
const laptopCloseSound = new Audio("Buddy-A2/laptop-close.m4a");

keyboardSound.preload = "auto";
keyboardSound.volume = 0.45;
laptopCloseSound.preload = "auto";
laptopCloseSound.volume = 0.65;

const feedbackImages = {
  rewind: "Buddy-A2/rewind-feedback.png",
  "play-pause": "Buddy-A2/play-pause-feedback.png",
  forward: "Buddy-A2/fast-forward-feedback.png",
  mute: "Buddy-A2/mute-feedback.png",
  "volume-down": "Buddy-A2/volume-down-feedback.png",
  "volume-up": "Buddy-A2/volume-up-feedback.png",
  spacebar: "Buddy-A2/spacebar-feedback.png"
};

let feedbackTimer;
let touchStartX = 0;
let touchStartY = 0;
let laptopIsClosed = false;

function playSound(sound) {
  sound.pause();
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function showFeedback(name) {
  const image = feedbackImages[name];

  if (!image || laptopIsClosed) {
    return;
  }

  window.clearTimeout(feedbackTimer);
  feedbackArt.src = image;
  feedbackArt.classList.remove("is-visible");
  void feedbackArt.offsetWidth;
  feedbackArt.classList.add("is-visible");

  feedbackTimer = window.setTimeout(() => {
    feedbackArt.classList.remove("is-visible");
  }, 260);
}

function togglePlayback() {
  if (video.paused) {
    video.play().catch(() => {});
  } else {
    video.pause();
  }
}

function skipVideo(seconds) {
  const targetTime = Math.max(video.currentTime + seconds, 0);
  video.currentTime = Number.isFinite(video.duration)
    ? Math.min(targetTime, video.duration)
    : targetTime;
}

function changeVolume(amount) {
  video.muted = false;
  video.volume = Math.min(Math.max(video.volume + amount, 0), 1);
}

function runMediaAction(action) {
  if (laptopIsClosed) {
    return;
  }

  if (action === "rewind") {
    skipVideo(-10);
  } else if (action === "play-pause") {
    togglePlayback();
  } else if (action === "forward") {
    skipVideo(10);
  } else if (action === "mute") {
    video.muted = !video.muted;
  } else if (action === "volume-down") {
    changeVolume(-0.1);
  } else if (action === "volume-up") {
    changeVolume(0.1);
  }
}

function setLaptopClosed(shouldClose) {
  laptopIsClosed = shouldClose;
  laptopPlayer.classList.toggle("is-closed", shouldClose);
  laptopArt.src = shouldClose
    ? "Buddy-A2/laptop-closed.png"
    : "Buddy-A2/laptop-open.png";
  laptopArt.alt = shouldClose ? "Hand-drawn closed laptop" : "Hand-drawn open laptop";
  swipeHint.textContent = shouldClose ? "Swipe up to open" : "Swipe down to close";

  if (shouldClose) {
    video.pause();
    feedbackArt.classList.remove("is-visible");
  }
}

document.querySelectorAll(".laptop-key").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    const feedback = button.dataset.feedback || action;
    playSound(keyboardSound);
    runMediaAction(action);
    showFeedback(feedback);
  });
});

laptopPlayer.addEventListener(
  "touchstart",
  (event) => {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  },
  { passive: true }
);

laptopPlayer.addEventListener(
  "touchend",
  (event) => {
    const changeX = event.changedTouches[0].clientX - touchStartX;
    const changeY = event.changedTouches[0].clientY - touchStartY;

    if (Math.abs(changeY) > 55 && Math.abs(changeY) > Math.abs(changeX)) {
      const shouldClose = changeY > 0;

      if (shouldClose && !laptopIsClosed) {
        playSound(laptopCloseSound);
      }

      setLaptopClosed(shouldClose);
    }
  },
  { passive: true }
);

document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && event.target === document.body) {
    event.preventDefault();
    playSound(keyboardSound);
    runMediaAction("play-pause");
    showFeedback("spacebar");
  }
});

function updateLayout() {
  video.controls = !mobileLayout.matches;

  if (!mobileLayout.matches) {
    setLaptopClosed(false);
  }
}

mobileLayout.addEventListener("change", updateLayout);
updateLayout();