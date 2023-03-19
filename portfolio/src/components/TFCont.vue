<template>
  <div class="q-pb-xl q-my-md" style="max-width: 900px">
    <div class="text-h4">The tf model and stuff</div>
  </div>
</template>

<script>
import codes from '../js/workerCodes.json'
export default {
  setup() {
    console.log(process);

    // rel url from THIS file
    const url = new URL('../js/workerTest.js', import.meta.url);
    console.log(url);
    const w = new Worker(url, {
      type: 'module',
    });

    w.onmessage = function (event) {
      switch(event.data){
        case codes.TENSOR_LOADED: {

        }
        case codes.SCATTERPLOT_DATA_RESP: {

        }
      }
    };
    console.log(w);
    w.postMessage(codes.LOAD_DATA);

    // let csvFile = tf.data.csv(
    //   'src/assets/processed_games/away/201209050nyg.csv',
    //   {
    //     hasHeader: false,
    //     columnNames: [
    //       'quarter',
    //       'timeLeft',
    //       'down',
    //       'distance',
    //       'oppTerritory',
    //       'yard',
    //       'homeScore',
    //       'awayScore',
    //     ],
    //   }
    // );

    // const mapped = csvFile
    //   .map((el) => {
    //     return { xs: Object.values(el), ys: [1] };
    //   })
    //   .batch(10);

    // csvFile.columnNames().then((colNames) => {
    //   const model = tf.sequential();
    //   model.add(
    //     tf.layers.dense({
    //       units: 20,
    //       activation: 'sigmoid',
    //       inputShape: [8],
    //     })
    //   );
    //   model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
    //   model.compile({
    //     loss: 'binaryCrossentropy',
    //     optimizer: tf.train.sgd(0.000001),
    //     metrics: ['accuracy'],
    //   });

    //   const { container, label, drawArea } = tfvis
    //     .visor()
    //     .surface({ name: 'fitCallbacks', tab: 'training' });

    //   model
    //     .fitDataset(mapped, {
    //       epochs: 30,
    //       callbacks: tfvis.show.fitCallbacks(container, ['loss', 'acc']),
    //     })
    //     .then((res) => {
    //       console.log(res);
    //       mapped.forEachAsync((el) => {
    //         const res = model.predictOnBatch(el.xs);
    //         res.print();
    //       });
    //     });
    // });

      // as of now, this trains a model on one single game file. it then predicts the data from that game
      //model is probably also bs but we have succesfully read in data and trained with it
  },
};
</script>

<style></style>
