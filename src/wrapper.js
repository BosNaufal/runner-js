
/**
 * Extract the argument to be a Object contains function and its argument
 * @param {Array} args Arguments of some method
 * @return {Object} Represent the function and its arguments
 */
function destructureArguments(args) {
  let func = args[0]
  args = Array.prototype.slice.call(args, 1, args.length)
  if (typeof(func) !== 'function') throw new Error("[Genfunction]: First Argument Should Be a Function")
  return { func, args }
}


/**
 * Wrap a function
 * @param {String} method Method name
 * @param {Function} func The Function
 * @param {Array} args all arguments that will be passed to the function
 * @return {Object} The wrapper object to run
 */
function wrapIt(method, func, args) {
  return {
    wrapped: true,
    method,
    func,
    args
  }
};


/**
 * Shortcut to make a call wrapper
 * @return {wrapIt} Represent the object wrapper
 */
export function call()  {
  let { func, args } = destructureArguments(arguments)
  return wrapIt("CALL", func, args)
};


/**
 * Shortcut to make a concurrent wrapper
 * @return {wrapIt} Represent the object wrapper
 */
export function concurrent(array)  {
  return wrapIt("CONCURRENT", array)
};


/**
 * Shortcut to make a race wrapper
 * @return {wrapIt} Represent the object wrapper
 */
export function race(array)  {
  return wrapIt("RACE", array)
};


/**
 * Helper To make a promised delay
 * @return {Promise} The promise to handle delay
 */
export function delay(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}


export default { call, concurrent, race, delay };
