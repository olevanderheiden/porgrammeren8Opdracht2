const trainingButton = document.getElementById("trainButton");
const statusText = document.getElementById("status");
const nn = ml5.neuralNetwork({ task: "classification", debug: true });

trainingButton.addEventListener("click", async () => {
  statusText.innerText = "Loading data...";
  await ml5.tf.setBackend("cpu");
  await ml5.tf.ready();
  fetch(`trainingData.json`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      statusText.innerText = "Adding data to neural network";
      data.forEach((pose) => {
        nn.addData(pose.points, { label: pose.label });
      });
      statusText.innerText = "Normalizing data";
      nn.normalizeData();
      statusText.innerText = "Training...";
      nn.train({ epochs: 150 }, () => finishedTraining());
    });
});

async function finishedTraining() {
  statusText.innerText = "Training finished";
  const results = await nn.classify([
    0.5973076820373535, 0.8696159720420837, 0.5273712277412415,
    0.7729320526123047, 0.5022103190422058, 0.6748452186584473,
    0.49689674377441406, 0.5937048196792603, 0.5010818839073181,
    0.5177175998687744, 0.6020070910453796, 0.5424262285232544,
    0.5839223265647888, 0.4360772371292114, 0.5582878589630127,
    0.36523884534835815, 0.5333224534988403, 0.3137229084968567,
    0.6428580284118652, 0.5607538223266602, 0.5469690561294556,
    0.5141056776046753, 0.5309063196182251, 0.5946599841117859,
    0.5524806546211243, 0.6663211965560913, 0.6624889373779597,
    0.600002646446228, 0.5497432351112366, 0.5970812439918518,
    0.5451915860176086, 0.669323205947876, 0.5738139748573303,
    0.6847614048911499, 0.6616404056549072, 0.6519684195518394,
    0.5663504600524902, 0.66243577003479, 0.5629149079322815,
    0.7144285440444946, 0.5898999471800232, 0.72617504980896,
  ]);
  console.log(results);
}
