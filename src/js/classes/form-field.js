const FormField = (function() {

  const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  const NUMBER_RE = /^[\-\+]?(\d+|\d+\.?\d+)$/;

  const RULE_PARAM_RE = /\[.*\]$/; // match 'ruleName[param1, param2]'

  /**
   * Parse string like 'maxLength[10]' into { name: 'maxLength', params: [10]}
   * @param  {Sting} str Source string that need to be parsed
   * @return {Object}    Object with name of rule and his parameters
   */
  const parseRuleFromString = (str) => {
    const match = str.match(RULE_PARAM_RE);
    const name = str.replace(RULE_PARAM_RE, '');
    const params = match ? match[0].slice(1, -1).split(',').filter(p => !!p) : [];
    return { name, params };
  };

  const messages = {
    email: 'Email is not valid',
    minLength: 'Field must contain at least {n} characters',
    maxLength: 'Field can\'t contain more than {n} characters',
    required: 'Required field',
    number: 'Field can contain only numbers'
  };

  /**
   * Set of validation rules
   * Each of rule return true if valid, or error message
   */
  const validationRules = {
    email: (s) => EMAIL_RE.test(s) || messages.email,
    minLength: (s, len = 6) => s.length >= len || messages.minLength.replace('{n}', len),
    maxLength: (s, len = 100) => s.length <= len || messages.maxLength.replace('{n}', len),
    required: (s) => !!s.length || messages.required,
    number: (s) => NUMBER_RE.test(s) || messages.number
  };

  class FormField {
    constructor(element, props = {}) {
      this.element   = isDomElement(element) ? element : qs(element);
      this.props     = Object.assign({}, FormField.defaults, props);
      this.rules     = [];
      this.errors    = [];
      this._required = false;
      this._isValid  = null;
      this._hasError = null;

      if (this.element.matches(this.props.control)) {
        this.control = this.element;
      } else {
        this.control = qs(this.props.control, this.element);
      }

      if (this.control !== this.element) {
        this._setupErrorElement();
      }

      this._setupValidator();
      this._bindEvents();

      console.log(this);
    }

    isValid() {
      return !this._hasError;
    }

    /**
     * Validate field
     * @return {Boolean|String} true if valid or error message if invalid
     */
    validate() {
      const { value } = this.control;
      this.resetState();

      // discard validation if field is not required and has empty value
      if (value === '' && !this._required) return true;
      const result = this._validate(value);

      if (result === true) {
        this.setValidState();
      } else {
        this.setErrorState(result);
      }

      return result;
    }

    setErrorState(message) {
      if (this._hasError) return;

      this.errors = message ? [].concat(message) : [];
      this.element.classList.add(this.props.errorClass);

      if (this.errorElement) {
        // show all errors
        // this.errorElement.innerHTML = this.errors.join('<br>');
        // show only first error
        this.errorElement.innerHTML = this.errors[0];
        this.element.appendChild(this.errorElement);
      }

      this._hasError = true;
    }

    setValidState() {
      if (this._isValid) return;

      this.element.classList.add(this.props.validClass);
      this._isValid = true;
    }

    resetState() {
      if (this._isValid === null && this._hasError === null) return;

      const { errorClass, validClass } = this.props;
      this.element.classList.remove(errorClass);
      this.element.classList.remove(validClass);

      // unmount error element if mounted
      if (this.errorElement && this.errorElement.parentNode) {
        this.element.removeChild(this.errorElement);
        this.errorElement.innerHTML = '';
      }

      this.errors = [];

      this._isValid = null;
      this._hasError = null;
    }

    _setupErrorElement() {
      if (this.errorElement) return;
      this.errorElement = document.createElement('span');
      this.errorElement.className = this.props.errorElementClass;
    }

    _bindEvents() {
      const {
        resetOnFocus,
        validateOnInput,
        validateOnBlur,
        autoValidate
      } = this.props;

      if (!autoValidate) return;

      if (resetOnFocus) {
        this.control.addEventListener('focus', () => this.resetState());
      }

      if (validateOnInput) {
        this.control.addEventListener('input', () => this.validate());
      }

      if (validateOnBlur) {
        this.control.addEventListener('blur', () => this.validate());
      }
    }

    _setupValidator() {
      const { validate, customValidator, errorMessages } = this.props;
      const type = typeof validate;

      if (type === 'string' || Array.isArray(validate)) {
        [].concat(validate).forEach(str => {
          const { name, params } = parseRuleFromString(str);
          const fn = validationRules[name];
          if (fn) {
            this.rules.push({ name, fn, params });
          }
          if (name === 'required') {
            this._required = true;
          }
        });
      }

      if (typeof customValidator === 'function') {
        this.rules.push({
          name: 'custom',
          fn: customValidator
        });
      }

      // if "customValidator" is not a function or "validate" has unknown value
      if (!this.rules.length) {
        throw new Error(
          'You must provide "validate" or "customValidator" option for FormField class.'
        );
      }

      /**
       * Check given value with set of validation rules
       * @param  {String} value
       * @return {Boolean|Array} true if valid or array of error messages
       */
      this._validate = (value) => {
        const errors = this.rules.reduce((acc, { name, fn, params = [] }) => {
          const res = fn(value, ...params);
          // if valid
          if (res === true) return acc;
          // else return custom (if exist) or default error message
          return acc.concat(
            errorMessages[name] && errorMessages[name].replace('{n}', params[0]) || res
          );
        }, []);
        return errors.length ? errors : true;
      };
    }

  }

  FormField.defaults = {
    errorClass: 'has-error',
    validClass: 'has-success',
    errorElementClass: 'text-danger',
    resetOnFocus: true,
    validateOnInput: false,
    validateOnBlur: true,
    autoValidate: true,
    control: 'input',
    customValidator: null,
    errorMessages: {},
    validate: null
  };

  return FormField;

} ());
