(() => {

  const App = window.App || {};

  /**
   * Get DOM element by selector
   * @param  {[String]} selector
   * @return {[DOMNode]}
   */
  const qs = (selector, context = document) =>
    context.querySelector(selector);

  /**
   * Get all DOM elements by given selector as array
   * @param  {[String]} selector
   * @return {[Array]}
   */
  const qsa = (selector, context = document) =>
    Array.prototype.slice.call(
      context.querySelectorAll(selector)
    );

  /**
   * Chek if object is a DOM element
   * @param  {[Object]}
   * @return {[Boolean]}
   */
  const isDomElement = (object) => object instanceof HTMLElement;

  /**
   * Export helper functions
   */
  App.helpers = {
    qs,
    qsa,
    isDomElement
  };

})();
