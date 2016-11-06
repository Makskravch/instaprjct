const EMAIL_RE = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;

const RULES = {
  'email': (s) => EMAIL_RE.test(s),
  'min-length': (s, len) => s.length >= len,
  'max-length': (s, len) => s.length <= len,
  'required': (s) => !!s.length,
  'default': () => true
};

const ERROR_MESSAGES = {
  'email': () => 'Email is not valid',
  'min-length': (n) => `Value must contain at least ${n} characters`,
  'max-length': (n) => `Value can\'t contain more than ${n} characters`,
  'required': () => 'Field is required',
  'default': () => 'Unknown error'
};

class FormField {
  constructor(element, props = {}) {
    this.element   = isDomElement(element) ? element : qs(element);
    this.props     = Object.assign({}, FormField.defaults, props);
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
    this.validate = this.validate.bind(this);
    this._bindEvents();

    console.log(this);
  }

  validate() {
    const isValid = this._validator(this.control.value);
    this._resetState();

    if (isValid) {
      this._setValidState();
    } else {
      this._setErrorState();
    }

    return isValid;
  }

  _setErrorState() {
    this.element.classList.add(this.props.errorClass);
    this.element.appendChild(this.errorElement);
    this._hasError = true;
  }

  _setValidState() {
    this.element.classList.add(this.props.validClass);
    this._isValid = true;
  }

  _resetState() {
    if (this._isValid === null && this._hasError === null) return;

    const { errorClass, validClass } = this.props;
    this.element.classList.remove(errorClass);
    this.element.classList.remove(validClass);

    // unmount error element if mounted
    if (this.errorElement && this.errorElement.parentNode) {
      this.element.removeChild(this.errorElement);
    }

    this._isValid = null;
    this._hasError = null;
  }

  _setupErrorElement() {
    if (this.errorElement) return;
    this.errorElement = document.createElement('span');
    this.errorElement.className = this.props.errorElementClass;
  }

  _bindEvents() {
    const { resetOnFocus, validateOnInput, validateOnBlur } = this.props;

    if (resetOnFocus) {
      this.control.addEventListener('focus', () => this._resetState());
    }

    if (validateOnInput) {
      this.control.addEventListener('input', this.validate);
    }

    if (validateOnBlur) {
      this.control.addEventListener('blur', this.validate);
    }
  }

  _setupValidator() {
    if (typeof this.props.customValidator === 'function') {
      return this._validator = this.props.customValidator.bind(this);
    }

    const rules = [].concat(this.props.validate);
    const validators = rules.map(rule => RULES[rule] || RULES['default']);
    this._validator = (s) => validators.map(fn => fn(s)).every(res => res === true);
  }

}

FormField.defaults = {
  errorClass: 'has-error',
  validClass: 'has-success',
  errorElementClass: 'text-error',
  resetOnFocus: true,
  validateOnInput: false,
  validateOnBlur: true,
  control: 'input',
  customValidator: null,
  validate: 'required'
};

setTimeout(() => {
  new FormField('#public-info .form-group');
}, 1000);
