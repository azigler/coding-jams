# Day 8: Playground - Solution Log

## Problem Summary

Junction boxes in 3D space need to be connected with strings of lights. Electricity can flow between connected boxes, forming circuits.

### Part 1 ✅

- Connect the 1000 shortest pairs of junction boxes
- After connections, find the three largest circuits
- Multiply their sizes together
- **Answer: 24360** ✅ CORRECT

### Part 2 ✅

- Continue connecting pairs until all boxes are in one circuit
- Find the last connection made
- Multiply the X coordinates of the two boxes in that connection
- **Answer: 2185817796** ✅ CORRECT

## Solution Approach

### Algorithm: Union-Find (Disjoint Set Union)

This is a classic minimum spanning tree problem variant. We use Union-Find to track which boxes are in the same circuit.

**Key Insight:**

- "The 1000 shortest connections" means process the first 1000 edges in sorted order
- Some edges may be skipped if boxes are already in the same circuit
- This is different from "make 1000 actual connections"

### Implementation

1. **Parse Input:** Read all junction box positions (X, Y, Z coordinates)

2. **Generate All Pairs:** Calculate distances between all pairs of boxes
   - Distance formula: `sqrt((x1-x2)² + (y1-y2)² + (z1-z2)²)`
   - Store as edges: `{i, j, dist}`

3. **Sort Edges:** Sort all edges by distance (shortest first)

4. **Union-Find Data Structure:**
   - Tracks which boxes are in the same circuit
   - `find(x)`: Find root of component containing x
   - `union(x, y)`: Merge components containing x and y
   - Returns `false` if already in same component

5. **Part 1:**
   - Process first 1000 edges in sorted order
   - For each edge, try to union the two boxes
   - After processing, get all component sizes
   - Sort sizes descending, multiply top 3

6. **Part 2:**
   - Continue processing edges until only 1 component remains
   - Track the last connection that was actually made
   - Multiply X coordinates of the two boxes in that connection

## Test Results

### Example Test (Part 1)

- Input: 20 junction boxes
- Process first 10 edges
- Expected: 40 (5 × 4 × 2)
- Result: ✅ 40

### Example Test (Part 2)

- Continue until all connected
- Last connection: Box 10 (216,146,977) ↔ Box 12 (117,168,530)
- Product: 216 × 117 = 25272
- Expected: 25272
- Result: ✅ 25272

## Key Learnings

1. **Union-Find is perfect for tracking connected components**
   - Efficient O(α(n)) amortized per operation
   - Path compression and union by rank optimize performance

2. **Edge processing interpretation:**
   - "1000 shortest connections" = process first 1000 edges
   - Not "make 1000 actual connections"
   - Some edges are skipped if boxes already connected

3. **Part 2 requires tracking the last connection:**
   - Need to know which edge was the final one that connected everything
   - Store the edge when a union actually happens

## Final Answers

- **Part 1:** 24360
- **Part 2:** 2185817796

Both parts solved successfully! 🎉
