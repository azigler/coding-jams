type Gift = string | number | boolean
type Workshop = Record<string, any>
type Path = string[]

function findGiftPath(workshop: Workshop, gift: Gift): Path {
  function search(obj: any, target: Gift, path: string[]): string[] | null {
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
