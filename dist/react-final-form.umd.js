;(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports, require('react'), require('final-form'))
    : typeof define === 'function' && define.amd
    ? define(['exports', 'react', 'final-form'], factory)
    : ((global = global || self),
      factory(
        (global['react-final-form'] = {}),
        global.React,
        global.FinalForm
      ))
})(this, function(exports, React, finalForm) {
  'use strict'

  function _extends() {
    _extends =
      Object.assign ||
      function(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i]

          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key]
            }
          }
        }

        return target
      }

    return _extends.apply(this, arguments)
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {}
    var target = {}
    var sourceKeys = Object.keys(source)
    var key, i

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i]
      if (excluded.indexOf(key) >= 0) continue
      target[key] = source[key]
    }

    return target
  }

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype)
    subClass.prototype.constructor = subClass
    subClass.__proto__ = superClass
  }

  //
  function diffSubscription(a, b, keys) {
    if (a) {
      if (b) {
        // $FlowFixMe
        return keys.some(function(key) {
          return a[key] !== b[key]
        })
      } else {
        return true
      }
    } else {
      return !!b
    }
  }

  // children render function, or component prop

  function renderComponent(props, name) {
    var render = props.render,
      children = props.children,
      component = props.component,
      rest = _objectWithoutPropertiesLoose(props, [
        'render',
        'children',
        'component'
      ])

    if (component) {
      return React.createElement(
        component,
        _extends({}, rest, {
          children: children,
          render: render
        })
      )
    }

    if (render) {
      return render(
        _extends({}, rest, {
          children: children
        })
      ) // inject children back in
    }

    if (typeof children !== 'function') {
      // istanbul ignore next
      {
        console.error(
          'Warning: Must specify either a render prop, a render function as children, or a component prop to ' +
            name
        )
      }

      return null // warning will alert developer to their mistake
    }

    return children(rest)
  }

  //
  var isReactNative =
    typeof window !== 'undefined' &&
    window.navigator &&
    window.navigator.product &&
    window.navigator.product === 'ReactNative'

  //
  var getSelectedValues = function getSelectedValues(options) {
    var result = []

    if (options) {
      for (var index = 0; index < options.length; index++) {
        var option = options[index]

        if (option.selected) {
          result.push(option.value)
        }
      }
    }

    return result
  }

  var getValue = function getValue(
    event,
    currentValue,
    valueProp,
    isReactNative
  ) {
    if (
      !isReactNative &&
      event.nativeEvent &&
      event.nativeEvent.text !== undefined
    ) {
      return event.nativeEvent.text
    }

    if (isReactNative && event.nativeEvent) {
      return event.nativeEvent.text
    }

    var detypedEvent = event
    var _detypedEvent$target = detypedEvent.target,
      type = _detypedEvent$target.type,
      value = _detypedEvent$target.value,
      checked = _detypedEvent$target.checked

    switch (type) {
      case 'checkbox':
        if (valueProp !== undefined) {
          // we are maintaining an array, not just a boolean
          if (checked) {
            // add value to current array value
            return Array.isArray(currentValue)
              ? currentValue.concat(valueProp)
              : [valueProp]
          } else {
            // remove value from current array value
            if (!Array.isArray(currentValue)) {
              return currentValue
            }

            var index = currentValue.indexOf(valueProp)

            if (index < 0) {
              return currentValue
            } else {
              return currentValue
                .slice(0, index)
                .concat(currentValue.slice(index + 1))
            }
          }
        } else {
          // it's just a boolean
          return !!checked
        }

      case 'select-multiple':
        return getSelectedValues(event.target.options)

      default:
        return value
    }
  }

  var ReactFinalFormContext = React.createContext(null)
  var getDisplayName = function getDisplayName(Component) {
    var displayName = Component.displayName || Component.name || 'Component'
    return 'ReactFinalForm(' + displayName + ')'
  }
  var withReactFinalForm = function withReactFinalForm(Component) {
    var _class, _temp

    return (
      (_temp = _class =
        /*#__PURE__*/
        (function(_React$Component) {
          _inheritsLoose(_class, _React$Component)

          function _class() {
            return _React$Component.apply(this, arguments) || this
          }

          var _proto = _class.prototype

          _proto.render = function render() {
            var _this = this

            return React.createElement(ReactFinalFormContext.Consumer, {
              children: function children(reactFinalForm) {
                return React.createElement(
                  Component,
                  _extends(
                    {
                      reactFinalForm: reactFinalForm
                    },
                    _this.props
                  )
                )
              }
            })
          }

          return _class
        })(React.Component)),
      (_class.displayName = getDisplayName(Component)),
      _temp
    )
  }

  var all = finalForm.fieldSubscriptionItems.reduce(function(result, key) {
    result[key] = true
    return result
  }, {})

  var Field =
    /*#__PURE__*/
    (function(_React$Component) {
      _inheritsLoose(Field, _React$Component)

      function Field(_props) {
        var _this

        _this = _React$Component.call(this, _props) || this

        _this.subscribe = function(_ref, listener) {
          var defaultValue = _ref.defaultValue,
            initialValue = _ref.initialValue,
            isEqual = _ref.isEqual,
            name = _ref.name,
            subscription = _ref.subscription,
            validateFields = _ref.validateFields
          _this.unsubscribe = _this.props.reactFinalForm.registerField(
            name,
            listener,
            subscription || all,
            {
              defaultValue: defaultValue,
              getValidator: function getValidator() {
                return _this.props.validate
              },
              initialValue: initialValue,
              isEqual: isEqual,
              validateFields: validateFields
            }
          )
        }

        _this.notify = function(state) {
          return _this.setState({
            state: state
          })
        }

        _this.handlers = {
          onBlur: function onBlur(event) {
            var state = _this.state.state // this is to appease the Flow gods
            // istanbul ignore next

            if (state) {
              var _this$props = _this.props,
                format = _this$props.format,
                formatOnBlur = _this$props.formatOnBlur
              state.blur()

              if (format && formatOnBlur) {
                state.change(format(state.value, state.name))
              }
            }
          },
          onChange: function onChange(event) {
            var _this$props2 = _this.props,
              parse = _this$props2.parse,
              _value = _this$props2.value // istanbul ignore next

            if (event && event.target) {
              var targetType = event.target.type
              var props = _this.props
              var unknown =
                ~['checkbox', 'radio', 'select-multiple'].indexOf(targetType) &&
                !props.type
              var type =
                targetType === 'select-multiple' ? 'select' : targetType

              var _ref2 =
                  targetType === 'select-multiple'
                    ? _this.state.state || {}
                    : props,
                _value2 = _ref2.value

              if (unknown) {
                console.error(
                  'Warning: You must pass `type="' +
                    type +
                    '"` prop to your Field(' +
                    props.name +
                    ') component.\n' +
                    ("Without it we don't know how to unpack your `value` prop - " +
                      (Array.isArray(_value2)
                        ? '[' + _value2 + ']'
                        : '"' + _value2 + '"') +
                      '.')
                )
              }
            }

            var value =
              event && event.target
                ? getValue(
                    event,
                    _this.state.state && _this.state.state.value,
                    _value,
                    isReactNative
                  )
                : event
            _this.state.state &&
              _this.state.state.change(
                parse ? parse(value, _this.props.name) : value
              )
          },
          onFocus: function onFocus(event) {
            _this.state.state && _this.state.state.focus()
          }
        }
        var initialState // istanbul ignore next

        if (!_this.props.reactFinalForm) {
          console.error(
            'Warning: Field must be used inside of a ReactFinalForm component'
          )
        }

        if (_this.props.reactFinalForm) {
          // avoid error, warning will alert developer to their mistake
          _this.subscribe(_props, function(state) {
            if (initialState) {
              _this.notify(state)
            } else {
              initialState = state
            }
          })
        }

        _this.state = {
          state: initialState
        }
        return _this
      }

      var _proto = Field.prototype

      _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
        var _this$props3 = this.props,
          name = _this$props3.name,
          subscription = _this$props3.subscription

        if (
          prevProps.name !== name ||
          diffSubscription(
            prevProps.subscription,
            subscription,
            finalForm.fieldSubscriptionItems
          )
        ) {
          if (this.props.reactFinalForm) {
            // avoid error, warning will alert developer to their mistake
            this.unsubscribe()
            this.subscribe(this.props, this.notify)
          }
        }
      }

      _proto.componentWillUnmount = function componentWillUnmount() {
        this.unsubscribe()
      }

      _proto.render = function render() {
        var _this$props4 = this.props,
          allowNull = _this$props4.allowNull,
          component = _this$props4.component,
          children = _this$props4.children,
          format = _this$props4.format,
          formatOnBlur = _this$props4.formatOnBlur,
          parse = _this$props4.parse,
          isEqual = _this$props4.isEqual,
          name = _this$props4.name,
          subscription = _this$props4.subscription,
          validate = _this$props4.validate,
          validateFields = _this$props4.validateFields,
          reactFinalForm = _this$props4.reactFinalForm,
          _value = _this$props4.value,
          rest = _objectWithoutPropertiesLoose(_this$props4, [
            'allowNull',
            'component',
            'children',
            'format',
            'formatOnBlur',
            'parse',
            'isEqual',
            'name',
            'subscription',
            'validate',
            'validateFields',
            'reactFinalForm',
            'value'
          ])

        var _ref3 = this.state.state || {},
          blur = _ref3.blur,
          change = _ref3.change,
          focus = _ref3.focus,
          value = _ref3.value,
          ignoreName = _ref3.name,
          otherState = _objectWithoutPropertiesLoose(_ref3, [
            'blur',
            'change',
            'focus',
            'value',
            'name'
          ])

        var meta = {
          // this is to appease the Flow gods
          active: otherState.active,
          data: otherState.data,
          dirty: otherState.dirty,
          dirtySinceLastSubmit: otherState.dirtySinceLastSubmit,
          error: otherState.error,
          initial: otherState.initial,
          invalid: otherState.invalid,
          modified: otherState.modified,
          pristine: otherState.pristine,
          submitError: otherState.submitError,
          submitFailed: otherState.submitFailed,
          submitSucceeded: otherState.submitSucceeded,
          submitting: otherState.submitting,
          touched: otherState.touched,
          valid: otherState.valid,
          visited: otherState.visited
        }

        if (formatOnBlur) {
          value = Field.defaultProps.format(value, name)
        } else if (format) {
          value = format(value, name)
        }

        if (value === null && !allowNull) {
          value = ''
        }

        var input = _extends(
          {
            name: name,
            value: value
          },
          this.handlers
        )

        if (rest.type === 'checkbox') {
          if (_value === undefined) {
            input.checked = !!value
          } else {
            input.checked = !!(Array.isArray(value) && ~value.indexOf(_value))
            input.value = _value
          }
        } else if (rest.type === 'radio') {
          input.checked = value === _value
          input.value = _value
        } else if (component === 'select' && rest.multiple) {
          input.value = input.value || []
        }

        if (typeof children === 'function') {
          return children(
            _extends(
              {
                input: input,
                meta: meta
              },
              rest
            )
          )
        }

        if (typeof component === 'string') {
          // ignore meta, combine input with any other props
          return React.createElement(
            component,
            _extends(
              {},
              input,
              {
                children: children
              },
              rest
            )
          )
        }

        var renderProps = {
          input: input,
          meta: meta // assign to force Flow check
        }
        return renderComponent(
          _extends(
            {},
            renderProps,
            {
              children: children,
              component: component
            },
            rest
          ),
          'Field(' + name + ')'
        )
      }

      return Field
    })(React.Component)

  Field.defaultProps = {
    format: function format(value, name) {
      return value === undefined ? '' : value
    },
    parse: function parse(value, name) {
      return value === '' ? undefined : value
    }
  }
  var Field$1 = withReactFinalForm(Field)

  //
  var shallowEqual = function shallowEqual(a, b) {
    if (a === b) {
      return true
    }

    if (typeof a !== 'object' || !a || typeof b !== 'object' || !b) {
      return false
    }

    var keysA = Object.keys(a)
    var keysB = Object.keys(b)

    if (keysA.length !== keysB.length) {
      return false
    }

    var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(b)

    for (var idx = 0; idx < keysA.length; idx++) {
      var key = keysA[idx]

      if (!bHasOwnProperty(key) || a[key] !== b[key]) {
        return false
      }
    }

    return true
  }

  //
  var isSyntheticEvent = function isSyntheticEvent(candidate) {
    return !!(candidate && typeof candidate.stopPropagation === 'function')
  }

  var version = '4.1.0'
  var versions = {
    'final-form': finalForm.version,
    'react-final-form': version
  }
  var all$1 = finalForm.formSubscriptionItems.reduce(function(result, key) {
    result[key] = true
    return result
  }, {})

  var ReactFinalForm =
    /*#__PURE__*/
    (function(_React$Component) {
      _inheritsLoose(ReactFinalForm, _React$Component)

      function ReactFinalForm(props) {
        var _this

        _this = _React$Component.call(this, props) || this

        _this.notify = function(state) {
          if (_this.mounted) {
            _this.setState({
              state: state
            })
          }

          _this.mounted = true
        }

        _this.handleSubmit = function(event) {
          if (event) {
            // sometimes not true, e.g. React Native
            if (typeof event.preventDefault === 'function') {
              event.preventDefault()
            }

            if (typeof event.stopPropagation === 'function') {
              // prevent any outer forms from receiving the event too
              event.stopPropagation()
            }
          }

          return _this.form.submit()
        }

        var children = props.children,
          component = props.component,
          render = props.render,
          subscription = props.subscription,
          decorators = props.decorators,
          rest = _objectWithoutPropertiesLoose(props, [
            'children',
            'component',
            'render',
            'subscription',
            'decorators'
          ])

        var config = rest
        _this.mounted = false

        try {
          _this.form = finalForm.createForm(config)
        } catch (e) {
          // istanbul ignore next
          {
            console.error('Warning: ' + e.message)
          }
        }

        _this.unsubscriptions = []

        if (_this.form) {
          // set initial state
          var initialState = {}

          _this.form.subscribe(function(state) {
            initialState = state
          }, subscription || all$1)()

          _this.state = {
            state: initialState
          }
        }

        if (decorators) {
          decorators.forEach(function(decorator) {
            _this.unsubscriptions.push(decorator(_this.form))
          })
        }

        return _this
      }

      var _proto = ReactFinalForm.prototype

      _proto.componentWillMount = function componentWillMount() {
        if (this.form) {
          this.form.pauseValidation()
        }
      }

      _proto.componentDidMount = function componentDidMount() {
        if (this.form) {
          this.unsubscriptions.push(
            this.form.subscribe(this.notify, this.props.subscription || all$1)
          )
          this.form.resumeValidation()
        }
      }

      _proto.componentWillUpdate = function componentWillUpdate() {
        // istanbul ignore next
        if (this.form) {
          this.resumeValidation =
            this.resumeValidation || !this.form.isValidationPaused()
          this.form.pauseValidation()
        }
      }

      _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
        var _this2 = this

        // istanbul ignore next
        if (this.form && this.resumeValidation) {
          this.form.resumeValidation()
        }

        if (
          this.props.initialValues &&
          !(this.props.initialValuesEqual || shallowEqual)(
            prevProps.initialValues,
            this.props.initialValues
          )
        ) {
          this.form.initialize(this.props.initialValues)
        }

        finalForm.configOptions.forEach(function(key) {
          if (key === 'initialValues' || prevProps[key] === _this2.props[key]) {
            return
          }

          _this2.form.setConfig(key, _this2.props[key])
        }) // istanbul ignore next

        {
          if (!shallowEqual(prevProps.decorators, this.props.decorators)) {
            console.error(
              'Warning: Form decorators should not change from one render to the next as new values will be ignored'
            )
          }

          if (!shallowEqual(prevProps.subscription, this.props.subscription)) {
            console.error(
              'Warning: Form subscription should not change from one render to the next as new values will be ignored'
            )
          }
        }
      }

      _proto.componentWillUnmount = function componentWillUnmount() {
        this.unsubscriptions.forEach(function(unsubscribe) {
          return unsubscribe()
        })
      }

      _proto.render = function render() {
        var _this3 = this

        // remove config props
        var _this$props = this.props,
          debug = _this$props.debug,
          initialValues = _this$props.initialValues,
          mutators = _this$props.mutators,
          onSubmit = _this$props.onSubmit,
          subscription = _this$props.subscription,
          validate = _this$props.validate,
          validateOnBlur = _this$props.validateOnBlur,
          props = _objectWithoutPropertiesLoose(_this$props, [
            'debug',
            'initialValues',
            'mutators',
            'onSubmit',
            'subscription',
            'validate',
            'validateOnBlur'
          ])

        var renderProps = _extends({}, this.state ? this.state.state : {}, {
          batch:
            this.form &&
            function(fn) {
              // istanbul ignore next
              {
                console.error(
                  'Warning: As of React Final Form v3.3.0, props.batch() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.batch() instead. Check your ReactFinalForm render prop.'
                )
              }

              return _this3.form.batch(fn)
            },
          blur:
            this.form &&
            function(name) {
              // istanbul ignore next
              {
                console.error(
                  'Warning: As of React Final Form v3.3.0, props.blur() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.blur() instead. Check your ReactFinalForm render prop.'
                )
              }

              return _this3.form.blur(name)
            },
          change:
            this.form &&
            function(name, value) {
              // istanbul ignore next
              {
                console.error(
                  'Warning: As of React Final Form v3.3.0, props.change() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.change() instead. Check your ReactFinalForm render prop.'
                )
              }

              return _this3.form.change(name, value)
            },
          focus:
            this.form &&
            function(name) {
              // istanbul ignore next
              {
                console.error(
                  'Warning: As of React Final Form v3.3.0, props.focus() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.focus() instead. Check your ReactFinalForm render prop.'
                )
              }

              return _this3.form.focus(name)
            },
          form: _extends({}, this.form, {
            reset: function reset(eventOrValues) {
              if (isSyntheticEvent(eventOrValues)) {
                // it's a React SyntheticEvent, call reset with no arguments
                _this3.form.reset()
              } else {
                _this3.form.reset(eventOrValues)
              }
            }
          }),
          handleSubmit: this.handleSubmit,
          initialize:
            this.form &&
            function(values) {
              // istanbul ignore next
              {
                console.error(
                  'Warning: As of React Final Form v3.3.0, props.initialize() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.initialize() instead. Check your ReactFinalForm render prop.'
                )
              }

              return _this3.form.initialize(values)
            },
          mutators:
            this.form &&
            Object.keys(this.form.mutators).reduce(function(result, key) {
              result[key] = function() {
                var _this3$form$mutators

                ;(_this3$form$mutators = _this3.form.mutators)[key].apply(
                  _this3$form$mutators,
                  arguments
                ) // istanbul ignore next

                {
                  console.error(
                    'Warning: As of React Final Form v3.3.0, props.mutators is deprecated and will be removed in the next major version of React Final Form. Use: props.form.mutators instead. Check your ReactFinalForm render prop.'
                  )
                }
              }

              return result
            }, {}),
          reset:
            this.form &&
            function(values) {
              // istanbul ignore next
              {
                console.error(
                  'Warning: As of React Final Form v3.3.0, props.reset() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.reset() instead. Check your ReactFinalForm render prop.'
                )
              }

              return _this3.form.reset(values)
            }
        })

        return React.createElement(
          ReactFinalFormContext.Provider,
          {
            value: this.form
          },
          renderComponent(
            _extends({}, props, renderProps, {
              __versions: versions
            }),
            'ReactFinalForm'
          )
        )
      }

      return ReactFinalForm
    })(React.Component)

  var FormSpy =
    /*#__PURE__*/
    (function(_React$Component) {
      _inheritsLoose(FormSpy, _React$Component)

      function FormSpy(props) {
        var _this

        _this = _React$Component.call(this, props) || this

        _this.subscribe = function(_ref, listener) {
          var subscription = _ref.subscription
          _this.unsubscribe = _this.props.reactFinalForm.subscribe(
            listener,
            subscription || all$1
          )
        }

        _this.notify = function(state) {
          _this.setState({
            state: state
          })

          if (_this.props.onChange) {
            _this.props.onChange(state)
          }
        }

        var initialState // istanbul ignore next

        if (!_this.props.reactFinalForm) {
          console.error(
            'Warning: FormSpy must be used inside of a ReactFinalForm component'
          )
        }

        if (_this.props.reactFinalForm) {
          // avoid error, warning will alert developer to their mistake
          _this.subscribe(props, function(state) {
            if (initialState) {
              _this.notify(state)
            } else {
              initialState = state

              if (props.onChange) {
                props.onChange(state)
              }
            }
          })
        }

        if (initialState) {
          _this.state = {
            state: initialState
          }
        }

        return _this
      }

      var _proto = FormSpy.prototype

      _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
        var subscription = this.props.subscription

        if (
          diffSubscription(
            prevProps.subscription,
            subscription,
            finalForm.formSubscriptionItems
          )
        ) {
          if (this.props.reactFinalForm) {
            // avoid error, warning will alert developer to their mistake
            this.unsubscribe()
            this.subscribe(this.props, this.notify)
          }
        }
      }

      _proto.componentWillUnmount = function componentWillUnmount() {
        this.unsubscribe()
      }

      _proto.render = function render() {
        var _this$props = this.props,
          onChange = _this$props.onChange,
          reactFinalForm = _this$props.reactFinalForm,
          rest = _objectWithoutPropertiesLoose(_this$props, [
            'onChange',
            'reactFinalForm'
          ])

        var renderProps = {
          batch:
            reactFinalForm &&
            function(fn) {
              // istanbul ignore next
              {
                console.error(
                  'Warning: As of React Final Form v3.3.0, props.batch() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.batch() instead. Check your FormSpy render prop.'
                )
              }

              return reactFinalForm.batch(fn)
            },
          blur:
            reactFinalForm &&
            function(name) {
              // istanbul ignore next
              {
                console.error(
                  'Warning: As of React Final Form v3.3.0, props.blur() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.blur() instead. Check your FormSpy render prop.'
                )
              }

              return reactFinalForm.blur(name)
            },
          change:
            reactFinalForm &&
            function(name, value) {
              // istanbul ignore next
              {
                console.error(
                  'Warning: As of React Final Form v3.3.0, props.change() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.change() instead. Check your FormSpy render prop.'
                )
              }

              return reactFinalForm.change(name, value)
            },
          focus:
            reactFinalForm &&
            function(name) {
              // istanbul ignore next
              {
                console.error(
                  'Warning: As of React Final Form v3.3.0, props.focus() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.focus() instead. Check your FormSpy render prop.'
                )
              }

              return reactFinalForm.focus(name)
            },
          form: _extends({}, reactFinalForm, {
            reset: function reset(eventOrValues) {
              if (isSyntheticEvent(eventOrValues)) {
                // it's a React SyntheticEvent, call reset with no arguments
                reactFinalForm.reset()
              } else {
                reactFinalForm.reset(eventOrValues)
              }
            }
          }),
          initialize:
            reactFinalForm &&
            function(values) {
              // istanbul ignore next
              {
                console.error(
                  'Warning: As of React Final Form v3.3.0, props.initialize() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.initialize() instead. Check your FormSpy render prop.'
                )
              }

              return reactFinalForm.initialize(values)
            },
          mutators:
            reactFinalForm &&
            Object.keys(reactFinalForm.mutators).reduce(function(result, key) {
              result[key] = function() {
                var _reactFinalForm$mutat

                ;(_reactFinalForm$mutat = reactFinalForm.mutators)[key].apply(
                  _reactFinalForm$mutat,
                  arguments
                ) // istanbul ignore next

                {
                  console.error(
                    'Warning: As of React Final Form v3.3.0, props.mutators is deprecated and will be removed in the next major version of React Final Form. Use: props.form.mutators instead. Check your FormSpy render prop.'
                  )
                }
              }

              return result
            }, {}),
          reset:
            reactFinalForm &&
            function(values) {
              // istanbul ignore next
              {
                console.error(
                  'Warning: As of React Final Form v3.3.0, props.reset() is deprecated and will be removed in the next major version of React Final Form. Use: props.form.reset() instead. Check your FormSpy render prop.'
                )
              }

              return reactFinalForm.reset(values)
            }
        }
        return onChange
          ? null
          : renderComponent(
              _extends(
                {},
                rest,
                this.state ? this.state.state : {},
                renderProps
              ),
              'FormSpy'
            )
      }

      return FormSpy
    })(React.Component)

  var FormSpy$1 = withReactFinalForm(FormSpy)

  //

  exports.Field = Field$1
  exports.Form = ReactFinalForm
  exports.FormSpy = FormSpy$1
  exports.ReactFinalFormContext = ReactFinalFormContext
  exports.version = version
  exports.withReactFinalForm = withReactFinalForm

  Object.defineProperty(exports, '__esModule', { value: true })
})
//# sourceMappingURL=react-final-form.umd.js.map
