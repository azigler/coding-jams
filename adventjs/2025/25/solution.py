def execute(code: str) -> int:
    jumps = {}
    stack = []
    add = {'+': 1, '-': -1}
    is_open = {'[', '{'}
    is_close = {']', '}'}

    for i, c in enumerate(code):
        if c in is_open:
            stack.append(i)
        if c in is_close:
            s = stack.pop()
            jumps[s] = i + 1
            jumps[i] = s + 1

    val, pos = 0, 0
    while pos < len(code):
        c = code[pos]
        val += add.get(c, 0)
        do_jump = (c in is_open and val == 0) or (c == ']' and val != 0)
        pos = jumps[pos] if do_jump else pos + 1
    return val
