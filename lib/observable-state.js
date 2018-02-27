"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var createObservableState = function createObservableState(initialState) {
  var state = initialState;
  var listeners = [];

  return {
    subscribe: function subscribe(listener) {
      listeners = [].concat(_toConsumableArray(listeners), [listener]);
      return function () {
        listeners = listeners.filter(function (l) {
          return l !== listener;
        });
      };
    },
    next: function next(nextState) {
      state = _extends({}, state, nextState);
      listeners.forEach(function (listener) {
        return listener(state);
      });
    },
    freeRefs: function freeRefs() {
      state = null;
      listeners = [];
    }
  };
};

exports.default = createObservableState;