import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
const nn = ml5.neuralNetwork({ task: "classification", debug: true });

const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");
const videoSelect = document.getElementById("videoSelect");
const mirrorButton = document.getElementById("mirrorButton");
const predictButton = document.getElementById("predictButton");

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
    });
    //send the landmarks to the neural network
    console.log(
      `Sending landmarks to the neural network: ${results.landmarks}`
    );
    predict(results.landmarks);
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
  console.log(`Predicting function called with landmarks: ${landmarks}`);
  const points = landmarks.landmarks.flatMap((handLandmarks) =>
    handLandmarks.flatMap((landmark) => [landmark.x, landmark.y])
  );

  console.log(`Points: ${points}`);
  if (points.length === 42) {
    console.log("Predicting...");
    const prediction = await nn.classify(points, (error, results) => {
      if (error) {
        console.error(error);
        return;
      }
      const pose = results[0].label;
      console.log(`Detected pose: ${pose}`);
      poseCard.textContent = `Detected pose: ${pose}`;
      poseCard.style.display = "block";
    });
    console.log(`Prediction: ${prediction}`);
  }
}
