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
      const result = this.fields.map(f => f.validate());
      console.log(result);
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
      this.validate();
      call(onSubmit, e, this);
      console.log(serialize(this.element));
      e.preventDefault();
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
