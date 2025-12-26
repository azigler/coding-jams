# Challenge 24: 🪞 Check if trees are magical mirrors - Solution Log

## Problem Summary

- **Difficulty:** medium
- **Function:** `isTreesSynchronized`

Check if two binary trees are mirrors of each other. Mirrors means: root values match, left of tree1 matches right of tree2, and right of tree1 matches left of tree2. Return [boolean, root_value_of_tree1].

## Attempts

### JavaScript

- ✅ Completed (8 stars, 5/5 quality) - Recursive mirror check

### TypeScript

- ✅ Completed (8 stars, 5/5 quality) - First attempt

### Python

- ✅ Completed (7 stars, 4/5 quality) - Minor feedback about return value handling

## Approach

1. **Base cases**: Handle null/undefined trees
2. **Check root values**: If roots don't match, return [false, tree1.value]
3. **Recursive mirror check**: Check if tree1.left mirrors tree2.right AND tree1.right mirrors tree2.left
4. **Return format**: Always return [boolean, tree1.value] (even if trees don't match)

### Algorithm

```javascript
if (!tree1 && !tree2) return [true, ''];
if (!tree1 || !tree2) return [false, tree1?.value || tree2?.value || ''];
if (tree1.value !== tree2.value) return [false, tree1.value];

const [leftSync] = isTreesSynchronized(tree1.left, tree2.right);
const [rightSync] = isTreesSynchronized(tree1.right, tree2.left);

return [leftSync && rightSync, tree1.value];
```

## Key Insights

- **Recursive structure**: Natural fit for tree problems
- **Mirror logic**: Left of tree1 must match right of tree2 (and vice versa)
- **Return format**: Always return root value of tree1, even when trees don't match
- **Base cases**: Handle null/undefined trees carefully
- **Python feedback**: Minor feedback about unpacking return values, but logic is correct
- **Clean solution**: Recursive approach is elegant and got 5/5 in JS/TS
