import { Mat } from 'mirada';
/**
 *
 * ### Preamble
 * Opencv ```mat``` can be tricky. Opencvjs ```mat``` can be downright demonic. This class is really just a helper/ performance booster
 * that aids in doing operations that would be supported via operator overloading in c++. that is to say, instead of saying
 * ```someMat = anotherMat - 5``` like we would in c++, we use ```cv.substract(anotherMat, 5, someMat)``` to subtract matrices
 * in js. There is a problem though. In js, or at least while using opencvjs, ```cv.substract(anotherMat, 5, someMat)``` causes
 * problems. The ```subtract``` method expects two ```mat``` as arguments, not a ```mat``` and a ```number```. The automatic conversion
 * of the ```number``` into a ```mat``` doesnt seem to be supported. Additionally, the ```scalar``` class does not seem to play nicely
 * with methods that expect ```mat``` either.
 *
 * ### With that being said...
 * This class has one job. To cache matricies that we would represent as a scalar value if we were working with the c++ version of opencv.
 * In other words, if we want to do ```someMat = anotherMat - 5```, we need to replace ```5``` with a ```mat``` that is the same size and
 * type of ```anotherMat```. The observant among those reading this might say "that sounds like a lot of overhead and extra work". Those
 * people would be correct. To mitigate that extra work, we use a ```map``` that relates the "signature" of a ```mat``` with the mat itself.
 * This way, if we want to create a ```mat``` that behaves the same way that the scalar value ```5``` does, we can cache that ```mat``` for
 * future use.
 *
 * ### So whats the point?
 * The use case here is in the normalization process of the disparity map. We need to use ```16``` as a scalar, so we use this
 * class to store a ```mat``` that is the proper size and type for our stereo vision pipeline, filled with the value ```16```. That way,
 * we do not need to laborously create that object in memory every time the pipeline runs.
 */
export default class ScalarMatMap {
  constructor() {
    this.matMap = {};
  }
  /**
   * this is a private method, please call getMat instead
   * @param {string} key
   * @param {number} rows
   * @param {number} cols
   * @param {number} val
   * @param {number} t
   * @returns {Mat}
   */
  _addMat(key, rows, cols, val, t) {
    this.matMap[key] = cv.matFromArray(
      rows,
      cols,
      t,
      new Array(rows * cols).fill(val)
    );
    return this.matMap[key];
  }
  /**
   * use this to generate/ retreive a Mat filled with a scalar value
   * useful for add, sub, mul, div
   * @param {Size} size - size object of the mat
   * @param {number} val - value of each el in the mat
   * @param {number} t - type of the mat
   * @returns {Mat}
   */
  getMat(size, val, t) {
    let key = `${size.height}_${size.width}_${val}_${t}`;
    return this.matMap[key]
      ? this.matMap[key]
      : this._addMat(key, size.height, size.width, val, t);
  }
}
