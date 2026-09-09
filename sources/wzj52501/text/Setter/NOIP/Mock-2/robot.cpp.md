# Setter/NOIP/Mock-2/robot.cpp

来源 ID：`wzj52501-9c36a6c27c589aa5`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOIP/Mock-2/robot.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–103

```cpp
#include<cstdio>
#include<cstring>
#include<cctype>
#include<algorithm>
#define rep(i,s,t) for(int i=s;i<=t;i++)
#define dwn(i,s,t) for(int i=s;i>=t;i--)
using namespace std;
inline int read() {
    int x=0,f=1;char c=getchar();
    for(;!isdigit(c);c=getchar()) if(c=='-') f=-1;
    for(;isdigit(c);c=getchar()) x=x*10+c-'0';
    return x*f;
}
typedef long long ll;
const int maxn=160010;
int n,m,first[maxn],next[maxn<<1],to[maxn<<1],e;
void AddEdge(int u,int v) {
	to[++e]=v;next[e]=first[u];first[u]=e;
	to[++e]=u;next[e]=first[v];first[v]=e;
}
int anc[maxn][20],dep[maxn],st[maxn],en[maxn],cnt;
void dfs(int x) {
	st[x]=++cnt;dep[x]=dep[anc[x][0]]+1;
	rep(i,1,19) anc[x][i]=anc[anc[x][i-1]][i-1];
	for(int i=first[x];i;i=next[i]) if(to[i]!=anc[x][0]) {
		anc[to[i]][0]=x;dfs(to[i]);
	}
	en[x]=cnt;
}
int swim(int x,int k) {
	k=min(k,dep[x]-1);
	dwn(i,19,0) if(k>>i&1) x=anc[x][i];
	return x;
}
int addv[maxn<<2],setv[maxn<<2],p[maxn],A[maxn];
void build(int o,int l,int r) {
	if(l==r) setv[o]=p[l];
	else {
		int mid=l+r>>1,lc=o<<1,rc=lc|1;
		build(lc,l,mid);build(rc,mid+1,r);
	}
}
void pushdown(int o) {
	int lc=o<<1,rc=lc|1;
	if(setv[o]) {
		addv[lc]=addv[rc]=0;
		setv[lc]=setv[rc]=setv[o];
		setv[o]=0;
	}
	if(addv[o]) {
		addv[lc]+=addv[o];
		addv[rc]+=addv[o];
		addv[o]=0;
	}
}
void update(int o,int l,int r,int ql,int qr,int t,int v) {//t=1 -> set, t=2 -> add
	if(ql<=l&&r<=qr) {
		if(t==1) addv[o]=0,setv[o]=v;
		else addv[o]+=v; 
	}
	else {
		pushdown(o);
		int mid=l+r>>1,lc=o<<1,rc=lc|1;
		if(ql<=mid) update(lc,l,mid,ql,qr,t,v);
		if(qr>mid) update(rc,mid+1,r,ql,qr,t,v);
	}
}
int query(int o,int l,int r,int p) {
	if(l==r) return swim(setv[o],addv[o]);
	pushdown(o);
	int mid=l+r>>1,lc=o<<1,rc=lc|1;
	if(p<=mid) return query(lc,l,mid,p);
	return query(rc,mid+1,r,p);
}
struct Fenwich {
	ll sumv[maxn];
	Fenwich() {memset(sumv,0,sizeof(sumv));}
	void add(int x,int v) {for(;x<=n;x+=x&-x) sumv[x]+=v;}
	ll sum(int x) {ll res=0;for(;x;x-=x&-x) res+=sumv[x];return res;}
}T1,T2;
int main() {
	freopen("robot.in","r",stdin);
	freopen("robot.out","w",stdout);
	n=read();m=read();
	rep(i,2,n) AddEdge(read(),read());
	rep(i,1,m) p[i]=read();
	dfs(1);build(1,1,m);
	dwn(i,read(),1) {
		int t=read();
		if(t==1||t==2) {
			int l=read(),r=read(),x=read();
			update(1,1,m,l,r,t,x);
		}
		else {
			int k=read(),x=query(1,1,m,k),v=(A[x]?-1:1);
			printf("%lld\n",T2.sum(en[x])-T2.sum(st[x]-1)-(ll)dep[x]*(T1.sum(en[x])-T1.sum(st[x]-1)));
			T1.add(st[x],v);T2.add(st[x],v*dep[x]);
			A[x]^=1;
		}
	}
	return 0;
}

```
