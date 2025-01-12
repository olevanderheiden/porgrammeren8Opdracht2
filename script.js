import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");
const videoSelect = document.getElementById("videoSelect");
const cameraName = document.getElementById("cameraName");
const mirrorButton = document.getElementById("mirrorButton");
const displayCamera = document.getElementById("displayCamera");

let isMirrored = false;
let prevX = null;
let prevY = null;
let isDrawing = true;
let isShowingIndicators = true;

// Mirror the video
mirrorButton.onclick = () => {
  isMirrored = !isMirrored;
  videoElement.style.transform = isMirrored ? "scaleX(-1)" : "scaleX(1)";
};

//display camera
displayCamera.onclick = () => {
  isShowingIndicators = !isShowingIndicators;
  videoElement.className = isShowingIndicators ? "display" : "hide";
};

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
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results.landmarks && results.landmarks.length > 0) {
    const landmarks = results.landmarks[0];
    console.log(`landmarks: ${landmarks}`);

    const indexFingerTip = landmarks[8]; // Index finger tip

    const x = indexFingerTip.x * canvasElement.width;
    const y = indexFingerTip.y * canvasElement.height;

    // Drawing logic
    if (isDrawing) {
      if (prevX !== null && prevY !== null) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(prevX, prevY);
        canvasCtx.lineTo(x, y);
        canvasCtx.strokeStyle = "blue";
        canvasCtx.lineWidth = 5;
        canvasCtx.stroke();
      }
      prevX = x;
      prevY = y;
    }

    // Draw landmarks
    landmarks.forEach((landmark) => {
      const cx = landmark.x * canvasElement.width;
      const cy = landmark.y * canvasElement.height;
      canvasCtx.beginPath();
      canvasCtx.arc(cx, cy, 5, 0, 2 * Math.PI);
      canvasCtx.fillStyle = "red";
      canvasCtx.fill();
    });
  } else {
    prevX = null;
    prevY = null;
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
