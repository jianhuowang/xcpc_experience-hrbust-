# README.md

来源 ID：`wzj52501-b335630551682c19`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/README.md) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：upstream-metadata；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：metadata；角色：metadata。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–61

````text
# awesome-competitive-olympiad-algorithms

[简体中文](README.zh-CN.md)

> A personally curated archive of **original algorithmic problems** and lecture
> notes — every problem authored and set by hand — spanning NOIP through NOI and
> ACM-ICPC level. Centered on the algorithmic craft shared by informatics
> olympiads and ACM-ICPC-style contests: design, analysis, and proof — not
> low-level implementation.

## About

This repository collects materials I created over years of competing and
problem setting in algorithm contests — **all original work**:

- **Lecture slides** — notes prepared for teaching sessions.
- **Original contest problems** — problems I set for the National Olympiad in
  Informatics (NOI), provincial team selection, and mock contests.

Difficulty ranges from NOIP all the way up to NOI and ACM-ICPC level.

Whether you aim for OI, ACM-ICPC, or simply want to study rigorous algorithm
design, I hope this archive offers something useful. **If it does, a star
would mean a lot — and would help more people discover it.**

Each problem is preserved with three artifacts:

- **statement** — the problem description
- **standard solution** — a reference C++ implementation
- **editorial** — the algorithm explained, with correctness and complexity

## Structure

```
.
├── Lectures/   Algorithm lecture slides and notes
└── Setter/     Original problems, grouped by contest
    ├── NOI/    National Olympiad in Informatics
    ├── BJTSC/  Beijing Team Selection Contest
    └── NOIP/   National Olympiad in Informatics in Provinces
```

| Directory | Contents |
|---|---|
| `Lectures/` | Lecture slides and notes on algorithms: data structures, graph theory, number theory, generating functions, and more. |
| `Setter/NOI/` | NOI problems and NOI-level mock contests. |
| `Setter/BJTSC/` | Beijing Team Selection Contests, including the joint provincial selection and related mock rounds. |
| `Setter/NOIP/` | NOIP-level mock contests. |

---

> **Note** — All lecture slides and editorials are written in Chinese.

## License

- **Code** (standard solutions / `.cpp`): [MIT License](LICENSE)
- **Content** (problem statements, editorials, lecture slides): [CC BY-NC-SA 4.0](CONTENT-LICENSE.md)

## Updates

- **upd0909**: Add 12 new lecture slides and the MIT License; complete the missing solutions for BJTSC Mock-1 and NOI Mock-1.
````
