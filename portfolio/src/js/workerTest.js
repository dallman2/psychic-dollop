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
let slices = {
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
};

onmessage = function (event) {
  switch (event.data[0]) {
    case codes.LOAD_DATA: {
      createTensor();
      break;
    }
    case codes.GET_SCATTERPLOT_DATA: {
      postScatterplotData();
      break;
    }
  }
  console.log(event);
};

const filterGameToOneFeature = (game, idx) => game.map((play) => [play[idx]]);

function createTensor() {
  godTensor = tf.tensor(ds.data, [ds.data.length, 204, 8], 'int32');
  godTensor.print();

  Object.entries(slices).forEach((entry, idx) => {
    slices[entry[0]] = tf.tensor(
      ds.data.map((game) => filterGameToOneFeature(game, idx)),
      [ds.data.length, 204, 1],
      'int32'
    );
  });

  console.log(slices);
  postMessage([codes.TENSOR_LOADED]);
}

function postScatterplotData() {

  postMessage([codes.SCATTERPLOT_DATA_RESP, slices.quarter.bufferSync().values])
}
