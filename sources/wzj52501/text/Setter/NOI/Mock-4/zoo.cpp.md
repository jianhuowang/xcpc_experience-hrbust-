# Setter/NOI/Mock-4/zoo.cpp

来源 ID：`wzj52501-53c39980b0591b74`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Mock-4/zoo.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–108

```cpp
#include<cstdio>
#include<cstring>
#include<cctype>
#include<algorithm>
#define rep(i,s,t) for(int i=s;i<=t;i++)
#define dwn(i,s,t) for(int i=s;i>=t;i--)
using namespace std;
typedef long long ll;
const int maxn=310010;
const int mod=998244353;
int to[maxn][26],fa[maxn],l[maxn],pos[maxn],last=1,cnt=1;
void extend(int c,int v) {
	int p,q,np,nq;p=last;l[last=np=++cnt]=l[p]+1;pos[v]=np;
	for(;!to[p][c];p=fa[p]) to[p][c]=np;
	if(!p) fa[np]=1;
	else {
		q=to[p][c];
		if(l[p]+1==l[q]) fa[np]=q;
		else {
			l[nq=++cnt]=l[p]+1;
			memcpy(to[nq],to[q],sizeof(to[q]));
			fa[nq]=fa[q];fa[q]=fa[np]=nq;
			for(;to[p][c]==q;p=fa[p]) to[p][c]=nq;
		}
	}
}
char s[maxn];
int n,first[maxn],nxt[maxn],To[maxn],e;
void AddEdge(int u,int v) {To[++e]=v;nxt[e]=first[u];first[u]=e;}
int top[maxn],p[maxn],son[maxn],siz[maxn],ToT,num[maxn];
void dfs(int x) {
	siz[x]=1;
	for(int i=first[x];i;i=nxt[i]) {
		dfs(To[i]);siz[x]+=siz[To[i]];
		if(siz[son[x]]<siz[To[i]]) son[x]=To[i];
	}
}
void build(int x,int tp) {
	top[x]=tp;p[x]=++ToT;num[ToT]=x;
	if(son[x]) build(son[x],tp);
	for(int i=first[x];i;i=nxt[i]) if(To[i]!=son[x]) build(To[i],To[i]);
}
int sumv[maxn<<2],suml[maxn<<2],addv[maxn<<2];
void build(int o,int L,int R) {
	if(L==R) suml[o]=l[num[L]]-l[fa[num[L]]];
	else {
		int mid=L+R>>1,lc=o<<1,rc=lc|1;
		build(lc,L,mid);build(rc,mid+1,R);
		suml[o]=(suml[lc]+suml[rc])%mod;
	}
}
void maintain(int o,int l,int r) {
	if(l<r) sumv[o]=(sumv[o*2]+sumv[o*2+1])%mod;
	else sumv[o]=0;
	(sumv[o]+=(ll)addv[o]*suml[o]%mod)%=mod;
}
void update(int o,int l,int r,int ql,int qr) {
	if(ql<=l&&r<=qr) addv[o]++;
	else {
		int mid=l+r>>1,lc=o<<1,rc=lc|1;
		if(ql<=mid) update(lc,l,mid,ql,qr);
		if(qr>mid) update(rc,mid+1,r,ql,qr);
	}
	maintain(o,l,r);
}
int query(int o,int l,int r,int ql,int qr,int add) {
	if(ql<=l&&r<=qr) return ((ll)add*suml[o]%mod+sumv[o])%mod;
	int mid=l+r>>1,lc=o<<1,rc=lc|1,res=0;
	if(ql<=mid) (res+=query(lc,l,mid,ql,qr,add+addv[o]))%=mod;
	if(qr>mid) (res+=query(rc,mid+1,r,ql,qr,add+addv[o]))%=mod;
	return res%mod;
}
int query(int x) {
	int ans=0,f=top[x];
	while(f!=1) {
		(ans+=query(1,1,cnt,p[f],p[x],0))%=mod;
		x=fa[f];f=top[x];
	}
	(ans+=query(1,1,cnt,1,p[x],0))%=mod;
	return ans;
}
void update(int x) {
	int f=top[x];
	while(f!=1) {
		update(1,1,cnt,p[f],p[x]);
		x=fa[f];f=top[x];
	}
	update(1,1,cnt,1,p[x]);
}
ll Res[maxn];
int main() {
	freopen("zoo.in","r",stdin);
	freopen("zoo.out","w",stdout);
	scanf("%s",s+1);n=strlen(s+1);
	rep(i,1,n) extend(s[i]-'a',i);
	rep(i,2,cnt) AddEdge(fa[i],i);
	dfs(1);build(1,1);build(1,1,cnt);
	int ans=0,res=0;
	rep(i,1,n) {
		update(pos[i]);
		(res+=query(pos[i]))%=mod;
		(ans+=res)%=mod;
		(Res[i]+=ans)%=mod;
	}
	int Q,x;scanf("%d",&Q);
	while(Q--) scanf("%d",&x),printf("%lld\n",Res[x]);
	return 0;
}
```
