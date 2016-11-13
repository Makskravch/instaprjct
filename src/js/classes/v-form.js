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
      this._setupFields();
      this._bindEvents();
      console.log(this);
    }

    validate() {
      const { onValid, onError } = this.props;
      const result = this.fields.map(f => f.validate());

      if (result.every(res => res === true)) {
        call(onValid, this);
        return true;
      }

      const errors = result
        .reduce((acc, next) => acc.concat(next), [])
        .filter(val => val !== true);

      call(onError, this, errors);
      return errors;
    }

    serialize() {
      return formSerialize(this.element, { hash: true });
    }

    _setupFields() {
      const { fields, noAutoValidate } = this.props;
      // create FormField instances for those fields that need to be validated
      this.fields = Object.keys(fields).reduce((acc, k) => {
        const input     = this.element.elements[k];
        const props     = Object.assign({ noAutoValidate }, fields[k]);
        const formField = input && new FormField(input.parentNode, props);
        return formField ? acc.concat(formField) : acc;
      }, []);
    }

    _submitHandler(e) {
      const { onSubmit } = this.props;
      e.preventDefault();
      this.validate();
      call(onSubmit, e, this);
    }

    _bindEvents() {
      this.element.addEventListener('submit', this._submitHandler.bind(this));
    }
  }

  VForm.defaults = {
    fieldSelector: '.form-group',
    noAutoValidate: true,
    onSubmit: null,
    onError: null,
    onValid: null,
    fields: {}
  };

  return VForm;

} ());
