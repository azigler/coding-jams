/**
 * @param {string[][]} routes - Array of [origin, destination] pairs
 * @returns {string[]} The reconstructed route
 */
function revealSantaRoute(routes) {
  if (!routes.length) return [];
  
  const routeMap = new Map(routes.map(r => [r[0], r[1]]));
  const route = [...routes[0]];
  let currentDest = routes[0][1];
  
  while (routeMap.has(currentDest)) {
    currentDest = routeMap.get(currentDest);
    route.push(currentDest);
  }
  
  return route;
}
