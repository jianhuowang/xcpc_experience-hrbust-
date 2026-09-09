# Setter/BJTSC/Day1/farewell.cpp

来源 ID：`wzj52501-9cfac658891c1ac4`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Day1/farewell.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–283

```cpp
#include <cstdio>
#include <algorithm>
#include <cassert>
#include <vector>
using namespace std;

#define iter(i, n) for (int i = 1; i <= n; ++i)
#define iter0(i, n) for (int i = 0; i < n; ++i)
#define forw(i, a, b) for (int i = a; i <= b; ++i)

#define u t[x]
#define o t[y]
#define ulfc t[u.lc]
#define urtc t[u.rc]
#define olfc t[o.lc]
#define ortc t[o.rc]

typedef pair<int, int> pii;
#define fi first
#define se second

const int NR = 510;

int dx[] = { -1,  0, +1,  0 };
int dy[] = {  0, +1,  0, -1 };

int n, m, q, tsz;
bool init[NR][NR][4];
int node[NR][NR][4];

struct Edge {
	int x, y, d;
	Edge() { x = y = d = 0; }
	Edge(int x, int y, int d) : x(x), y(y), d(d) {}
} ev[NR * NR * 5];
struct Node {
	int lc, rc, par, sz;
	unsigned pri;
	Edge e;

	Node(Edge e = Edge()) : e(e) {
		lc = rc = par = 0;
		pri = rand() + 1;
		sz = 1;
	}
} t[20001000];

bool operator==(Edge a, Edge b) {
	return a.x == b.x && a.y == b.y && a.d == b.d;
}

int new_node(Edge e) { t[node[e.x][e.y][e.d] = ++tsz] = Node(e); return tsz; }
bool existc(int x, int y, int d) {
	int _x = x + dx[d], _y = y + dy[d];
	if ((0 <= x && x <= n) && (0 <= y && y <= m) && (0 <= _x && _x <= n) && (0 <= _y && _y <= m))
		return node[x][y][d] != 0;
	return false;
}
bool existo(int x, int y, int d) {
	int _x = x + dx[d], _y = y + dy[d];
	if ((0 <= x && x <= n) && (0 <= y && y <= m) && (0 <= _x && _x <= n) && (0 <= _y && _y <= m))
		return init[x][y][d];
	return false;
}
#define existf(e) (node[e.x][e.y][e.d] != 0)
void upd(int x) { u.sz = ulfc.sz + urtc.sz + 1; }

pair<Edge, Edge> medge(int x0, int y0, int x1, int y1) {
	//bool fi
	iter0(d, 4) {
		int _x = x0 + dx[d], _y = y0 + dy[d];
		if (x1 == _x && y1 == _y) {
			if (d < 2) return make_pair(Edge(x0, y0, d), Edge(x1, y1, (d + 2) % 4));
			else return make_pair(Edge(x1, y1, (d + 2) % 4), Edge(x0, y0, d));
		}
	}
	assert(0);
}

int join(int x, int y) {
	if (x == 0 || y == 0) return x + y;
	if (u.pri > o.pri) {
		u.rc = join(u.rc, y); urtc.par = x; upd(x);
		return x;
	} else {
		o.lc = join(x, o.lc); olfc.par = y; upd(y);
		return y;
	}
}

pii split(int x, int k) {
	if (k == 0) return u.par = 0, pii(0, x);
	assert(k <= u.sz);
	
	assert(x);
	
	if (k <= ulfc.sz) {
		ulfc.par = 0; pii tmp = split(u.lc, k); int y = tmp.se; u.lc = y;
		if (y) o.par = x; 
		u.par = 0; upd(x);
		return pii(tmp.fi, x);
	} else {
		urtc.par = 0; pii tmp = split(u.rc, k - ulfc.sz - 1); int y = tmp.fi; u.rc = y;
		if (y) o.par = x; 
		u.par = 0; upd(x);
		return pii(x, tmp.se);
	}
}

/*void print_(int x) {
	if (x == 0) return;
	print_(u.lc);
	printf("(%d %d %d) ", u.e.x, u.e.y, u.e.d);
	print_(u.rc);
}

void print(int x) { print_(x); puts(""); }*/

int frank(int x) {
	int k = ulfc.sz + 1;
	for (; u.par; x = u.par) {
		if (t[u.par].rc == x) k += t[t[u.par].lc].sz + 1;
		else assert(t[u.par].lc == x);
	}
	return k;
}
int frank(Edge e) { return frank(node[e.x][e.y][e.d]); }
int froot(int x) { for (; u.par; x = u.par); return x; }
int froot(Edge e) { return froot(node[e.x][e.y][e.d]); }

int build(const vector<Edge> &ev) {
	int x = 0;
	for (int i = 0; i < ev.size(); ++i) {
		int y = new_node(ev[i]);
		x = join(x, y);
	}
	return x;
}

Edge suco(Edge e) {
	int x = e.x, y = e.y, d = e.d;
	int _x = x + dx[d], _y = y + dy[d];
	if (existo(_x, _y, (d + 1) % 4)) return Edge(_x, _y, (d + 1) % 4);
	else if (existo(_x, _y, d)) return Edge(_x, _y, d);
	else if (existo(_x, _y, (d + 3) % 4)) return Edge(_x, _y, (d + 3) % 4);
	else return Edge(_x, _y, (d + 2) % 4);
}

Edge succ(Edge e) {
	int x = e.x, y = e.y, d = e.d;
	int _x = x + dx[d], _y = y + dy[d];
	if (existc(_x, _y, (d + 1) % 4)) return Edge(_x, _y, (d + 1) % 4);
	else if (existc(_x, _y, d)) return Edge(_x, _y, d);
	else if (existc(_x, _y, (d + 3) % 4)) return Edge(_x, _y, (d + 3) % 4);
	else return Edge(_x, _y, (d + 2) % 4);
}

Edge prev(Edge e) {
	int x = e.x, y = e.y, d = e.d;
	int d3 = (d + 3) % 4, d1 = (d + 1) % 4;
	if (existc(x - dx[d3], y - dy[d3], d3)) return Edge(x - dx[d3], y - dy[d3], d3);
	else if (existc(x - dx[d], y - dy[d], d)) return Edge(x - dx[d], y - dy[d], d);
	else if (existc(x - dx[d1], y - dy[d1], d1)) return Edge(x - dx[d1], y - dy[d1], d1);
	else return Edge(x + dx[d], y + dy[d], (d + 2) % 4);
}

void walk(Edge e) {
	vector<Edge> ev;
	while (!node[e.x][e.y][e.d]) {
		ev.push_back(e);
		node[e.x][e.y][e.d] = 1;
		e = suco(e);
	}
	build(ev);
}

int make_head(int x) {
	pair<int, int> tmp = split(froot(x), frank(x) - 1);
	return join(tmp.se, tmp.fi);
}
int make_head(Edge e) { return make_head(node[e.x][e.y][e.d]); }


int ask(Edge a, Edge b) {
	int ra = make_head(a), rb = froot(b);
	//print(ra);
	if (ra != rb) return -1;
	return frank(b) - 1;
}

int add(Edge e0, Edge e1) {
	assert(!existf(e0) && !existf(e1));
	Edge p0 = prev(e0), s0 = succ(e0);
	Edge p1 = prev(e1), s1 = succ(e1);

	if (!existf(p0) && !existf(s0)) {
		vector<Edge> vt; vt.push_back(e0); vt.push_back(e1);
		return build(vt);
	} else if (existf(p0) && existf(s0)) {
		int r = make_head(s1);
		if (froot(s0) != r) {
			r = join(r, new_node(e0));
			r = join(r, make_head(s0));
			return join(r, new_node(e1));
		} else {
			pii tmp = split(r, frank(s0) - 1);
			join(tmp.fi, new_node(e1));
			return join(tmp.se, new_node(e0));
		}
	} else {
		if (!existf(p0)) swap(p0, p1), swap(s0, s1), swap(e0, e1);
		vector<Edge> vt; vt.push_back(e0); vt.push_back(e1);
		int ro = make_head(s1);
		return join(build(vt), ro);
	}
}

int del(Edge e0, Edge e1) {
	assert(existf(e0) && existf(e1));
	
	int t0 = node[e0.x][e0.y][e0.d], t1 = node[e1.x][e1.y][e1.d];
	node[e0.x][e0.y][e0.d] = node[e1.x][e1.y][e1.d] = 0;
	Edge p0 = prev(e0), s0 = succ(e0);
	Edge p1 = prev(e1), s1 = succ(e1);
	if (!existf(p0) && !existf(s0)) {
		return 0;
	} else if (existf(p0) && existf(s0)) {
		if (froot(t0) == froot(t1)) {
			int r0 = make_head(s0);
			assert(frank(t0) == t[r0].sz);
			//printf("?? %d %d\n", froot(t0), froot(t1));
			int r = split(r0, frank(t0) - 1).fi;
			//printf("??? %d %d %d\n", r, froot(t1), froot(t0));
			pii tmp = split(r, frank(t1) - 1);
			return tmp.fi ? tmp.fi : tmp.se;
		} else {
			int r0 = make_head(t0);
			int r1 = make_head(s1);
			r0 = split(r0, 1).se;
			r1 = split(r1, frank(t1) - 1).fi;
			return join(r0, r1);
		}
	} else {
		//printf("%d %d %d %d\n", froot(t0), froot(t1), frank(t0), frank(t1));
		//assert(abs(frank(t0) - frank(t1)) == 1);
		if (!existf(p0)) swap(p0, p1), swap(s0, s1), swap(t0, t1), swap(e0, e1);
		return split(make_head(t0), 2).se;
	}
}

int main() {
	freopen("farewell.in", "r", stdin);
	freopen("farewell.out", "w", stdout);

	scanf("%d%d%d", &n, &m, &q); t[0].sz = 0;
	iter(i, n) iter(j, m - 1) {
		int tmp; scanf("%d", &tmp);
		if (tmp == 1) init[i][j][0] = init[i - 1][j][2] = true;
	}
	iter(i, n - 1) iter(j, m) {
		int tmp; scanf("%d", &tmp);
		if (tmp == 1) init[i][j][3] = init[i][j - 1][1] = true;
	}
	iter(i, n) init[i][0][0] = init[i][m][0] = init[i-1][0][2] = init[i-1][m][2] = true;
	iter(i, m) init[0][i][3] = init[n][i][3] = init[0][i-1][1] = init[n][i-1][1] = true;

	forw(i, 0, n) forw(j, 0, m) iter0(d, 4) if (init[i][j][d] && !node[i][j][d]) walk(Edge(i, j, d));	

	iter(i, q) {
		int op, x0, y0, x1, y1, d0, d1;
		scanf("%d%d%d%d%d", &op, &x0, &y0, &x1, &y1);
		pair<Edge, Edge> ep = medge(x0, y0, x1, y1);
		if (op == 1) add(ep.fi, ep.se);
		else if (op == 2) del(ep.fi, ep.se);
		else {
			scanf("%d%d%d%d%d%d", &d0, &x0, &y0, &x1, &y1, &d1);
			pair<Edge, Edge> eq = medge(x0, y0, x1, y1);
			Edge a = d0 == 0 ? ep.se : ep.fi, b = d1 == 0 ? eq.se : eq.fi;
			printf("%d\n", ask(a, b));
		}
	}
	return 0;
}
```
