
/**
 * To Check it is a Function or not
 * @param {Function} obj The Function to Check
 * @return {Boolean} The result
 */
function isFunction(func) {
  return typeof(func) === 'function'
}


/**
 * To Check it is a Promise or not
 * @param {Any} appliedFunction The applied Promise function
 * @return {Boolean} The result
 */
function isPromise(appliedFunction) {
  return appliedFunction.then !== undefined
}


/**
 * To Check it is a Generator Function or not
 * @param {Function} func The Function to check
 * @return {Boolean} The result
 */
function isGeneratorFunction(func) {
  return typeof(func.prototype.next) === "function"
}


/**
 * To Check it is an Object or not
 * @param {Object} obj The Object to Check
 * @return {Boolean} The result
 */
function isObject(obj) {
  return typeof(obj) === 'object' && !obj.length
}

/**
 * To Check it is an array or not
 * @param {Array} arr The Array to Check
 * @return {Boolean} The result
 */
function isArray(arr) {
  return typeof(arr) === 'object' && arr.length
}

/**
 * To check wheter the object is filled or not. This will return false if the object has one keys
 * @param {Object} obj The object to check
 * @return {Boolean} The Result
 */
export function objectHasBeenFilled(obj) {
  return Object.keys(obj).length !== 0
}



/**
 * To apply the comment in the iterator scope
 * @param  {Any} appliedFunction the returned value of some function
 * @param  {Function} done the callback after promised applied
 * @param  {Any} scope the variable scope of current Runner
 * @return {Any} Can be callback or run the next iterator
 */
export function doPromise(appliedFunction, done, scope) {
  const { runNext, currentRunningFunction } = scope
  return appliedFunction.then((res) => {
    if (done) return done(res)
    return runNext(currentRunningFunction, res)
  })
}


// Callback Arguments is indicate that current wrapper is promise or array generator function
/**
 * Run Single Iterator of Generator Function. And it should be a wrapper
 * @param {Object} wrapper The wrapper to runNext
 * @param {Function} callback The Callback when the function of wrapper need a callback or just to use it for runGenerator callback itself
 * @param {Object} scope Variable Scope of current Runner
 * @return {Any} It can be runNext, or doPromise, or callback function
 */
export function runGenerator(wrapper, callback, scope) {
  const { Runner, runNext, currentRunningFunction, store } = scope

  let { method, func, args } = wrapper
  if(isFunction(func)) {
    const appliedFunction = func.apply(func, args)

    if(isPromise(appliedFunction)) {
      return doPromise(appliedFunction, callback, scope)
    }

    if(isGeneratorFunction(func)) {
      return Runner(func, store).then((res) => {
        if (callback) return callback(res)
        return runNext(currentRunningFunction, res)
      })
    }

    if (callback) return callback(appliedFunction)
    return runNext(currentRunningFunction, appliedFunction)
  }

};


/**
 * To make a valid response of the current item of runParallel Function iteration
 * @param {Any} param.allResponses It can be an Object or Array represent the current state of all responses
 * @param {Number} param.index Current iteration index
 * @param {Any} param.res Current response that will be stored to the allResponses Object/Array
 * @param {Any} param.key It can be false or string to assign a value to the allResponses Object
 * @param {Object} param.wrapper The Wrapper
 * @return {Any} It can be Array or Object. It represent the new allResponses Object
 */
export function makeAResponse({ allResponses, index, res, key, wrapper }) {
  if (wrapper.type === "concurrent") {
    allResponses.push(res)
    return allResponses
  }
  if (wrapper.type === "race") {
    if (objectHasBeenFilled(allResponses)) return allResponses
    allResponses[key] = res
    return allResponses
  }
  if (key) allResponses[key] = res
  else allResponses.splice(index, 0, res)
  return allResponses
}


/**
 * Before do the runParallel we need to describe the sign when it should be done
 * @param {Array} wrappers The array of wrapper
 * @return {Object} Return done function to stop the runParallel and allResponses intial value
 */
export function getParallelParameter(wrappers) {
  // get one as a sample
  const isArrayObject = wrappers[0].key
  const allResponses = isArrayObject ? {} : []
  const isDone = (wrappers) => {
    if (isArrayObject) {
      return Object.keys(allResponses).length === Object.keys(wrappers).length
    }
    return allResponses.length === wrappers.length
  }
  return { allResponses, isDone }
}


/**
 * Run the all the wrapper function at once
 * @param {Array} wrappers The array of wrapper
 * @param {Object} scope Variable scope of current Runner
 * @return {runNext} To run the next iteration of current Runner
 */
export function runParallel(wrappers, scope) {
  const { runNext, currentRunningFunction } = scope
  let { allResponses, isDone } = getParallelParameter(wrappers)
  const isRace = wrappers[0].type === "race"
  for (var i = 0; i < wrappers.length; i++) {
    const wrapper = wrappers[i]
    const index = i
    const key = wrapper.key || false
    const finish = runGenerator(wrapper, (res) => {
      allResponses = makeAResponse({ allResponses, index, key, res, wrapper })
      if (
        (isDone(wrappers)) ||
        (isRace && objectHasBeenFilled(allResponses))
      ) {
        return runNext(currentRunningFunction, allResponses)
      }
    }, scope)
  }
}

/**
 * Inject The Array of wrapper to have a valid structure
 * @param {Any} wrappers It can be Array of wrapper or object Wrapper
 * @param {String} type Current Type To Inject
 * @return {Array} The new array of wrapper with type on each member
 */
export function setWrapperType(wrappers, type) {
  if (isArray(wrappers)) {
    return wrappers.map((item) => ({ ...item, type }))
  }

  if (isObject(wrappers)) {
    return Object.keys(wrappers).map((key) => {
      const value = wrappers[key]
      return { ...value, type, key }
    })
  }
}


/**
 * Destruct after yield statement and convert it to array of wrapper. We call them "wrappers"
 * @param  {Any} wrapper It can be a wrapper or just ordinary object or array
 * @return {setWrapperType} setWrapperType represent the result of it
 */
export function destructureWrapper(wrapper) {
  const arrayObjectFunction = isObject(wrapper) && !wrapper.method
  if (arrayObjectFunction) return setWrapperType(wrapper)
  if (!wrapper.method) return wrapper
  const { func } = wrapper
  if (wrapper.method === "CONCURRENT") {
    return setWrapperType(func, "concurrent");
  }
  if (wrapper.method === "RACE") {
    return setWrapperType(func, "race");
  }
}


/**
 * The RUNNER! To run the generator function. The Runner will set the variable scope of current running Generator Function
 * @param {Function} genFunc Generator Function that will be runned
 * @param {Object} [store={}] The initial Object to starting generator function
 * @return {Promise} The result will be promise. So we wait the Runner till it done
 */
export default function Runner(genFunc, store = {}) {
  return new Promise((resolve, reject) => {
    let currentRunningFunction = typeof(genFunc) === "function" ? genFunc(store) : genFunc

    /**
     * The Recursive Function to run the next iteration of Current Generator Function
     * @param {Generator} currentRunningFunction Current iterator of generator function
     * @param {Any} [respon=null] The last response or the last value to pass it ot the next iterator
     * @return {Any} It can be Recursively run the runNext, runParallel, runGenerator Function or just resolve the promise
     */
    function runNext(currentRunningFunction, response = null) {
      let nextRun = currentRunningFunction.next(response)
      let wrapper = nextRun.value
      let isDone = nextRun.done

      const scope = { Runner, runNext, currentRunningFunction, store }

      if(!isDone) {
        if (!wrapper) {
          throw new Error('[Redux Runner]: Please wrap the function next to yield statement inside the effects e.g. "call" or "put"')
        }

        let isOrdinaryGenFunc  = isFunction(wrapper.func)
        if(isOrdinaryGenFunc) {
          return runGenerator(wrapper, false, scope)
        } else if(isObject(wrapper) || isArray(wrapper)) {
          const wrappers = destructureWrapper(wrapper)
          return runParallel(wrappers, scope)
        } else {
          return runNext(currentRunningFunction, wrapper)
        }

      } else {
        resolve(nextRun.value)
      }

    }

    return runNext(currentRunningFunction)
  })
};
