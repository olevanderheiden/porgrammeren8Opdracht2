import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
const nn = ml5.neuralNetwork({ task: "classification", debug: true });

// Ensure the YouTube IFrame API script is loaded
let youtubeScriptTag = document.createElement("script");
youtubeScriptTag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(youtubeScriptTag);

const videoElement = document.getElementById("video");
const songCard = document.getElementById("songCard");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");
const videoSelect = document.getElementById("videoSelect");
const mirrorButton = document.getElementById("mirrorButton");
const loadPlaylistButton = document.getElementById("loadPlaylistButton");
let bestResult;
let previousBestResult;
let sameBestResultCount = 0;
let youtubePlayer;
let playlistId = "PLzFTGYa_evXjiiu4xLpzWlykAxNcD97rS";
let volume;
// Number of checks required to confirm a pose
const requiredAmountOfChecks = 10;

let isMirrored = false;
let handLandmarker;

// YouTube IFrame Player API initialization
window.onYouTubeIframeAPIReady = function () {
  console.log("YouTube IFrame API is ready");
  try {
    youtubePlayer = new YT.Player("player", {
      height: "0",
      width: "0",
      playerVars: {
        listType: "playlist",
        list: playlistId,
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: initializeVolume,
        onStateChange: updateSongTitle,
      },
    });
    console.log("YouTube Player initialized:", youtubePlayer);
  } catch (error) {
    if (!error.message.includes("ERR_BLOCKED_BY_CLIENT")) {
      console.error("Error initializing YouTube Player:", error);
    }
  }
};

// Function to load a new playlist
function loadPlaylist(playlistId) {
  youtubePlayer.loadPlaylist({
    listType: "playlist",
    list: playlistId,
  });
}

// Initialize volume
function initializeVolume() {
  if (youtubePlayer && youtubePlayer.getVolume) {
    volume = youtubePlayer.getVolume();
  } else {
    console.error("YouTube player is not initialized.");
  }
}

// Function to update the song title
function updateSongTitle() {
  const videoData = youtubePlayer.getVideoData();
  const title = videoData.title;
  songCard.textContent = `Now Playing: ${title}`;
}

// Initialize video stream
async function setupCamera(deviceId) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: deviceId ? { exact: deviceId } : undefined },
  });
  videoElement.srcObject = stream;
  return new Promise((resolve) => {
    videoElement.onloadedmetadata = () => {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      resolve(videoElement);
    };
  });
}

// Populate video device options
async function getCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((device) => device.kind === "videoinput");
  videoSelect.innerHTML = "";
  videoDevices.forEach((device, index) => {
    const option = document.createElement("option");
    option.value = device.deviceId;
    option.text = device.label || `Camera ${index + 1}`;
    videoSelect.appendChild(option);
  });
}

// Initialize HandLandmarker
async function initializeHandLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/models/hlm.task",
    },
    runningMode: "VIDEO",
    numHands: 1,
  });
  return handLandmarker;
}

// Process the hand landmarks and draw on the canvas
function onResults(results) {
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  if (results.landmarks && results.landmarks.length > 0) {
    results.landmarks.forEach((landmarks) => {
      // Draw landmarks for each hand
      landmarks.forEach((landmark) => {
        const x = isMirrored
          ? canvasElement.width - landmark.x * canvasElement.width
          : landmark.x * canvasElement.width;
        const y = landmark.y * canvasElement.height;
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
        canvasCtx.fillStyle = "red";
        canvasCtx.fill();
      });

      // Send landmarks to ml5 for classification
      predict(landmarks);
    });
  }
}

// Mirror the video
mirrorButton.onclick = () => {
  isMirrored = !isMirrored;
  videoElement.style.transform = isMirrored ? "scaleX(-1)" : "scaleX(1)";
};

// Load a new playlist
loadPlaylistButton.onclick = () => {
  let update = false;
  let curentPlaylistId = document.getElementById("playlistIdInput").value;
  if (curentPlaylistId.includes("list=")) {
    update = true;
    playlistId = curentPlaylistId.split("list=")[1];
  } else if (
    playlistId.match(/^[a-zA-Z0-9_-]{34}$/) ||
    playlistId === "" ||
    playlistId === null
  ) {
    update = true;
    playlistId = document.getElementById("playlistIdInput").value;
  } else {
    alert(
      "You have entered an invalid playlist ID! Refresh the page and try again."
    );
  }
  loadPlaylist(playlistId);
};

// Main logic
(async () => {
  await setupMl5();
  await getCameras();
  await setupCamera(videoSelect.value);
  handLandmarker = await initializeHandLandmarker();

  async function processFrame() {
    const landmarks = await handLandmarker.detectForVideo(
      videoElement,
      performance.now()
    );
    onResults(landmarks);
    requestAnimationFrame(processFrame);
  }

  processFrame();
})();

videoSelect.onchange = () => {
  setupCamera(videoSelect.value);
};

// Acquiring model details
const modelDetails = {
  model: "model/model.json",
  metadata: "model/model_meta.json",
  weights: "model/model.weights.bin",
};

//set up ml5 neural network
async function setupMl5() {
  await ml5.tf.setBackend("cpu");
  await ml5.tf.ready();
  nn.load(modelDetails, () => console.log("Model succesfully loaded!"));
}

// Predict the hand gesture
async function predict(landmarks) {
  // Flatten the landmarks array to get the x and y coordinates
  const points = landmarks.flatMap((landmark) => [landmark.x, landmark.y]);

  if (points.length === 42) {
    nn.classify(points, (results, error) => {
      if (error) {
        console.error(error);
        return;
      }
      if (results && results.length > 0) {
        results.forEach((result, index) => {});
        // Find the result with the highest confidence

        setTimeout(() => resetCount(), 5000);

        bestResult = results[0];

        if (
          previousBestResult &&
          bestResult.label === previousBestResult.label
        ) {
          sameBestResultCount++;
        } else {
          console.log("Different pose detected");
          sameBestResultCount = 0;
        }

        previousBestResult = bestResult;

        if (sameBestResultCount === requiredAmountOfChecks) {
          const pose = bestResult.label;
          poseCard.textContent = `Detected pose: ${pose}`;
          poseCard.style.display = "block";

          // Trigger music control action here
          controlMusic(pose);
        }
        if (sameBestResultCount < requiredAmountOfChecks) {
          //same pose detected over 10 times in a row cooldown
          clearTimeout(resetCount);
          setTimeout(() => resetCount(), 2000);
        }

        const pose = bestResult.label;
        poseCard.textContent = `Detected pose: ${pose}`;
        poseCard.style.display = "block";
      } else {
        console.error("No results returned from classification.");
      }
    });
  }
}

// Reset the counter
function resetCount() {
  sameBestResultCount = 0;
}

// Function to control music based on the detected pose
function controlMusic(pose) {
  if (!youtubePlayer) {
    console.error("YouTube player is not initialized.");
    return;
  }

  switch (pose) {
    case "start":
      youtubePlayer.playVideo();
      console.log("Playing music");
      break;
    case "stop":
      youtubePlayer.pauseVideo();
      console.log("Pausing music");
      break;
    case "next":
      youtubePlayer.nextVideo();
      console.log("Next track");
      break;
    case "previous":
      youtubePlayer.previousVideo();
      console.log("Previous track");
      break;
    case "volume_up":
      youtubePlayer.setVolume(volume + 10, 100);
      initializeVolume();
      console.log(`Increasing volume to ${volume}`);
      break;
    case "volume_down":
      youtubePlayer.setVolume(volume - 10, 0);
      initializeVolume();
      console.log(`Decreasing volume to ${volume}`);
      break;
    case "restart":
      youtubePlayer.seekTo(0);
      youtubePlayer.playVideo();
      console.log("Restarting track");
    default:
      console.log("Unknown pose");
  }
}

// Catch and ignore blocked requests
window.addEventListener("error", function (event) {
  if (event.message.includes("ERR_BLOCKED_BY_CLIENT")) {
    event.preventDefault();
  }
});
