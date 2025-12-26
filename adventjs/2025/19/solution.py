def reveal_santa_route(routes: list[list[str]]) -> list[str]:
  if not routes:
    return []
  
  route_map = {r[0]: r[1] for r in routes}
  route = routes[0][:]
  current_dest = routes[0][1]
  
  while current_dest in route_map:
    current_dest = route_map[current_dest]
    route.append(current_dest)
  
  return route
