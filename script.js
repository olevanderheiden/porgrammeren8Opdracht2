const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");
const videoSelect = document.getElementById("videoSelect");
const cameraName = document.getElementById("cameraName");
const mirrorButton = document.getElementById("mirrorButton");
const displayCamera = document.getElementById("displayCamera");

let isMirrored = false;
let showCamera = true;

mirrorButton.onclick = () => {
  isMirrored = !isMirrored;
  videoElement.style.transform = isMirrored ? "scaleX(-1)" : "scaleX(1)";
};
displayCamera.onclick = () => {
  showCamera = !showCamera;
  videoElement.className = showCamera ? "display" : "hide";
};

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

async function setupCamera(deviceId) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: deviceId ? { exact: deviceId } : undefined },
  });
  videoElement.srcObject = stream;
  const selectedDevice = videoSelect.options[videoSelect.selectedIndex].text;
  cameraName.textContent = `Current Camera: ${selectedDevice}`;
  return new Promise((resolve) => {
    videoElement.onloadedmetadata = () => {
      resolve(videoElement);
    };
  });
}

videoSelect.onchange = () => {
  setupCamera(videoSelect.value);
};

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/${file}`;
  },
});

hands.setOptions({
  maxNumHands: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

hands.onResults(onResults);

function onResults(results) {
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    const indexFingerTip = landmarks[8]; // Index finger tip landmark

    canvasCtx.save();
    if (isMirrored) {
      canvasCtx.translate(canvasElement.width, 0);
      canvasCtx.scale(-1, 1);
    }

    canvasCtx.beginPath();
    canvasCtx.arc(
      indexFingerTip.x * canvasElement.width,
      indexFingerTip.y * canvasElement.height,
      5,
      0,
      2 * Math.PI
    );
    canvasCtx.fill();

    canvasCtx.restore();
  }
}

getCameras().then(() => {
  setupCamera(videoSelect.value).then((video) => {
    video.play();
    const camera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 640,
      height: 480,
    });
    camera.start();
  });
});
