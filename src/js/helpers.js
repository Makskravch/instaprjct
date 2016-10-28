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

/**
 * Attach a handler to an event for all elements matching a selector.
 *
 * @param {Element} target Element which the event must bubble to
 * @param {string} selector Selector to match
 * @param {string} type Event name
 * @param {Function} handler Function called when the event bubbles to target
 *                           from an element matching selector
 * @param {boolean} [capture] Capture the event
 */
const delegate = (target, type, selector, handler, capture) => {
  const dispatchEvent = (event) => {
    console.time('delegate');
    const targetElement = event.target;
    const potentialElements = target.querySelectorAll(selector);
    let i = potentialElements.length;

    while (i--) {
      if (potentialElements[i] === targetElement) {
        handler.call(targetElement, event);
        break;
      }
    }
    console.timeEnd('delegate');
  };

  target.addEventListener(type, dispatchEvent, !!capture);
};
