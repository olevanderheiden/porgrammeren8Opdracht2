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
    0.48230767250061035, 0.759615957736969, 0.5373712182044983,
    0.6829320192337036, 0.5122103095054626, 0.6848452091217041,
    0.4868967533111572, 0.6037048101425171, 0.5110818743705749,
    0.5277175903320312, 0.6120070815086365, 0.5524262199401855,
    0.5939223170280457, 0.44607722759246826, 0.5682878494262695,
    0.375238835811615, 0.5433224439620972, 0.3237228989601135,
    0.6528580188751221, 0.570753812789917, 0.5569690465927124,
    0.5241056680679321, 0.5409063100814819, 0.6046599745750427,
    0.5624806450843811, 0.676321186542511, 0.6724889278411865,
    0.6100026369094849, 0.5597432255744934, 0.6070812344551086,
    0.5551915764808655, 0.6793231964111328, 0.5838139653205872,
    0.6947613954544067, 0.6716403961181641, 0.6619684100151062,
    0.5763504505157471, 0.6724357604980469, 0.5729148983955383,
    0.7244285345077515, 0.59989994764328, 0.7361750602722168,
  ]);
  console.log(results);
  nn.save("model", () => console.log("model was saved!"));
}
