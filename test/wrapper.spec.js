import 'babel-polyfill'
import assert from 'assert'
import chai, { expect } from 'chai';

import { call, delay } from '../src/index';

describe('Main Effect', () => {

  it('Should has a correct shape', function () {
    function *genFunc () { }
    let actual = call(genFunc)
    let expectation = {
      wrapped: true,
      method: "CALL",
      func: genFunc,
      args: [],
    }
    expect(actual).to.be.an('object')
    expect(actual).to.be.deep.equal(expectation)
  });


  it('Arguments Should Passed To The Its Function', function () {
    let actual = call(() => {}, "a")
    expect(actual.args).to.be.an('array')
    expect(actual.args[0]).to.be.equal("a")
  });


  it('Steps should be expected', function () {
    function *genFunc () {
      let respon = yield call(delay, 1000)
    }
    let iter = genFunc()
    let fakeRespon = {}
    let expectedCall = call(delay, 1000)
    assert.deepEqual(iter.next().value, expectedCall)
  });


  it('Parallel step should be expected', function () {
    function *genFunc () {
      yield [call(delay, 1000), call(delay,2000)]
    }
    let iter = genFunc()
    let expected = [call(delay, 1000), call(delay,2000)]
    assert.deepEqual(iter.next().value, expected)
  });

});
