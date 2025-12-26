def draw_table(data: list[dict], sortBy: str) -> str:
    if not data:
        return ''

    def fmt(v):
        if type(v) is bool:
            return str(v).lower()
        if v is None:
            return ''
        return str(v)

    def make_row(vals, ws):
        cells = map(lambda vw: vw[0].ljust(vw[1]), zip(vals, ws))
        return '| ' + ' | '.join(cells) + ' |'

    rows = sorted(data, key=lambda r: (type(r[sortBy]) is str, r[sortBy]))
    keys = list(data[0].keys())
    ws = [max(1, *map(lambda r: len(fmt(r[k])), rows)) for k in keys]

    sep = '+' + '+'.join('-' * (w + 2) for w in ws) + '+'
    head = make_row([chr(65 + i) for i in range(len(keys))], ws)
    body = [make_row([fmt(r[k]) for k in keys], ws) for r in rows]

    return '\n'.join([sep, head, sep] + body + [sep])
