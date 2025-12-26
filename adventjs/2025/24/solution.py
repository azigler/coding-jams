def is_trees_synchronized(tree1, tree2):
  root_value = tree1.get('value', '') if tree1 else ''
  
  if not tree1 and not tree2:
    return [True, root_value]
  if not tree1 or not tree2:
    return [False, root_value]
  if tree1.get('value') != tree2.get('value'):
    return [False, root_value]
  
  left_sync, _ = is_trees_synchronized(tree1.get('left'), tree2.get('right'))
  right_sync, _ = is_trees_synchronized(tree1.get('right'), tree2.get('left'))
  
  return [left_sync and right_sync, root_value]
  