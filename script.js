import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import kNear from "./knear.js";

const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");
const videoSelect = document.getElementById("videoSelect");
const mirrorButton = document.getElementById("mirrorButton");
const captureButton = document.getElementById("captureButton");
const trainButton = document.getElementById("trainButton");
const predictButton = document.getElementById("predictButton");
const poseCard = document.getElementById("poseCard");

const k = 7;
const machine = new kNear(k);
let trainingData = [];
let isMirrored = false;
let handLandmarker;

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
    const landmarks = results.landmarks[0];
    // Draw landmarks
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
  }
}

// Capture hand pose for training
captureButton.onclick = async () => {
  const landmarks = await handLandmarker.detectForVideo(
    videoElement,
    performance.now()
  );
  if (landmarks && landmarks.landmarks && landmarks.landmarks.length > 0) {
    const vector = landmarks.landmarks[0].flatMap((landmark) => [
      landmark.x,
      landmark.y,
    ]);
    const label = prompt("Enter label for this pose (rock, paper, scissors):");
    if (label) {
      trainingData.push({ vector, label });
      machine.learn(vector, label);
      console.log(`Captured pose: ${label}`);
    }
  }
};

// Save training data to a JSON file
trainButton.onclick = () => {
  const dataStr = JSON.stringify(trainingData);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = "trainingData.json";

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();

  alert(
    "Training data saved. You can now use the Predict button to classify poses."
  );
};

// Predict hand pose
predictButton.onclick = async () => {
  const landmarks = await handLandmarker.detectForVideo(
    videoElement,
    performance.now()
  );
  if (landmarks && landmarks.landmarks && landmarks.landmarks.length > 0) {
    const vector = landmarks.landmarks[0].flatMap((landmark) => [
      landmark.x,
      landmark.y,
    ]);
    const pose = machine.classify(vector);
    console.log(`Detected pose: ${pose}`);
    poseCard.textContent = `Detected pose: ${pose}`;
    poseCard.style.display = "block";
  }
};

// Mirror the video
mirrorButton.onclick = () => {
  isMirrored = !isMirrored;
  videoElement.style.transform = isMirrored ? "scaleX(-1)" : "scaleX(1)";
};

// Main logic
(async () => {
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
