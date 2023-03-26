import * as tf from '@tensorflow/tfjs';
import ds from 'src/assets/processed_games/fullDS.json';
import codes from './workerCodes.json';

/**
 * ### changes that need to be made
 *
 * web worker needs to be able to find an index of games to open up
 * - ideally this would come from a static hosting service (ie another github pages site)
 *
 * games need to include possesion data in the pbp
 * - this is keyed off of the presence of a `.divider` class on selected `<tr>`s
 * - somehow parse the opening coin toss line and the team name to determine who starts
 * - flip a flag every time you see a `.divider`
 *
 * maybe include team abreviations? gonna be hard when teams change cities
 *
 */

let godTensor;
let labelMap = {
  games: [],
  labels: [],
  breakpoint: 0,
};
let slices = {
  home: {
    /** @type {tf.Tensor} */
    quarter: {},
    /** @type {tf.Tensor} */
    time: {},
    /** @type {tf.Tensor} */
    down: {},
    /** @type {tf.Tensor} */
    distance: {},
    /** @type {tf.Tensor} */
    yard: {},
    /** @type {tf.Tensor} */
    opp: {},
    /** @type {tf.Tensor} */
    home: {},
    /** @type {tf.Tensor} */
    away: {},
  },
  away: {
    /** @type {tf.Tensor} */
    quarter: {},
    /** @type {tf.Tensor} */
    time: {},
    /** @type {tf.Tensor} */
    down: {},
    /** @type {tf.Tensor} */
    distance: {},
    /** @type {tf.Tensor} */
    yard: {},
    /** @type {tf.Tensor} */
    opp: {},
    /** @type {tf.Tensor} */
    home: {},
    /** @type {tf.Tensor} */
    away: {},
  },
};

onmessage = function (event) {
  switch (event.data[0]) {
    case codes.LOAD_DATA: {
      // createTensor();
      trainNetwork();
      break;
    }
    case codes.GET_SCATTERPLOT_DATA: {
      // postScatterplotData();

      break;
    }
  }
  console.log(event);
};

const filterGameToOneFeature = (game, idx) => game.map((play) => [play[idx]]);

function createTensor() {
  let ten2d = tf.tensor3d(ds.data, [ds.data.length, 204, 8], 'int32');
  ten2d.print();

  godTensor = tf.tensor(ds.data, [ds.data.length, 204, 8], 'int32');
  godTensor.print();

  let finalSum = 0;
  ds.data.forEach((game) => {
    finalSum = game.at(-1).reduce((acc, el) => acc + el, 0);
    if (finalSum) {
      labelMap.games.push(game);
      labelMap.labels.push(1);
    } else {
      labelMap.games.push(game);
      labelMap.labels.push(0);
    }
  });

  labelMap.breakpoint = labelMap.labels.indexOf(1);

  console.log(labelMap);

  Object.entries(slices.away).forEach((entry, idx) => {
    slices.away[entry[0]] = tf.tensor(
      ds.data
        .slice(0, labelMap.breakpoint)
        .map((game) => filterGameToOneFeature(game, idx)),
      [labelMap.breakpoint, 204, 1],
      'int32'
    );
  });
  Object.entries(slices.home).forEach((entry, idx) => {
    slices.home[entry[0]] = tf.tensor(
      ds.data
        .slice(labelMap.breakpoint)
        .map((game) => filterGameToOneFeature(game, idx)),
      [ds.data.length - labelMap.breakpoint, 204, 1],
      'int32'
    );
  });

  console.log(slices);
  postMessage([codes.TENSOR_LOADED]);
}

function postScatterplotData() {
  postMessage([
    codes.SCATTERPLOT_DATA_RESP,
    slices.away.quarter.bufferSync().values,
    slices.home.quarter.bufferSync().values,
  ]);
}

//============================================================================================

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
      // inputDType: 'int32'
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
  data.train.x.print();
  data.train.y.print();
  data.test.x.print();
  data.test.y.print();
  data.val.x.print();
  data.val.y.print();

  console.log('fitting')
  await model.fit(data.train.x, data.train.y, {
    epochs: 1,
    validationData: [data.val.x, data.val.y]
  });
  console.log('eval')
  const [testLoss, testAcc] = model.evaluate(data.test.x, data.test.y);
  console.log(`Evaluation loss: ${(await testLoss.data())[0].toFixed(4)}`);
  console.log(`Evaluation accuracy: ${(await testAcc.data())[0].toFixed(4)}`);
}
