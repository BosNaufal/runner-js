
// For now, Please Open the console when you want to test with karma...

import 'babel-polyfill'
import assert from 'assert'
import chai, { expect } from 'chai';

import { runner, call, concurrent, race } from '../src/index';

describe('runner()', () => {

    let async1 = (time) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("Promise 1")
        }, time)
      })
    }

    let async2 = (time) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("Promise 2")
        }, time)
      })
    }

    it('Should can be runned Async', function () {
      function *genFunc (store) {
        let a = yield [call(async1, 100), call(async2, 200)]
        expect(a).to.be.an("array")
        expect(a).to.have.lengthOf(2)

        let b = yield call(async2, 300)
        expect(b).to.be.an("string")
        expect(b).to.be.equal("Promise 2")
      }
      runner(genFunc)
    });


    it('Should Can Run Normal Generator Function', function () {
      function *foo(store) {
        let a = yield 1;
        expect(a).to.be.equal(1)

        let b = yield 2;
        expect(b).to.be.equal(2)

        let c = yield 3;
        expect(c).to.be.equal(3)
      }

      function *bar(store) {
        var y = yield 1;
        expect(y).to.be.equal(1)

        var z = yield 2;
        expect(z).to.be.equal(2)
      }

      runner(foo)
      runner(bar)
    });


    it('Should Can Run Nested Generator Function', function () {
      function ordinary () {
        return "ordinary"
      }

      function *generator(store) {
        let a = yield "aaaa";
        expect(a).to.be.equal("aaaa")

        let b = yield 2;
        expect(b).to.be.equal(2)

        let c = yield "String 3";
        expect(c).to.be.equal("String 3")

        let d = yield 4;
        expect(d).to.be.equal(4)

        return "Generator"
      }

      function *parallel(store) {
        var a = yield call(ordinary)
        var y = yield [
          call(generator),
          call(ordinary),
          call(generator),
          call(async2),
          call(ordinary),
          call(generator),
          call(async2),
        ];
        return [a, y]
      }

      function *parallelObject(store) {
        var y = yield {
          generator: call(generator),
          ordinary: call(ordinary),
          async: call(async2),
        }
        return y
      }

      function *concurrentTask(store) {
        var y = yield concurrent([
          call(generator),
          call(ordinary),
          call(generator),
          call(async2),
          call(ordinary),
          call(generator),
          call(async2),
        ]);
        return y
      }

      function *raceTask(store) {
        var y = yield race({
          generator: call(generator),
          ordinary: call(ordinary),
          async: call(async2),
        })
        return y
      }

      runner(parallel).then(([a, y]) => {
        console.log(a, y);
      })

      runner(parallelObject).then((res) => {
        console.log(res);
      })

      runner(concurrentTask).then((res) => {
        console.log(res);
      })

      runner(raceTask).then((res) => {
        console.log(res);
      })
    });


});
