'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _hoistNonReactStatics = require('hoist-non-react-statics');

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _observableState = require('./observable-state');

var _observableState2 = _interopRequireDefault(_observableState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @typedef MutationStateOptions
 * @type {object}
 * @property {string} mutationName - The name of the method "mutate" from the graphql hoc
 * @property {string} propName - The name of the prop that will be used to pass the mutation state object
 * @property {boolean} propagateError - Define if the hoc should propagate the mutation error. The hoc still change to state to "error" even if propagate error is false
 * @property {boolean} wrapper - Define if the hoc is beign used as a wrapper. If yes, then it will pass a method "wrap" so you can wrap the "mutate" call
 * @property {string} wrapName - Define the name of the "wrap" method. The wrap method is only passed if wrapper is true 
 */

/**
 * A hoc for track a mutation state. There should be one hoc for each mutation. 
 * If using two graphql hocs with two mutations, then there should be 2 hocs for tracking their state
 * @param {MutationStateOptions} options - Mutation state options 
 */
exports.default = function () {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$mutationName = _ref.mutationName,
      mutationName = _ref$mutationName === undefined ? 'mutate' : _ref$mutationName,
      _ref$propName = _ref.propName,
      propName = _ref$propName === undefined ? 'mutation' : _ref$propName,
      _ref$propagateError = _ref.propagateError,
      propagateError = _ref$propagateError === undefined ? false : _ref$propagateError,
      _ref$wrapper = _ref.wrapper,
      wrapper = _ref$wrapper === undefined ? false : _ref$wrapper,
      _ref$wrapName = _ref.wrapName,
      wrapName = _ref$wrapName === undefined ? 'wrapMutate' : _ref$wrapName;

  return function (WrappedComponent) {
    var MutationState = function (_PureComponent) {
      _inherits(MutationState, _PureComponent);

      function MutationState(props) {
        _classCallCheck(this, MutationState);

        var _this = _possibleConstructorReturn(this, (MutationState.__proto__ || Object.getPrototypeOf(MutationState)).call(this, props));

        _this.onStateChange = function (nextState) {
          _this.setState(nextState);
        };

        _this.setMutationState = function (newState) {
          _this.observableState.next(newState);
        };

        _this.wrapMutate = function (mutatePromise) {
          _this.setMutationState({
            loading: true,
            error: null,
            success: false
          });
          return mutatePromise.then(function (response) {
            _this.setMutationState({
              success: true,
              loading: false,
              response: response
            });
            return response;
          }).catch(function (error) {
            _this.setMutationState({
              loading: false,
              error: error
            });
            if (propagateError) {
              return Promise.reject(error);
            }
          });
        };

        _this.mutate = function (mutateOptions) {
          var mutate = _this.props[mutationName];
          if (!mutate) {
            throw new Error('MutationState must be inside a component with a mutate prop');
          }
          return _this.wrapMutate(mutate(mutateOptions));
        };

        _this.clearState = function () {
          _this.setMutationState({
            loading: false,
            error: null,
            success: false
          });
        };

        _this.state = {
          loading: false,
          error: null,
          success: false
        };
        _this.observableState = (0, _observableState2.default)(_this.state);
        return _this;
      }

      _createClass(MutationState, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          this.unsubscribe = this.observableState.subscribe(this.onStateChange);
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.unsubscribe();
        }
      }, {
        key: 'render',
        value: function render() {
          var props = _extends({}, this.props);
          if (wrapper) {
            props[wrapName] = this.wrapMutate;
          } else {
            props[mutationName] = this.mutate;
          }
          props[propName] = _extends({}, this.state, {
            clearState: this.clearState
          });
          return _react2.default.createElement(WrappedComponent, props);
        }
      }]);

      return MutationState;
    }(_react.PureComponent);

    (0, _hoistNonReactStatics2.default)(MutationState, WrappedComponent);
    return MutationState;
  };
};