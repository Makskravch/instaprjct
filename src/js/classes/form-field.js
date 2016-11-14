// as example
// const EMAIL_RE = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;


const FormField = (function() {

  const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  const NUMBER_RE = /^[\-\+]?(\d+|\d+\.?\d+)$/;

  const RULE_PARAM_RE = /\[.*\]$/; // match 'ruleName[param1, param2]'

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

  const validator = {
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
      this.errors    = [],
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

    validate() {
      const value = this.control.value;
      this.resetState();

      // discard validation if field is not required and has empty value
      if (value === '' && !this._required) return true;
      const result = this._validator(value);

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
        this.element.appendChild(this.errorElement);
        // show all errors
        // this.errorElement.innerHTML = this.errors.join('<br>');
        // show only first error
        this.errorElement.innerHTML = this.errors[0];
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
        this.errorElement.innerHTML = '';
        this.element.removeChild(this.errorElement);
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
          const fn = validator[name];
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

      this._validator = (value) => {
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

// setTimeout(() => {
//   new FormField('#public-info .form-group:first-child', {
//     // validate: ['email', 'minLength[10]'],
//     validateOnInput: true,
//     customValidator: (val) => {
//       return val === 'www@com.com' || 'Field must have value "www@com.com"';
//     }
//   });
// }, 1000);
