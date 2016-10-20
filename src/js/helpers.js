/**
 * Get DOM element by selector
 * @param  {String} selector
 * @return {DOMNode}
 */
const qs = (selector, context = document) =>
  context.querySelector(selector);

/**
 * Get all DOM elements by given selector as array
 * @param  {String} selector
 * @return {Array}
 */
const qsa = (selector, context = document) =>
  Array.prototype.slice.call(
    context.querySelectorAll(selector)
  );

/**
 * Chek if object is a DOM element
 * @param  {Object}
 * @return {Boolean}
 */
const isDomElement = (object) => object instanceof HTMLElement;

/**
 * Creates an object composed of the picked object properties.
 * @param  {Object} object source object
 * @param  {Array}  props  array of properties that should be picked
 * @return {Object}
 */
const pick = (object, props) => {
  return props.reduce((result, prop) => {
    const value = object[prop];
    if (typeof value !== 'undefined') {
      result[prop] = value;
    }
    return result;
  }, {});
};
