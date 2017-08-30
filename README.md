# Runner Js

Better Async Handler To Simplify Your Async Flow Process And Code Testing. It's inspired by  [redux-saga](https://github.com/redux-saga/redux-saga) but it is just a generator function runner.


## Installation
You can import [runner.js](./dist/runner.js) then process it with your preprocessor.

You can install it via NPM
```bash
npm install runner-js
```

## Dependencies
You need to install babel-polyfill and babel regenerator plugin and put it in the first line of your main entry file to make it works. You can check the example [here](./examples/main.js).
```bash
npm install babel-polyfill babel-plugin-transform-regenerator
```

And Don't forget to add the plugin to your [`.babelrc`](./.babelrc)
```json
{
  "plugins": ["transform-regenerator"]
}
```

## Why I Need This?
Probably you don't need it. But in some cases you'll find a busy async process that you'll hard to organize with ordinary Promise function. For example:

```javascript
import api from '../api'

// Variable for saving the responses
let product, seller, statistic;

api.fetchProduct()
.then((res) => {
  product = res
  return api.fetchSeller(product.id)
})
.then((res) => {
  seller = res
  return api.statistic(product, seller)
})
.then((res) => {
  statistic = res
  return api.needStatisticProductAndSeller(statistic, product, seller)
})
```

Or you can skip the `let` declaration

```javascript
// source: https://codepen.io/aurelien-bottazini/pen/VPQLBp?editors=0011

const api = {
  fetchProduct() { return Promise.resolve({ id: 'productId'}) },
  fetchSeller(id) { return Promise.resolve('seller') },
  statistic(product, seller) { return  Promise.resolve('stats') },
  needStatisticProductAndSeller(statistic, product, seller) {
    return Promise.resolve('finalResult')
  },
};

api.fetchProduct()
  .then((product) => api.fetchSeller(product.id)
  .then((seller) => ({ product, seller })))
  .then(({ product, seller }) => api.statistic(product, seller)
  .then((statistic) => ({ product, seller, statistic })))
  .then(({ product, seller, statistic }) =>  api.needStatisticProductAndSeller(statistic, product, seller))
  .then(console.log);
```

The solution is pretty simple, You can use [async/await](https://ponyfoo.com/articles/understanding-javascript-async-await).

```javascript
// source: https://forum.vuejs.org/t/let-s-write-better-vuex-action-with-runner/5527/2

import api from '../api'

async function do () {
  const product = await api.fetchProduct()
  const seller = await api.fetchSeller(product.id)
  const statistic = await api.statistic(product, seller)
  const res = await api.needStatisticProductAndSeller(statistic , product, seller)
  // ...
}
```
You could use aync/await which are compatible with Promises. You can easily do that with Babel or natively in Chrome and Opera. Firefox and Edge support is coming in their next versions (FX 52, Edge 15). But another point that you should notice is **"How can you test it Effortlessly?"**. For now, I have no idea to test async/await function. But, with runner js and Generator function you don't need to run the real request or function in the test section. You just need make a simple expectation effortlessly.


## How about Runner JS?
According to our cases above, we can simplify that code with [`Generator Function`](). It will make our async code looks like synchronous code. Take a look:
```javascript
import Runner, { call } from 'runner-js'
import api from '../api'

function *fetchFlow() {
  let product = yield call(api.fetchProduct)
  let seller = yield call(api.fetchSeller, { product })
  let statistic = yield call(api.statistic, { product, seller })
  let lastFetch = yield call(api.needStatisticProductAndSeller, { statistic, product, seller })
  return lastFetch
}

Runner(fetchFlow)
```

Pretty simple right? It works like async/await function. But You'll get a better testing process although your testing a deep promise function. Take a peek:
```javascript
import { call } from 'runner-js'
import api from '../api'
import { fetchFlow } from '../actions';
import assert from 'assert';

describe('fetchFlow()', function () {

  it('Should Run The Flow Correctly ', function () {
    let process = fetchFlow()

    let fakeRespon = {}

    assert.deepEqual(process.next().value, call(api.fetchProduct))
    assert.deepEqual(process.next(fakeRespon).value, call(api.fetchSeller, { fakeRespon }))
    assert.deepEqual(process.next(fakeRespon).value, call(api.statistic, { fakeRespon }))
    assert.deepEqual(process.next(fakeRespon).value, call(api.needStatisticProductAndSeller, { fakeRespon }))
  });

});
```

Wait? Are you sure it's a valid testing process? I'm not sure yet. But It works. You don't need to mock the promises, You don't need run the real fetch function in the browser, It just works. Let me tell you how `call()` function works.

`call()` function is just an ordinary function that return a plain object contains our real function, I call it wrapper. So, the generator only pass the **plain object** while the runner excute the function from the object. Since we don't use the runner, we can test our code like the example above, Just need to deep compare two object.


## How About Nested Generator Function?
It's just the same, you can wrap it with `call()` function.
```javascript
import Runner, { call, delay } from 'runner-js'
import api from '../api'

function *nestedGenFunc() {
  yield call(delay, 1000)
  return 1000
}

function *fetchFlow() {
  let nested = yield call(nestedGenFunc)
}

Runner(fetchFlow)
```


## Is it take care some parallel async process?
Yes, it should. Just wrap it within an array! Check it out.

```javascript
import Runner, { call } from 'runner-js'
import api from '../api'

function *fetchFlow() {
  let responses = yield [
    call(api.fetchProduct),
    call(api.otherApis)
  ]
  responses[0] // it will always the fetchProduct response
  responses[1] // it will always the otherApis response
}

Runner(fetchFlow)
```

Or you can identity your call with making a parallel call within an object.

```javascript
import Runner, { call } from 'runner-js'
import api from '../api'

function *fetchFlow() {
  let allRes = yield {
    product: call(api.fetchProduct),
    other: call(api.otherApis)
  }
  const productRes = allRes.product
  const otherRes = allRes.other
}

Runner(fetchFlow)
```

## It cares with concurrentcy
Parallel call will make the every response has same index with the each its call wrapper. While the `concurrent` wrapper will push responses which recieved faster.
```javascript
import Runner, { call, concurrent } from 'runner-js'
import api from '../api'

function *fetchFlow() {
  let responses = yield concurrent([
    call(api.fetchProduct),
    call(api.otherApis)
  ])
  responses[0] // it can be fetchProduct response or otherApis response. Depend on which is faster
}

Runner(fetchFlow)
```

## Need some race?
Runner has a race wrapper to make a race between an async progress. It only store one response which is fastest.
```javascript
import Runner, { call, race } from 'runner-js'
import api from '../api'

function *fetchFlow() {
  let responses = yield race({
    product: call(api.fetchProduct),
    other: call(api.otherApis)
  })
  if (responses.product) {
    console.log('the winner is fetchProduct');
  } else {
    console.log("The winner is otherApis");
  }
}

Runner(fetchFlow)
```

So now, you can test the flow and the fetch process separately. It will make your code easy to test. No more reason to not doing a test.


## API
| Method | Format | Description |
| :--- | :--- | :--- |
| **call()** | `call(func, [argument1, [argument2, [argument3, ...]]])` | It's used to call some function. For best practice you should have your function to be a promise. And the rest arguments is the arguments that will be passed to the function. |
| **delay()** | `delay(number)` | It's just a simple method to delay some function inside the saga. Maybe, It will not used cause I made it just for making a fake async proccess |
| **concurrent()** | `concurrent(Array of call Function)` | It's used to make a concurrentcy async function. it only take the first argument which is an Array of `call()` function |
| **race()** | `race(Object of call Function)` | It's used to make a race between some async function. it only take the first argument which is an Object of `call()` function |


## Credits
- [Redux Saga](redux-saga.github.io/redux-saga/)
- [gen-run](https://github.com/creationix/gen-run)
- [http://www.2ality.com/2015/03/es6-generators.html](http://www.2ality.com/2015/03/es6-generators.html)
- [https://davidwalsh.name/es6-generators](https://davidwalsh.name/es6-generators)
- [http://thejsguy.com/2016/10/15/a-practical-introduction-to-es6-generator-functions.html](http://thejsguy.com/2016/10/15/a-practical-introduction-to-es6-generator-functions.html)
- [http://www.2ality.com/2015/03/no-promises.html](http://www.2ality.com/2015/03/no-promises.html)



## Thank You for Making this useful~


## Let's talk about some projects with me
Just Contact Me At:
- Email: [bosnaufalemail@gmail.com](mailto:bosnaufalemail@gmail.com)
- Skype Id: bosnaufal254
- twitter: [@BosNaufal](https://twitter.com/BosNaufal)


## License
[MIT](http://opensource.org/licenses/MIT)
Copyright (c) Naufal Rabbani
