"""仅供文本提取的内存过滤；不得把处理后的 PageObject 写回原 PDF。"""
from pypdf._text_extraction import mult
from pypdf.generic import ArrayObject, ContentStream, FloatObject, NameObject


def _advance(value, font, size, char_spacing, word_spacing):
    """返回等价 TJ 位移；使用原始字符码，避免 Unicode 映射影响字宽。"""
    raw = value.original_bytes if isinstance(value, str) else bytes(value)
    if not raw:
        return FloatObject(0), 0
    if not font or not size:
        raise ValueError("字体或字号不足以保留文字定位")
    if font.get("/Subtype") == "/Type0":
        if font.get("/Encoding") != "/Identity-H" or len(raw) % 2:
            raise ValueError("复合字体不是已支持的 Identity-H 编码")
        descendant = font["/DescendantFonts"][0].get_object()
        codes = [int.from_bytes(raw[i:i + 2], "big") for i in range(0, len(raw), 2)]
        widths = {code: float(descendant.get("/DW", 1000)) for code in codes}
        entries = descendant["/W"] if "/W" in descendant else []
        i = 0
        while i < len(entries):
            first, second = [entry.get_object() for entry in entries[i:i + 2]]
            if isinstance(second, (list, ArrayObject)):
                for code in widths:
                    if first <= code < first + len(second):
                        widths[code] = float(second[code - first])
                i += 2
            else:
                for code in widths:
                    if first <= code <= second:
                        widths[code] = float(entries[i + 2])
                i += 3
        glyph_widths = [widths[code] for code in codes]
        spaces = 0  # Tw 只适用于单字节字符码 32。
    elif font.get("/Subtype") in ("/Type1", "/TrueType", "/MMType1") and "/Widths" in font:
        codes = list(raw)
        widths = font["/Widths"]
        first = int(font.get("/FirstChar", 0))
        if any(not 0 <= code - first < len(widths) for code in codes):
            raise ValueError("字符缺少显式字宽")
        glyph_widths = [float(widths[code - first]) for code in codes]
        spaces = codes.count(32)
    else:
        raise ValueError("字体缺少受支持的显式字宽")
    advance = -(sum(glyph_widths) + 1000 * (len(codes) * char_spacing + spaces * word_spacing) / size)
    span = (sum(abs(width) for width in glyph_widths) * abs(size) / 1000
            + len(codes) * abs(char_spacing) + spaces * abs(word_spacing))
    return FloatObject(advance), span


def _outside(state, tm, span, box):
    """用字体整体包围盒加保守推进范围判断；跨页边界或未知范围一律保留。"""
    if tm is None or not state["geometry_known"]:
        raise ValueError("文字矩阵未知")
    if state["mode"] not in (0, 4):
        raise ValueError("描边或未知渲染模式的页外范围未判定")
    matrix = mult(tm, state["matrix"])
    if matrix[1] or matrix[2]:
        raise ValueError("旋转或斜切文字的页外范围未判定")
    font = state["font"]
    if font.get("/Subtype") == "/Type0":
        font = font["/DescendantFonts"][0].get_object()
    if "/FontDescriptor" not in font or "/FontBBox" not in font["/FontDescriptor"]:
        raise ValueError("字体包围盒未知")
    bbox = font["/FontDescriptor"]["/FontBBox"]
    if len(bbox) != 4 or bbox[0] >= bbox[2] or bbox[1] >= bbox[3]:
        raise ValueError("字体包围盒无有效面积")
    xs = [float(bbox[i]) * state["size"] * state["scale"] * matrix[0] / 1000
          + matrix[4] for i in (0, 2)]
    ys = [(float(bbox[i]) * state["size"] / 1000 + state["rise"]) * matrix[3]
          + matrix[5] for i in (1, 3)]
    extent = span * abs(state["scale"] * matrix[0])
    return (max(xs) + extent < box[0] or min(xs) - extent > box[2]
            or max(ys) < box[1] or min(ys) > box[3])


def filter_invisible_text(page):
    """过滤 Tr 3/7 或绘制通道 alpha 恰为 0 的文字，返回计数与局限。

    也过滤水平/轴对齐且整个保守字体范围明确超出 CropBox/MediaBox 的文字。
    原地替换页面内存 Contents，不改字体、图形、原始文件；隐藏文字转成
    等价数值 TJ，保留文本矩阵推进。只适用于提取，不保留 Tr 7 的字形裁剪。
    """
    report = {"filtered_text_operations": 0, "warnings": []}
    content = page.get_contents()
    if content is None:
        return report
    # 保留所有原始字符码；默认 TextStringObject 再序列化可能改变字体输入字节。
    content = ContentStream(content, page.pdf, forced_encoding="bytes")
    node = page
    while "/Resources" not in node and "/Parent" in node:
        node = node["/Parent"]
    resources = node.get("/Resources", {}).get_object() if "/Resources" in node else {}
    fonts = resources["/Font"] if "/Font" in resources else {}
    states = resources["/ExtGState"] if "/ExtGState" in resources else {}
    xobjects = resources["/XObject"] if "/XObject" in resources else {}
    identity = [1, 0, 0, 1, 0, 0]
    state = {"fill": 1, "stroke": 1, "mode": 0, "font": None,
             "size": 0, "char": 0, "word": 0, "matrix": identity,
             "scale": 1, "rise": 0, "leading": 0, "geometry_known": True}
    stack, operations = [], []
    tm = line = identity
    media, crop = list(page.mediabox), list(page.cropbox)
    box = [max(media[0], crop[0]), max(media[1], crop[1]),
           min(media[2], crop[2]), min(media[3], crop[3])]

    def warn(message):
        if message not in report["warnings"]:
            report["warnings"].append(message)

    for args, op in content.operations:
        if op == b"q":
            stack.append(state.copy())
        elif op == b"Q":
            if stack:
                state = stack.pop()
            else:
                state.update(fill=None, stroke=None, mode=None, font=None, geometry_known=False)
                warn("不平衡的 Q：未知文字状态保留")
        elif op == b"gs":
            if args[0] not in states:
                state.update(fill=None, stroke=None, font=None)
                warn("未知 ExtGState：无法确认的文字保留")
            else:
                gs = states[args[0]].get_object()
                for key, target in (("/ca", "fill"), ("/CA", "stroke")):
                    if key in gs:
                        state[target] = float(gs[key])
                if "/Font" in gs:
                    state["font"] = gs["/Font"][0].get_object()
                    state["size"] = float(gs["/Font"][1])
        elif op == b"Tr":
            state["mode"] = int(args[0])
        elif op == b"Tf":
            state["font"] = fonts[args[0]].get_object() if args[0] in fonts else None
            state["size"] = float(args[1])
        elif op in (b"Tc", b"Tw"):
            state["char" if op == b"Tc" else "word"] = float(args[0])
        elif op == b"cm":
            state["matrix"] = mult([float(v) for v in args], state["matrix"])
        elif op == b"Tz":
            state["scale"] = float(args[0]) / 100
        elif op == b"Ts":
            state["rise"] = float(args[0])
        elif op == b"TL":
            state["leading"] = float(args[0])
        elif op == b"BT":
            tm = line = identity
        elif op == b"Tm":
            tm = line = [float(v) for v in args]
        elif op in (b"Td", b"TD"):
            if op == b"TD":
                state["leading"] = -float(args[1])
            tm = line = mult([1, 0, 0, 1, float(args[0]), float(args[1])], line)
        elif op == b"Do" and args[0] in xobjects:
            # ponytail: Form 可能共享且继承调用状态；需要时再按调用克隆并递归过滤。
            if xobjects[args[0]].get_object().get("/Subtype") == "/Form":
                warn("Form XObject 未过滤；其内部或继承的不可见文字仍需核对")
        if op == b'"':
            state["word"], state["char"] = float(args[0]), float(args[1])
        if op in (b"T*", b"'", b'"'):
            tm = line = mult([1, 0, 0, 1, 0, -state["leading"]], line)
        mode = state["mode"]
        hidden = (mode in (3, 7)
                  or (mode in (0, 4) and state["fill"] == 0)
                  or (mode in (1, 5) and state["stroke"] == 0)
                  or (mode in (2, 6) and state["fill"] == state["stroke"] == 0))
        if op in (b"Tj", b"TJ", b"'", b'"'):
            values = args[0] if op == b"TJ" else [args[-1]]
            try:
                metrics = [
                    _advance(value, state["font"], state["size"], state["char"], state["word"])
                    if isinstance(value, (str, bytes)) else
                    (value, abs(float(value) * state["size"] / 1000)) for value in values]
            except (ValueError, KeyError, IndexError, TypeError, AttributeError) as exc:
                if hidden:
                    warn(f"不可见文字保留（无法确保定位）：{exc}")
                tm = None
            else:
                replacement = ArrayObject([value for value, _ in metrics])
                if not hidden:
                    try:
                        hidden = _outside(state, tm, sum(span for _, span in metrics), box)
                    except (ValueError, KeyError, TypeError, AttributeError) as exc:
                        warn(f"页外文字未判定：{exc}")
                if not any(isinstance(value, (str, bytes)) and value for value in values):
                    hidden = False
                if tm is not None:
                    advance = -sum(float(value) for value in replacement) * state["size"] * state["scale"] / 1000
                    tm = mult([1, 0, 0, 1, advance, 0], tm)
                if not hidden:
                    operations.append((args, op))
                    continue
                if op == b'"':
                    operations.extend([([args[0]], b"Tw"), ([args[1]], b"Tc")])
                if op in (b"'", b'"'):
                    operations.append(([], b"T*"))
                operations.append(([replacement], b"TJ"))
                report["filtered_text_operations"] += 1
                continue
        operations.append((args, op))
    if report["filtered_text_operations"]:
        content.operations = operations
        page[NameObject("/Contents")] = content
    return report
