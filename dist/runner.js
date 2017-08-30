/*!
 * Copyright (c) Naufal Rabbani (http://github.com/BosNaufal)
 * Licensed Under MIT (http://opensource.org/licenses/MIT)
 * 
 * Runner JS @ Version 0.0.2
 * 
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Runner"] = factory();
	else
		root["Runner"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "../dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.race = exports.concurrent = exports.delay = exports.call = exports.Runner = undefined;

	var _wrapper = __webpack_require__(1);

	var _Runner = __webpack_require__(2);

	var _Runner2 = _interopRequireDefault(_Runner);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.Runner = _Runner2.default;
	exports.call = _wrapper.call;
	exports.delay = _wrapper.delay;
	exports.concurrent = _wrapper.concurrent;
	exports.race = _wrapper.race;
	exports.default = _Runner2.default;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.call = call;
	exports.concurrent = concurrent;
	exports.race = race;
	exports.delay = delay;

	/**
	 * Extract the argument to be a Object contains function and its argument
	 * @param {Array} args Arguments of some method
	 * @return {Object} Represent the function and its arguments
	 */
	function destructureArguments(args) {
	  var func = args[0];
	  args = Array.prototype.slice.call(args, 1, args.length);
	  if (typeof func !== 'function') throw new Error("[Genfunction]: First Argument Should Be a Function");
	  return { func: func, args: args };
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
	    method: method,
	    func: func,
	    args: args
	  };
	};

	/**
	 * Shortcut to make a call wrapper
	 * @return {wrapIt} Represent the object wrapper
	 */
	function call() {
	  var _destructureArguments = destructureArguments(arguments),
	      func = _destructureArguments.func,
	      args = _destructureArguments.args;

	  return wrapIt("CALL", func, args);
	};

	/**
	 * Shortcut to make a concurrent wrapper
	 * @return {wrapIt} Represent the object wrapper
	 */
	function concurrent(array) {
	  return wrapIt("CONCURRENT", array);
	};

	/**
	 * Shortcut to make a race wrapper
	 * @return {wrapIt} Represent the object wrapper
	 */
	function race(array) {
	  return wrapIt("RACE", array);
	};

	/**
	 * Helper To make a promised delay
	 * @return {Promise} The promise to handle delay
	 */
	function delay(time) {
	  return new Promise(function (resolve, reject) {
	    setTimeout(function () {
	      resolve(true);
	    }, time);
	  });
	}

	exports.default = { call: call, concurrent: concurrent, race: race, delay: delay };

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	exports.objectHasBeenFilled = objectHasBeenFilled;
	exports.doPromise = doPromise;
	exports.runGenerator = runGenerator;
	exports.makeAResponse = makeAResponse;
	exports.getParallelParameter = getParallelParameter;
	exports.runParallel = runParallel;
	exports.setWrapperType = setWrapperType;
	exports.destructureWrapper = destructureWrapper;
	exports.default = Runner;

	/**
	 * To Check it is a Function or not
	 * @param {Function} obj The Function to Check
	 * @return {Boolean} The result
	 */
	function isFunction(func) {
	  return typeof func === 'function';
	}

	/**
	 * To Check it is a Promise or not
	 * @param {Any} appliedFunction The applied Promise function
	 * @return {Boolean} The result
	 */
	function isPromise(appliedFunction) {
	  return appliedFunction.then !== undefined;
	}

	/**
	 * To Check it is a Generator Function or not
	 * @param {Function} func The Function to check
	 * @return {Boolean} The result
	 */
	function isGeneratorFunction(func) {
	  return typeof func.prototype.next === "function";
	}

	/**
	 * To Check it is an Object or not
	 * @param {Object} obj The Object to Check
	 * @return {Boolean} The result
	 */
	function isObject(obj) {
	  return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && !obj.length;
	}

	/**
	 * To Check it is an array or not
	 * @param {Array} arr The Array to Check
	 * @return {Boolean} The result
	 */
	function isArray(arr) {
	  return (typeof arr === 'undefined' ? 'undefined' : _typeof(arr)) === 'object' && arr.length;
	}

	/**
	 * To check wheter the object is filled or not. This will return false if the object has one keys
	 * @param {Object} obj The object to check
	 * @return {Boolean} The Result
	 */
	function objectHasBeenFilled(obj) {
	  return Object.keys(obj).length !== 0;
	}

	/**
	 * To apply the comment in the iterator scope
	 * @param  {Any} appliedFunction the returned value of some function
	 * @param  {Function} done the callback after promised applied
	 * @param  {Any} scope the variable scope of current Runner
	 * @return {Any} Can be callback or run the next iterator
	 */
	function doPromise(appliedFunction, done, scope) {
	  var runNext = scope.runNext,
	      currentRunningFunction = scope.currentRunningFunction;

	  return appliedFunction.then(function (res) {
	    if (done) return done(res);
	    return runNext(currentRunningFunction, res);
	  });
	}

	// Callback Arguments is indicate that current wrapper is promise or array generator function
	/**
	 * Run Single Iterator of Generator Function. And it should be a wrapper
	 * @param {Object} wrapper The wrapper to runNext
	 * @param {Function} callback The Callback when the function of wrapper need a callback or just to use it for runGenerator callback itself
	 * @param {Object} scope Variable Scope of current Runner
	 * @return {Any} It can be runNext, or doPromise, or callback function
	 */
	function runGenerator(wrapper, callback, scope) {
	  var Runner = scope.Runner,
	      runNext = scope.runNext,
	      currentRunningFunction = scope.currentRunningFunction,
	      store = scope.store;
	  var method = wrapper.method,
	      func = wrapper.func,
	      args = wrapper.args;

	  if (isFunction(func)) {
	    var appliedFunction = func.apply(func, args);

	    if (isPromise(appliedFunction)) {
	      return doPromise(appliedFunction, callback, scope);
	    }

	    if (isGeneratorFunction(func)) {
	      return Runner(func, store).then(function (res) {
	        if (callback) return callback(res);
	        return runNext(currentRunningFunction, res);
	      });
	    }

	    if (callback) return callback(appliedFunction);
	    return runNext(currentRunningFunction, appliedFunction);
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
	function makeAResponse(_ref) {
	  var allResponses = _ref.allResponses,
	      index = _ref.index,
	      res = _ref.res,
	      key = _ref.key,
	      wrapper = _ref.wrapper;

	  if (wrapper.type === "concurrent") {
	    allResponses.push(res);
	    return allResponses;
	  }
	  if (wrapper.type === "race") {
	    if (objectHasBeenFilled(allResponses)) return allResponses;
	    allResponses[key] = res;
	    return allResponses;
	  }
	  if (key) allResponses[key] = res;else allResponses.splice(index, 0, res);
	  return allResponses;
	}

	/**
	 * Before do the runParallel we need to describe the sign when it should be done
	 * @param {Array} wrappers The array of wrapper
	 * @return {Object} Return done function to stop the runParallel and allResponses intial value
	 */
	function getParallelParameter(wrappers) {
	  // get one as a sample
	  var isArrayObject = wrappers[0].key;
	  var allResponses = isArrayObject ? {} : [];
	  var isDone = function isDone(wrappers) {
	    if (isArrayObject) {
	      return Object.keys(allResponses).length === Object.keys(wrappers).length;
	    }
	    return allResponses.length === wrappers.length;
	  };
	  return { allResponses: allResponses, isDone: isDone };
	}

	/**
	 * Run the all the wrapper function at once
	 * @param {Array} wrappers The array of wrapper
	 * @param {Object} scope Variable scope of current Runner
	 * @return {runNext} To run the next iteration of current Runner
	 */
	function runParallel(wrappers, scope) {
	  var runNext = scope.runNext,
	      currentRunningFunction = scope.currentRunningFunction;

	  var _getParallelParameter = getParallelParameter(wrappers),
	      allResponses = _getParallelParameter.allResponses,
	      isDone = _getParallelParameter.isDone;

	  var isRace = wrappers[0].type === "race";

	  var _loop = function _loop() {
	    var wrapper = wrappers[i];
	    var index = i;
	    var key = wrapper.key || false;
	    var finish = runGenerator(wrapper, function (res) {
	      allResponses = makeAResponse({ allResponses: allResponses, index: index, key: key, res: res, wrapper: wrapper });
	      if (isDone(wrappers) || isRace && objectHasBeenFilled(allResponses)) {
	        return runNext(currentRunningFunction, allResponses);
	      }
	    }, scope);
	  };

	  for (var i = 0; i < wrappers.length; i++) {
	    _loop();
	  }
	}

	/**
	 * Inject The Array of wrapper to have a valid structure
	 * @param {Any} wrappers It can be Array of wrapper or object Wrapper
	 * @param {String} type Current Type To Inject
	 * @return {Array} The new array of wrapper with type on each member
	 */
	function setWrapperType(wrappers, type) {
	  if (isArray(wrappers)) {
	    return wrappers.map(function (item) {
	      return _extends({}, item, { type: type });
	    });
	  }

	  if (isObject(wrappers)) {
	    return Object.keys(wrappers).map(function (key) {
	      var value = wrappers[key];
	      return _extends({}, value, { type: type, key: key });
	    });
	  }
	}

	/**
	 * Destruct after yield statement and convert it to array of wrapper. We call them "wrappers"
	 * @param  {Any} wrapper It can be a wrapper or just ordinary object or array
	 * @return {setWrapperType} setWrapperType represent the result of it
	 */
	function destructureWrapper(wrapper) {
	  var arrayObjectFunction = isObject(wrapper) && !wrapper.method;
	  if (arrayObjectFunction) return setWrapperType(wrapper);
	  if (!wrapper.method) return wrapper;
	  var func = wrapper.func;

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
	function Runner(genFunc) {
	  var store = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	  return new Promise(function (resolve, reject) {
	    var currentRunningFunction = typeof genFunc === "function" ? genFunc(store) : genFunc;

	    /**
	     * The Recursive Function to run the next iteration of Current Generator Function
	     * @param {Generator} currentRunningFunction Current iterator of generator function
	     * @param {Any} [respon=null] The last response or the last value to pass it ot the next iterator
	     * @return {Any} It can be Recursively run the runNext, runParallel, runGenerator Function or just resolve the promise
	     */
	    function runNext(currentRunningFunction) {
	      var response = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	      var nextRun = currentRunningFunction.next(response);
	      var wrapper = nextRun.value;
	      var isDone = nextRun.done;

	      var scope = { Runner: Runner, runNext: runNext, currentRunningFunction: currentRunningFunction, store: store };

	      if (!isDone) {
	        if (!wrapper) {
	          throw new Error('[Redux Runner]: Please wrap the function next to yield statement inside the effects e.g. "call" or "put"');
	        }

	        var isOrdinaryGenFunc = isFunction(wrapper.func);
	        if (isOrdinaryGenFunc) {
	          return runGenerator(wrapper, false, scope);
	        } else if (isObject(wrapper) || isArray(wrapper)) {
	          var wrappers = destructureWrapper(wrapper);
	          return runParallel(wrappers, scope);
	        } else {
	          return runNext(currentRunningFunction, wrapper);
	        }
	      } else {
	        resolve(nextRun.value);
	      }
	    }

	    return runNext(currentRunningFunction);
	  });
	};

/***/ })
/******/ ])
});
;