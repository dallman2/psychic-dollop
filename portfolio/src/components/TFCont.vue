<template>
  <div class="q-pb-xl q-my-md" style="max-width: 900px">
    <div class="text-h4">The tf model and stuff</div>
  </div>
</template>

<script>
import * as tf from '@tensorflow/tfjs';
export default {
  setup() {
    console.log('setup tfcont');
    console.log(tf);

    let csvFile = tf.data.csv('201209050nyg.csv', {
      hasHeader: false,
      columnNames: [
        'quarter',
        'timeLeft',
        'down',
        'distance',
        'oppTerritory',
        'yard',
        'homeScore',
        'awayScore',
      ],
    });

    const mapped = csvFile
      .map((el) => {
        return { xs: Object.values(el), ys: [1] };
      })
      .batch(10);

    csvFile.columnNames().then((colNames) => {
      const model = tf.sequential();
      model.add(
        tf.layers.dense({
          units: 20,
          activation: 'sigmoid',
          inputShape: [8],
        })
      );
      model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
      model.compile({
        loss: 'binaryCrossentropy',
        optimizer: tf.train.sgd(0.000001),
        metrics: ['accuracy'],
      });

      model
        .fitDataset(mapped, {
          epochs: 30,
          callbacks: {
            onEpochEnd: async (epoch, logs) => {
              console.log(epoch + ':' + logs.loss);
            },
          },
        })
        .then((res) => {
          console.log(res);
          mapped.forEachAsync((el) => {
            const res = model.predictOnBatch(el.xs);
            res.print();
          });
        });

      // as of now, this trains a model on one single game file. it then predicts the data from that game
      //model is probably also bs but we have succesfully read in data and trained with it
    });
  },
};
</script>

<style></style>
