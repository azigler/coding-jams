/**
 * @param {object} tree1 - The first binary tree.
 * @param {object} tree2 - The second binary tree.
 * @returns {[boolean, string]}
 */
function isTreesSynchronized(tree1, tree2) {
  if (!tree1 && !tree2) return [true, ''];
  if (!tree1 || !tree2) return [false, tree1?.value || tree2?.value || ''];
  if (tree1.value !== tree2.value) return [false, tree1.value];
  
  const [leftSync] = isTreesSynchronized(tree1.left, tree2.right);
  const [rightSync] = isTreesSynchronized(tree1.right, tree2.left);
  
  return [leftSync && rightSync, tree1.value];
}
  