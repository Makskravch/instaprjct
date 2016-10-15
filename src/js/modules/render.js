(() => {

  const { helpers: { isDomElement } } = App;

  const render = (container, template, data = {}) => {
    if (!isDomElement(container)) {
      throw new TypeError('Container must be a DOM element');
    }

    if (typeof template !== 'function') {
      throw new TypeError(`Template must be a function, not a ${typeof template}`);
    }

    container.innerHTML = template(data);
  };

  App.render = render;

})();
