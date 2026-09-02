# 投稿 Schema

## 文件名

使用 `YYYYMMDD-author-short-title.md`，文件名去掉 `.md` 后即稳定条目 ID。

## Frontmatter

```yaml
---
kind: algorithm
topics: graph, shortest-path
evidence: repeated-practice
authors: "@alice"
reviewers: "@senior"
status: active
updated: 2026-09-02
related: 20260820-bob-dijkstra-debugging
---
```

- `kind`：`algorithm / implementation / debugging / contest / team / training`
- `evidence`：`single-case / repeated-practice / source-backed / team-consensus`
- `status`：`active / deprecated`
- `topics`、`authors`、`reviewers` 可用英文逗号分隔多项
- `reviewers` 至少包含一位非作者
- `related` 可省略或填写逗号分隔的稳定条目 ID

## 公共正文

每个章节必须有实际内容：

```markdown
# 标题

## 经验结论
## 适用信号
## 常见 blocker 或失败症状
## 原因与原理
## 验证方式
## 边界与反例
## 来源
```

`来源` 至少一项；外部链接必须使用 HTTPS。

## 类型扩展

| kind | 额外必需章节 |
|---|---|
| `algorithm / implementation / debugging` | `核心模型或不变量`、`复杂度与约束`、`实现风险`、`迁移识别` |
| `contest / team` | `技术层复盘`、`团队信息层复盘`、`现场决策层复盘`、`应保留的做法`、`下一次实验` |
| `training` | `暴露的问题`、`训练动作`、`完成标准`、`复测结果` |

算法类条目可另加 `H1`、`H2`、`H3`，分别保存方向、关键观察和完整解法。
