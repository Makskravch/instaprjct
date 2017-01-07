const VForm = (function() {

  const call = (fn, ...args) => {
    if (typeof fn === 'function') {
      return fn(...args);
    }
  };

  class VForm {
    constructor(form, props) {
      this.element = isDomElement(form) ? form : qs(form);

      if (this.element.tagName !== 'FORM') {
        throw new TypeError('VForm can be initialized only with \'form\' element');
      }

      this.props = Object.assign({}, VForm.defaults, props);
      this.submit = Array.prototype.filter.call(
        this.element.elements, (el) => el.type === 'submit'
      )[0];
      this._setupFields();
      this._bindEvents();
      console.log(this);
    }

    validate() {
      const { onValid, onError, autoValidate } = this.props;
      const result = this.fields.map(f => f.validate());

      if (result.every(res => res === true)) {
        call(onValid, this);
        return true;
      }

      const errors = result
        .reduce((acc, next) => acc.concat(next), [])
        .filter(val => val !== true);

      call(
        onError,
        this,
        this.fields.map(f => ({
          el: f.control,
          errors: f.errors
        }))
      );
      if (autoValidate) this.setInvalidState();
      return errors;
    }

    isValid() {
      return this.fields.map(f => f.isValid()).every(res => res === true);
    }

    serialize() {
      return formSerialize(this.element, { hash: true, empty: true });
    }

    setInvalidState() {
      this.element.classList.add(this.props.invalidClass);
      this.submit.setAttribute('disabled', true);
    }

    setLoadingState() {
      this.element.classList.add(this.props.loadingClass);
      this.submit.setAttribute('disabled', true);
    }

    setSuccessState() {
      this.element.classList.add(this.props.successClass);
    }

    setErrorState() {
      this.element.classList.add(this.props.errorClass);
    }

    resetState() {
      const { invalidClass, loadingClass, successClass, errorClass } = this.props;
      this.element.classList.remove(invalidClass);
      this.element.classList.remove(loadingClass);
      this.element.classList.remove(successClass);
      this.element.classList.remove(errorClass);
      this.submit.removeAttribute('disabled');
      return this;
    }

    _updateState(e) {
      if (e.target === this.submit) return;
      if (this.isValid()) {
        this.resetState();
      } else {
        this.setInvalidState();
      }
    }

    _setupFields() {
      const { fields, autoValidate } = this.props;
      // create FormField instances for those fields that need to be validated
      this.fields = Object.keys(fields).reduce((acc, k) => {
        const input     = this.element.elements[k];
        const props     = Object.assign({ autoValidate }, fields[k]);
        const formField = input && new FormField(input.parentNode, props);
        return formField ? acc.concat(formField) : acc;
      }, []);
    }

    _submitHandler(e) {
      e.preventDefault();
      this.validate();
      call(this.props.onSubmit, e, this);
    }

    _bindEvents() {
      this.element.addEventListener('submit', this._submitHandler.bind(this));
      if (!this.props.autoValidate) return;
      const handler = this._updateState.bind(this);
      this.element.addEventListener('focusout', handler);
      this.element.addEventListener('focusin', handler);
    }
  }

  VForm.defaults = {
    fieldSelector: '.form-group',
    invalidClass: 'is-invalid',
    loadingClass: 'is-loading',
    errorClass: 'has-submit-error',
    successClass: 'has-submit-success',
    autoValidate: true,
    onSubmit: null,
    onError: null,
    onValid: null,
    fields: {}
  };

  return VForm;

} ());
