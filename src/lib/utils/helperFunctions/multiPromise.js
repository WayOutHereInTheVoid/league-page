/**
 * Utility wrapper that executes multiple Promises in parallel and resolves only when all settle successfully.
 * Equates to Promise.all.
 *
 * @param {...Promise<any>} ps - Variadic list of Promises to wait on.
 * @returns {Promise<any[]>} Resolved list of results.
 */
export const waitForAll = async (...ps) => {
  return Promise.all(ps);
};
