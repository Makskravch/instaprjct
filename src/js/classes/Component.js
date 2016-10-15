(() => {

  function Component(props) {
    this.props = Object.assign({}, Component._defaults, props);
    this.el    = this.props.el;
    this.fetchingTemplate = false;
    this.templateName = this.props.templateName;
    this.template  = '';
  }

  Component.prototype = {
    constructor: Component,

    _getView() {
      if (this.template) return;
      this.fetchingTemplate = true;
      fetch(`views/${aa}.html`)
        .then(response => {
          this.template = response.text();
          this.fetchingTemplate = false;
        })
        .catch(err => console.log(err));
    }
  };

  Component._defaults = {

  };

})();
