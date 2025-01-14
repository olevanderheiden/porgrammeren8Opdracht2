import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");
const videoSelect = document.getElementById("videoSelect");
const cameraName = document.getElementById("cameraName");
const mirrorButton = document.getElementById("mirrorButton");
const displayCamera = document.getElementById("displayCamera");
const showIndicators = document.getElementById("showIndicators");
const controls = document.getElementById("controls");

let isMirrored = false;
let prevX = null;
let prevY = null;
let isDrawing = true;
let prevPoints = [];
let isShowingIndicators = false;

// Mirror the video
mirrorButton.onclick = () => {
  isMirrored = !isMirrored;
  videoElement.style.transform = isMirrored ? "scaleX(-1)" : "scaleX(1)";
};

//show indicators
showIndicators.onclick = () => {
  0;
};

//display camera
displayCamera.onclick = () => {
  isShowingIndicators = !isShowingIndicators;
  videoElement.className = isShowingIndicators ? "display" : "hide";
};

// Toggle controls visibility with "c" key
document.addEventListener("keydown", (event) => {
  if (event.key === "c" || event.key === "C") {
    controls.style.display =
      controls.style.display === "none" ? "block" : "none";
  }
});

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

// Set up camera
async function setupCamera(deviceId) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: deviceId ? { exact: deviceId } : undefined },
  });
  videoElement.srcObject = stream;
  const selectedDevice = videoSelect.options[videoSelect.selectedIndex]?.text;
  cameraName.textContent = `Current Camera: ${selectedDevice}`;
  return new Promise((resolve) => {
    videoElement.onloadedmetadata = () => {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      resolve(videoElement);
    };
  });
}

videoSelect.onchange = () => {
  setupCamera(videoSelect.value);
};

// Initialize HandLandmarker
async function initializeHandLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  const handLandmarker = await HandLandmarker.createFromOptions(vision, {
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
  if (results.landmarks && results.landmarks.length > 0) {
    const landmarks = results.landmarks[0];
    // Define finger indices
    const fingerIndices = {
      thumb: [4],
      indexFinger: [8],
      middleFinger: [12],
      ringFinger: [16],
      pinky: [20],
    };

    // Adjust coordinates for mirroring and draw
    Object.keys(fingerIndices).forEach((finger) => {
      if (document.getElementById(finger).checked) {
        fingerIndices[finger].forEach((index) => {
          const landmark = landmarks[index];
          const x = isMirrored
            ? canvasElement.width - landmark.x * canvasElement.width
            : landmark.x * canvasElement.width;
          const y = landmark.y * canvasElement.height;

          if (isDrawing) {
            if (prevPoints[index]) {
              canvasCtx.beginPath();
              canvasCtx.moveTo(prevPoints[index].x, prevPoints[index].y);
              canvasCtx.lineTo(x, y);
              canvasCtx.strokeStyle = "blue";
              canvasCtx.lineWidth = 5;
              canvasCtx.stroke();
            }
            prevPoints[index] = { x, y };
          }
        });
      }
    });
  } else {
    prevPoints = [];
  }
}

// Main logic
(async () => {
  await getCameras();
  const video = await setupCamera(videoSelect.value);
  video.play();
  const handLandmarker = await initializeHandLandmarker();

  async function processFrame() {
    const landmarks = handLandmarker.detectForVideo(video, performance.now());
    onResults(landmarks);
    requestAnimationFrame(processFrame);
  }

  processFrame();
})();
