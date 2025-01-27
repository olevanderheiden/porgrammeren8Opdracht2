import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
const nn = ml5.neuralNetwork({ task: "classification", debug: true });

const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");
const videoSelect = document.getElementById("videoSelect");
const mirrorButton = document.getElementById("mirrorButton");
let bestResult;
let previousBestResult;
let sameBestResultCount = 0;

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
      console.log("Results:", results);
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
          sameBestResultCount = 0;
        }

        previousBestResult = bestResult;

        if (sameBestResultCount >= 25) {
          const pose = bestResult.label;
          console.log(`Detected pose: ${pose}`);
          poseCard.textContent = `Detected pose: ${pose}`;
          poseCard.style.display = "block";

          // Trigger music control action here
          controlMusic(pose);
          clearTimeout(resetCount);
          resetCount();
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
  switch (pose) {
    case "start":
      // Code to play music
      console.log("Playing music");
      break;
    case "stop":
      // Code to pause music
      console.log("Pausing music");
      break;
    case "next":
      // Code to skip to the next track
      console.log("Next track");
      break;
    case "previous":
      // Code to go to the previous track
      console.log("Previous track");
      break;
    case "volume_up":
      // Code to increase volume
      console.log("Increasing volume");
      break;
    case "volume_down":
      // Code to decrease volume
      console.log("Decreasing volume");
      break;
    case "restart":
      // Code to restart the current track
      console.log("Restarting track");
    default:
      console.log("Unknown pose");
  }
}
