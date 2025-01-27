import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
const nn = ml5.neuralNetwork({ task: "classification", debug: true });

const videoElement = document.getElementById("video");
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

let isMirrored = false;
let handLandmarker;

// YouTube IFrame Player API initialization
function onYouTubeIframeAPIReady() {
  console.log("YouTube IFrame API is ready");
  youtubePlayer = new YT.Player("player", {
    height: "390",
    width: "640",
    playerVars: {
      listType: "playlist",
      list: playlistId,
    },
    events: {
      onReady: initializeVolume,
    },
  });
  console.log("YouTube Player initialized:", youtubePlayer);
}

// Function to load a new playlist
function loadPlaylist(playlistId) {
  if (!youtubePlayer) {
    console.error("YouTube player is not initialized.");
    return;
  }

  youtubePlayer.loadPlaylist({
    listType: "playlist",
    list: playlistId,
  });
}

// Initialize volume
function initializeVolume() {
  if (youtubePlayer && youtubePlayer.getVolume) {
    volume = youtubePlayer.getVolume();
    console.log("Volume initialized:", volume);
  } else {
    console.error("YouTube player is not initialized.");
  }
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
  playlistId = document.getElementById("playlistIdInput").value;
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

        if (sameBestResultCount === 10) {
          const pose = bestResult.label;
          // console.log(`Detected pose: ${pose}`);
          poseCard.textContent = `Detected pose: ${pose}`;
          poseCard.style.display = "block";

          // Trigger music control action here
          controlMusic(pose);
        }
        if (sameBestResultCount < 10) {
          //same pose detected over 25 times in a row cooldown
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
      console.log("Increasing volume");
      break;
    case "volume_down":
      youtubePlayer.setVolume(volume - 10, 0);
      initializeVolume();
      console.log("Decreasing volume");
      break;
    case "restart":
      youtubePlayer.seekTo(0);
      youtubePlayer.playVideo();
      console.log("Restarting track");
    default:
      console.log("Unknown pose");
  }
}
