def find_gift_path(workshop: dict, gift: str | int | bool) -> list[str]:
  def search(obj, target, path):
    # Check if current object is the target
    if obj == target:
      return path
    
    # If obj is not a dict, skip
    if not isinstance(obj, dict):
      return None
    
    # Search through all keys
    for key in obj:
      new_path = path + [key]
      result = search(obj[key], target, new_path)
      if result is not None:
        return result
    
    return None
  
  result = search(workshop, gift, [])
  return result if result is not None else []
