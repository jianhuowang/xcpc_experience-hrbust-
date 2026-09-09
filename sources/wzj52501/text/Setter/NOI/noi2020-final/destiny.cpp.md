# Setter/NOI/noi2020-final/destiny.cpp

来源 ID：`wzj52501-62b2b2aa5956cc74`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/noi2020-final/destiny.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–138

```cpp
#include<cstdio>
#include<cstring>
#include<cctype>
#include<algorithm>
#include<vector>
#define pb push_back
#define mp make_pair
#define xx first
#define yy second
#define rep(i,a,b) for(int i=(a),i##_end_=(b);i<=i##_end_;i++)
#define dwn(i,a,b) for(int i=(a),i##_end_=(b);i>=i##_end_;i--)
using namespace std;
inline int read() {
    int x=0,f=1;char c=getchar();
    for(;!isdigit(c);c=getchar()) if(c=='-') f=-1;
    for(;isdigit(c);c=getchar()) x=x*10+c-'0';
    return x*f;
}
typedef long long ll;
typedef pair<int,int> pii;
const int maxn=1000010;
const int mod=998244353;
const int inv2=499122177;
int n,m,nxt[maxn],first[maxn],to[maxn],deg[maxn],e;
void AddEdge(int u,int v) {
	to[++e]=v;nxt[e]=first[u];first[u]=e;deg[u]++;
	to[++e]=u;nxt[e]=first[v];first[v]=e;deg[v]++;
}
pii s[maxn];
int fa[maxn],dep[maxn],limit[maxn];
void dfs(int x) {
	dep[x]=dep[fa[x]]+1;
	for(int i=first[x];i;i=nxt[i]) if(to[i]!=fa[x]) {
		fa[to[i]]=x;
		dfs(to[i]);
	}
}
const int maxnode=23000010;
int ls[maxnode],rs[maxnode],addv[maxnode],setv[maxnode],mulv[maxnode],ToT;
void pushdown(int x) {
	if(setv[x]<0&&!addv[x]&&mulv[x]==1) return;
	if(!ls[x]) ls[x]=++ToT;
	if(!rs[x]) rs[x]=++ToT;
	if(setv[x]>=0) {
		setv[ls[x]]=setv[rs[x]]=setv[x];
		addv[ls[x]]=addv[rs[x]]=0;
		mulv[ls[x]]=mulv[rs[x]]=1;
		setv[x]=-1;
	}
	if(mulv[x]!=1) {
		addv[ls[x]]=(ll)addv[ls[x]]*mulv[x]%mod;
		mulv[ls[x]]=(ll)mulv[ls[x]]*mulv[x]%mod;
		addv[rs[x]]=(ll)addv[rs[x]]*mulv[x]%mod;
		mulv[rs[x]]=(ll)mulv[rs[x]]*mulv[x]%mod;
		mulv[x]=1;
	}
	if(addv[x]) {
		(addv[ls[x]]+=addv[x])%=mod;
		(addv[rs[x]]+=addv[x])%=mod;
		addv[x]=0;
	}
}
void update(int& x,int l,int r,int ql,int qr,int ty,int v) { // set(ty=0) add(ty=1)
	if(!x) x=++ToT;
	if(ql<=l&&r<=qr) {
		if(!ty) setv[x]=v,addv[x]=0,mulv[x]=1;
		else (addv[x]+=v)%=mod;
	}
	else {
		int mid=l+r>>1;
		pushdown(x);
		if(ql<=mid) update(ls[x],l,mid,ql,qr,ty,v);
		if(qr>mid) update(rs[x],mid+1,r,ql,qr,ty,v);
	}
}
int query(int x,int l,int r,int p) {
	if(setv[x]>=0) return ((ll)setv[x]*mulv[x]%mod+addv[x])%mod;
	int mid=l+r>>1;pushdown(x);
	if(p<=mid) return query(ls[x],l,mid,p);
	else return query(rs[x],mid+1,r,p);
}
int merge(int x,int y) {
	if(!x) return y;
	if(!y) return x;
	if(setv[x]>=0) {
		int val=(ll)setv[x]*mulv[x]%mod+addv[x]%mod;
		mulv[y]=(ll)mulv[y]*val%mod;
		addv[y]=(ll)addv[y]*val%mod;
		return y;
	}
	else if(setv[y]>=0) {
		int val=(ll)setv[y]*mulv[y]%mod+addv[y]%mod;
		mulv[x]=(ll)mulv[x]*val%mod;
		addv[x]=(ll)addv[x]*val%mod;
		return x;
	}
	else {
		pushdown(x);pushdown(y);
		ls[x]=merge(ls[x],ls[y]);
		rs[x]=merge(rs[x],rs[y]);
	}
	return x;
}
int root[maxn];
void dp(int x) {
	if(deg[x]==1&&x!=1) {
		setv[root[x]=++ToT]=0;
		update(root[x],0,2*n,n-dep[x],n-dep[x]+limit[x]-1,0,1);
		addv[root[x]]++;
	}
	else {
		for(int i=first[x];i;i=nxt[i]) if(to[i]!=fa[x]) {
			dp(to[i]);
			root[x]=merge(root[x],root[to[i]]);
		}
		update(root[x],0,2*n,n-dep[x]+limit[x],2*n,0,0);
		int val=query(root[x],0,2*n,n-dep[x]);
		(addv[root[x]]+=val)%=mod;
	}
}
int main() {
	memset(setv,-1,sizeof(setv));
	rep(i,0,maxnode-1) mulv[i]=1;
	freopen("destiny.in","r",stdin);
	freopen("destiny.out","w",stdout);
	n=read();
	rep(i,2,n) AddEdge(read(),read());
	dfs(1);
	rep(i,1,n) limit[i]=n;
	m=read();
	rep(i,1,m) {
		int u=read(),v=read();
		limit[v]=min(limit[v],dep[v]-dep[u]);
	}
	dp(1);
	printf("%d\n",(ll)query(root[1],0,2*n,n-dep[1])*inv2%mod);
	return 0;
}
```
