def draw_tree(height, ornament, frequency):
  lines = []
  position = 1  # Global position counter (starts at 1)
  max_width = 2 * height - 1  # Width of the bottom row
  
  # Draw tree rows
  for row in range(1, height + 1):
    row_width = 2 * row - 1  # Number of characters in this row
    padding = (max_width - row_width) // 2  # Spaces before the row
    
    row_str = ' ' * padding
    
    # Build the row character by character
    for col in range(row_width):
      # If position is divisible by frequency, use ornament, else use '*'
      if position % frequency == 0:
        row_str += ornament
      else:
        row_str += '*'
      position += 1
    
    lines.append(row_str)
  
  # Add trunk (centered, same width as first row)
  trunk_padding = (max_width - 1) // 2
  lines.append(' ' * trunk_padding + '#')
  
  return '\n'.join(lines)
