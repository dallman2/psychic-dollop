<template>
  <div class="q-pb-xl q-my-md" style="max-width: 900px">
    <div class="text-h4">The tf model and stuff</div>
  </div>
</template>

<script>
import codes from '../js/workerCodes.json';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import ds from 'src/assets/processed_games/fullDS.json';
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
      switch (event.data[0]) {
        case codes.TENSOR_LOADED: {
          w.postMessage([codes.GET_SCATTERPLOT_DATA]);
          break;
        }
        case codes.SCATTERPLOT_DATA_RESP: {
          /** @type {Int32Array} */
          let awayBuff = event.data[1];
          /** @type {Int32Array} */
          let homeBuff = event.data[2];

          let awayScatter = Array.from(awayBuff)
            .filter((el, idx) => (idx + 1) % 204 != 0)
            .map((el, idx) => ({ x: idx % 203, y: el }));
          let homeScatter = Array.from(homeBuff)
            .filter((el, idx) => (idx + 1) % 204 != 0)
            .map((el, idx) => ({ x: idx % 203, y: el }));

          let a = tf.tensor(awayBuff, [awayBuff.length / 204, 204, 1], 'int32');
          let h = tf.tensor(homeBuff, [homeBuff.length / 204, 204, 1], 'int32');
          console.log(awayScatter);
          console.log(homeScatter);

          tfvis.show.valuesDistribution(
            { name: 'quarter vals dist', tab: 'away' },
            a
          );
          tfvis.show.valuesDistribution(
            { name: 'quarter vals dist', tab: 'home' },
            h
          );
          tfvis.render.heatmap(
            { name: 'quarter heatmap', tab: 'away' },
            { values: a.arraySync() }
          );
          tfvis.render.heatmap(
            { name: 'quarter heatmap', tab: 'home' },
            { values: h.arraySync() }
          );

          tfvis.render.scatterplot(
            { name: 'quarter vals scatter', tab: 'home' },
            { values: [homeScatter], series: ['home'] }
          );
          tfvis.render.scatterplot(
            { name: 'quarter vals scatter', tab: 'away' },
            { values: [awayScatter], series: ['away'] }
          );
          break;
        }
      }
    };
    console.log(w);
    // w.postMessage([codes.LOAD_DATA]);

    function createData() {
      /** @type {Array} */
      const data = ds.data;
      let dataMap = {
        games: [],
        labels: [],
        breakpoint: 0,
      };

      let finalSum = 0;
      data.forEach(
        /** @param {Array} game */ (game) => {
          finalSum = game.at(-1).reduce((acc, el) => acc + el, 0);
          if (finalSum) {
            dataMap.games.push(
              game
                .slice(0, -1)
                .map(/** @param {Array} play */ (play) => play.slice(0, 6)) // this removes scores
            );
            dataMap.labels.push(true);
          } else {
            dataMap.games.push(
              game
                .slice(0, -1)
                .map(/** @param {Array} play */ (play) => play.slice(0, 6)) // this removes scores
            );
            dataMap.labels.push(false);
          }
        }
      );

      tf.util.shuffleCombo(dataMap.games, dataMap.labels);

      const trainBreak = Math.floor(dataMap.games.length * 0.7);
      const testBreak = Math.floor(dataMap.games.length * 0.9);

      return {
        train: {
          x: tf.tensor(
            dataMap.games.slice(0, trainBreak),
            [trainBreak, 203, 6],
            'int32'
          ),
          y: tf.tensor(
            dataMap.labels.slice(0, trainBreak),
            [trainBreak, 1],
            'bool'
          ),
        },
        test: {
          x: tf.tensor(
            dataMap.games.slice(trainBreak, testBreak),
            [testBreak - trainBreak, 203, 6],
            'int32'
          ),
          y: tf.tensor(
            dataMap.labels.slice(trainBreak, testBreak),
            [testBreak - trainBreak, 1],
            'bool'
          ),
        },
        val: {
          x: tf.tensor(
            dataMap.games.slice(testBreak),
            [dataMap.games.length - testBreak, 203, 6],
            'int32'
          ),
          y: tf.tensor(
            dataMap.labels.slice(testBreak),
            [dataMap.games.length - testBreak, 1],
            'bool'
          ),
        },
      };
    }

    function createRnn(units, inputShape) {
      const model = tf.sequential();
      model.add(
        tf.layers.simpleRNN({
          units,
          inputShape,
          inputDType: 'int32'
        })
      );
      model.add(
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid',
        })
      );
      return model;
    }

    async function trainNetwork() {
      const units = 40,
        inputShape = [203, 6];
      const model = createRnn(units, inputShape);
      const data = createData();

      model.compile({
        loss: 'binaryCrossentropy',
        optimizer: 'adam',
        metrics: ['acc'],
      });
      model.summary();
      // data.train.x.print();
      // data.train.y.print();
      // data.test.x.print();
      // data.test.y.print();
      // data.val.x.print();
      // data.val.y.print();

      console.log('fitting');
      await model.fit(data.train.x, data.train.y, {
        epochs: 5,
        validationData: [data.test.x, data.test.y],
      });
      console.log('eval');
      const [testLoss, testAcc] = model.evaluate(data.val.x, data.val.y);
      console.log(`Evaluation loss: ${(await testLoss.data())[0].toFixed(4)}`);
      console.log(
        `Evaluation accuracy: ${(await testAcc.data())[0].toFixed(4)}`
      );
    }

    trainNetwork();
    // as of now, this trains a model on one single game file. it then predicts the data from that game
    //model is probably also bs but we have succesfully read in data and trained with it

    //============================================================================================
  },
};
</script>

<style></style>
