class FormField {
  constructor(element, props = {}) {
    this.element = isDomElement(element) ? element : qs(element);
    this.props   = Object.assign({}, FormField.defaults, props);
    this._valid  = false;

    if (this.element.matches(this.props.control)) {
      this.control = this.element;
    } else {
      this.control = qs(this.props.control, this.element);
    }

    if (this.control !== this.element) {
      this._setupErrorElement();
    }

    if (typeof this.props.customValidator === 'function') {
      this._validator = this.props.customValidator.bind(this);
    }

    console.log(this);
  }

  set valid(bool) {
    if (bool) {
      this._setValidState();
      this._valid = true;
    } else {
      this._setErrorState();
      this._valid = false;
    }
  }

  get valid() {
    return this._valid;
  }

  validate() {

  }

  _setErrorState() {
    this.element.classList.add(this.props.errorClass);
    this.element.appendChild(this.error);
  }

  _resetState() {
    const { errorClass, validClass } = this.props;
    this.element.classList.remove(errorClass);
    this.element.classList.remove(validClass);

    // unmount error element if mounter
    if (this.error.parentNode) {
      this.element.removeChild(this.error);
    }
  }

  _setValidState() {
    this.element.classList.add(validClass);
  }

  _setupErrorElement() {
    this.error = document.createElement('span');
    this.error.classList.add(this.props.errorElementClass);
  }

  _bindEvents() {
    const { resetOnFocus, validateOnInput, validateOnBlur } = this.props;
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
  customValidator: null
};

// setTimeout(() => {
//   new FormField('#public-info .form-group');
// }, 1000);
