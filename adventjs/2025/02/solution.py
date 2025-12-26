def manufacture_gifts(gifts_to_produce):
  result = []
  for gift in gifts_to_produce:
    quantity = gift.get('quantity', 0)
    if isinstance(quantity, (int, float)) and quantity > 0:
      for _ in range(int(quantity)):
        result.append(gift.get('toy', ''))
  return result
