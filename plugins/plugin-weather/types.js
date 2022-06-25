/**
* @typedef {object} FrontendContext
* @property {Object.<string, HTMLElement>} elements
* @property {Object.<string, unknown>} data
* @property {Object.<string, unknown>} inputs
*/

/**
 * @typedef {object} BackendContext
 * @property {Object.<string, unknown>} data
 * @property {Object.<string, unknown>} inputs
 */

/**
 * @callback BackendFn
 * @param {BackendContext} context
 * @returns {(Object.<string, unknown>|Promise)}
 */

/**
* @typedef {Object.<string, BackendFn>} BackendFunctions
*/

export {};