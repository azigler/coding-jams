import re
from typing import Optional


def decode_santa_pin(code: str) -> Optional[str]:
    blocks = re.findall(r'\[([^\]]+)\]', code)
    if len(blocks) < 4:
        return None

    digits = []
    for block in blocks:
        if block == '<':
            if not digits:
                return None
            digits.append(digits[-1])
            continue
        if not block[0].isdigit():
            return None
        digit = int(block[0])
        for op in block[1:]:
            digit = (digit + 1) % 10 if op == '+' else (digit - 1 + 10) % 10
        digits.append(digit)
    return ''.join(str(d) for d in digits)
