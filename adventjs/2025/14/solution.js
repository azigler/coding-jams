/**
 * @param {object} workshop - A representation of the workshop
 * @param {string|number|boolean} gift - The gift to find
 * @returns {string[]} The path to the gift
 */
function findGiftPath(workshop, gift) {
  function search(obj, target, path) {
    // Check if current object is the target
    if (obj === target) {
      return path;
    }
    
    // If obj is not an object or is null, skip
    if (typeof obj !== 'object' || obj === null) {
      return null;
    }
    
    // Search through all keys
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newPath = [...path, key];
        const result = search(obj[key], target, newPath);
        if (result !== null) {
          return result;
        }
      }
    }
    
    return null;
  }
  
  const result = search(workshop, gift, []);
  return result || [];
}
