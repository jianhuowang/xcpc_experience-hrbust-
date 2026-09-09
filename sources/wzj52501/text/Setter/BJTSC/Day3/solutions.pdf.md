# Setter/BJTSC/Day3/solutions.pdf

来源 ID：`wzj52501-854d948f8b6f5966`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Day3/solutions.pdf) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：CC-BY-NC-SA-4.0；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：needs-review；角色：solution。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 仅提取文字，公式、图片、图表、布局与阅读顺序可能缺失或失真；未执行 OCR，引用前核对原件。
- 异常控制字符或不可解码字节已替换为可见标记：U+0014
- 异常控制字符或不可解码字节已替换为可见标记：U+0014
- 异常控制字符或不可解码字节已替换为可见标记：U+0002, U+0014
- 异常控制字符或不可解码字节已替换为可见标记：U+0002, U+0014
- 异常控制字符或不可解码字节已替换为可见标记：U+0000, U+0014
- 异常控制字符或不可解码字节已替换为可见标记：U+0000, U+0014
- 异常控制字符或不可解码字节已替换为可见标记：U+0019
- 异常控制字符或不可解码字节已替换为可见标记：U+0019
- 异常控制字符或不可解码字节已替换为可见标记：U+0019
- 异常控制字符或不可解码字节已替换为可见标记：U+0019

## 物理页 1

```text
. . . . . .
.
..
.
.
.
.
 Beijing Team Practice
wzj52501
Peking University
2019 年 7 月 7 日
wzj52501 Beijing Team Practice
```

## 物理页 2

```text
. . . . . .
..
 Results
wzj52501 Beijing Team Practice
```

## 物理页 3

```text
. . . . . .
..
 stone
wzj52501 Beijing Team Practice
```

## 物理页 4

```text
. . . . . .
..
 Analysis
首先我们应该研究怎样的局面是先手必胜的，根据性质计算方案
数。
这显然是一个组合博弈问题，可以计算出每堆石子的 SG 值异或
起来非 0 的状态就是先手必胜的。
不难发现 k 个石子组成的一堆 SG 值为 k 能够整除的 2 的最高次
幂，用数学归纳法可以很容易验证。
wzj52501 Beijing Team Practice
```

## 物理页 5

```text
. . . . . .
..
 Analysis
首先我们应该研究怎样的局面是先手必胜的，根据性质计算方案
数。
这显然是一个组合博弈问题，可以计算出每堆石子的 SG 值异或
起来非 0 的状态就是先手必胜的。
不难发现 k 个石子组成的一堆 SG 值为 k 能够整除的 2 的最高次
幂，用数学归纳法可以很容易验证。
wzj52501 Beijing Team Practice
```

## 物理页 6

```text
. . . . . .
..
 Analysis
首先我们应该研究怎样的局面是先手必胜的，根据性质计算方案
数。
这显然是一个组合博弈问题，可以计算出每堆石子的 SG 值异或
起来非 0 的状态就是先手必胜的。
不难发现 k 个石子组成的一堆 SG 值为 k 能够整除的 2 的最高次
幂，用数学归纳法可以很容易验证。
wzj52501 Beijing Team Practice
```

## 物理页 7

```text
. . . . . .
..
 25pts
n; m [U+0014] 52501，用一个简单的 DP 即可计算出答案。
时间复杂度为 O(m log2 n)。
wzj52501 Beijing Team Practice
```

## 物理页 8

```text
. . . . . .
..
 25pts
n; m [U+0014] 52501，用一个简单的 DP 即可计算出答案。
时间复杂度为 O(m log2 n)。
wzj52501 Beijing Team Practice
```

## 物理页 9

```text
. . . . . .
..
 50pts
n; m [U+0014] 1018，容易发现上面的 DP 可以改成倍增 DP。
时间复杂度为 O(log m [U+0002] log2 n)。
wzj52501 Beijing Team Practice
```

## 物理页 10

```text
. . . . . .
..
 50pts
n; m [U+0014] 1018，容易发现上面的 DP 可以改成倍增 DP。
时间复杂度为 O(log m [U+0002] log2 n)。
wzj52501 Beijing Team Practice
```

## 物理页 11

```text
. . . . . .
..
 100pts
当 n 很大时我们首先要用高精度计算出 1 到 n 中包含 2 的最高次
幂为 k 的个数，我们发现此时 log n 也达到了 3w 级别，需要优化
倍增 DP 的转移。高精度可能需要压位来提高效率。
我们自然想到用 FWT 优化计算，倍增计算时直接用 FWT 的点积
相乘即可。
时间复杂度为 O( log2 n
! + log m log n)
wzj52501 Beijing Team Practice
```

## 物理页 12

```text
. . . . . .
..
 100pts
当 n 很大时我们首先要用高精度计算出 1 到 n 中包含 2 的最高次
幂为 k 的个数，我们发现此时 log n 也达到了 3w 级别，需要优化
倍增 DP 的转移。高精度可能需要压位来提高效率。
我们自然想到用 FWT 优化计算，倍增计算时直接用 FWT 的点积
相乘即可。
时间复杂度为 O( log2 n
! + log m log n)
wzj52501 Beijing Team Practice
```

## 物理页 13

```text
. . . . . .
..
 100pts
当 n 很大时我们首先要用高精度计算出 1 到 n 中包含 2 的最高次
幂为 k 的个数，我们发现此时 log n 也达到了 3w 级别，需要优化
倍增 DP 的转移。高精度可能需要压位来提高效率。
我们自然想到用 FWT 优化计算，倍增计算时直接用 FWT 的点积
相乘即可。
时间复杂度为 O( log2 n
! + log m log n)
wzj52501 Beijing Team Practice
```

## 物理页 14

```text
. . . . . .
..
 arcana
wzj52501 Beijing Team Practice
```

## 物理页 15

```text
. . . . . .
..
 20pts
很容易在 O(n) 的时间内计算出一段区间的数字和的期望。
时间复杂度为 O(nQ)。
wzj52501 Beijing Team Practice
```

## 物理页 16

```text
. . . . . .
..
 20pts
很容易在 O(n) 的时间内计算出一段区间的数字和的期望。
时间复杂度为 O(nQ)。
wzj52501 Beijing Team Practice
```

## 物理页 17

```text
. . . . . .
..
 extra 40pts
操作二改动极小。
我们发现多维护一些信息就可以进行区间合并，用线段树维护一
下即可。
时间复杂度为 O(Q log n)。
wzj52501 Beijing Team Practice
```

## 物理页 18

```text
. . . . . .
..
 extra 40pts
操作二改动极小。
我们发现多维护一些信息就可以进行区间合并，用线段树维护一
下即可。
时间复杂度为 O(Q log n)。
wzj52501 Beijing Team Practice
```

## 物理页 19

```text
. . . . . .
..
 extra 40pts
操作二改动极小。
我们发现多维护一些信息就可以进行区间合并，用线段树维护一
下即可。
时间复杂度为 O(Q log n)。
wzj52501 Beijing Team Practice
```

## 物理页 20

```text
. . . . . .
..
 100pts
用可持久化 Treap 维护序列就可以支持操作二。
空间限制紧需要定期重构。
时间复杂度为 O(Q log n)。
wzj52501 Beijing Team Practice
```

## 物理页 21

```text
. . . . . .
..
 100pts
用可持久化 Treap 维护序列就可以支持操作二。
空间限制紧需要定期重构。
时间复杂度为 O(Q log n)。
wzj52501 Beijing Team Practice
```

## 物理页 22

```text
. . . . . .
..
 100pts
用可持久化 Treap 维护序列就可以支持操作二。
空间限制紧需要定期重构。
时间复杂度为 O(Q log n)。
wzj52501 Beijing Team Practice
```

## 物理页 23

```text
. . . . . .
..
 permutation
wzj52501 Beijing Team Practice
```

## 物理页 24

```text
. . . . . .
..
 55pts
两类波浪序列是等价的，因为每个第一类序列将 Ai 换成
n [U+0000] Ai + 1 就得到了唯一的一个第二类序列。
设长度为 n 的第一类波浪序列个数为 fn。第一类序列中 n 在 2k
位置的方案为
( n−1
2k−1
)
f2k−1fn−2k，1 在 2k + 1 位置的方案为( n−1
2k
)
f2kfn−2k−1，故 2fn = ∑ ( n−1
k
)
fkfn−1−k + 2[n = 0] + [ n = 1]。
时间复杂度为 O(n2)，分块打表可以做到 n [U+0014] 52501。
wzj52501 Beijing Team Practice
```

## 物理页 25

```text
. . . . . .
..
 55pts
两类波浪序列是等价的，因为每个第一类序列将 Ai 换成
n [U+0000] Ai + 1 就得到了唯一的一个第二类序列。
设长度为 n 的第一类波浪序列个数为 fn。第一类序列中 n 在 2k
位置的方案为
( n−1
2k−1
)
f2k−1fn−2k，1 在 2k + 1 位置的方案为( n−1
2k
)
f2kfn−2k−1，故 2fn = ∑ ( n−1
k
)
fkfn−1−k + 2[n = 0] + [ n = 1]。
时间复杂度为 O(n2)，分块打表可以做到 n [U+0014] 52501。
wzj52501 Beijing Team Practice
```

## 物理页 26

```text
. . . . . .
..
 85pts
可以用分治 FFT 加速 DP 转移。
时空复杂度为 O(n log2 n)。
wzj52501 Beijing Team Practice
```

## 物理页 27

```text
. . . . . .
..
 100pts
考虑 fn 的指数生成函数 A(z)，有 2A′(z) = A(z)2 + 1，且
A(0) = 1 。
2A′(z) = A(z)2 + 1
A′(z)
A(z)2 + 1 = 1
2
@arctan(A(z))
@z = @( z
2 )
@z
A(z) = tan( z
2 + c)
代入 A(0) = 1 得 A(z) = tan( z
2 + [U+0019]
4 ) = 1+sin z
cos z
这样用一个多项式求逆就可以计算出答案。
时间复杂度为 O(n log n)。
wzj52501 Beijing Team Practice
```

## 物理页 28

```text
. . . . . .
..
 100pts
考虑 fn 的指数生成函数 A(z)，有 2A′(z) = A(z)2 + 1，且
A(0) = 1 。
2A′(z) = A(z)2 + 1
A′(z)
A(z)2 + 1 = 1
2
@arctan(A(z))
@z = @( z
2 )
@z
A(z) = tan( z
2 + c)
代入 A(0) = 1 得 A(z) = tan( z
2 + [U+0019]
4 ) = 1+sin z
cos z
这样用一个多项式求逆就可以计算出答案。
时间复杂度为 O(n log n)。
wzj52501 Beijing Team Practice
```

## 物理页 29

```text
. . . . . .
..
 100pts
考虑 fn 的指数生成函数 A(z)，有 2A′(z) = A(z)2 + 1，且
A(0) = 1 。
2A′(z) = A(z)2 + 1
A′(z)
A(z)2 + 1 = 1
2
@arctan(A(z))
@z = @( z
2 )
@z
A(z) = tan( z
2 + c)
代入 A(0) = 1 得 A(z) = tan( z
2 + [U+0019]
4 ) = 1+sin z
cos z
这样用一个多项式求逆就可以计算出答案。
时间复杂度为 O(n log n)。
wzj52501 Beijing Team Practice
```

## 物理页 30

```text
. . . . . .
..
 100pts
考虑 fn 的指数生成函数 A(z)，有 2A′(z) = A(z)2 + 1，且
A(0) = 1 。
2A′(z) = A(z)2 + 1
A′(z)
A(z)2 + 1 = 1
2
@arctan(A(z))
@z = @( z
2 )
@z
A(z) = tan( z
2 + c)
代入 A(0) = 1 得 A(z) = tan( z
2 + [U+0019]
4 ) = 1+sin z
cos z
这样用一个多项式求逆就可以计算出答案。
时间复杂度为 O(n log n)。
wzj52501 Beijing Team Practice
```

## 物理页 31

```text
. . . . . .
..
 THX
Q & A
wzj52501 Beijing Team Practice
```
