# Setter/BJTSC/Mock-2/path.cpp

来源 ID：`wzj52501-df7a44daba7677ba`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Mock-2/path.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–86

```cpp
#include<cstdio>
#include<cctype>
#include<queue>
#include<cmath>
#include<cstring>
#include<algorithm>
#define rep(i,s,t) for(int i=s;i<=t;i++)
#define dwn(i,s,t) for(int i=s;i>=t;i--)
#define ren for(int i=first[x];i;i=nxt[i])
using namespace std;
inline int read() {
    int x=0,f=1;char c=getchar();
    for(;!isdigit(c);c=getchar()) if(c=='-') f=-1;
    for(;isdigit(c);c=getchar()) x=x*10+c-'0';
    return x*f;
}
typedef long long ll;
const int maxn=600010;
int n,m,e,first[maxn],nxt[maxn<<1],to[maxn<<1];
void AddEdge(int u,int v) {
    to[++e]=v;nxt[e]=first[u];first[u]=e;
    to[++e]=u;nxt[e]=first[v];first[v]=e;
}
int anc[maxn][20],dep[maxn],st[maxn],en[maxn],ToT;
void dfs(int x,int fa) {
    anc[x][0]=fa;rep(i,1,19) anc[x][i]=anc[anc[x][i-1]][i-1];
    dep[x]=dep[fa]+1;st[x]=++ToT;
    ren if(to[i]!=fa) dfs(to[i],x);
    en[x]=ToT;
}
int swim(int x,int k) {
    rep(i,0,19) if(k>>i&1) x=anc[x][i];
    return x;
}
struct Rect {
    int x,l,r,val;
    bool operator < (const Rect& ths) const {return x<ths.x;}
}A[maxn<<2];
struct Point {
    int x,y;
    bool operator < (const Point& ths) const {return x<ths.x||(x==ths.x&&y<ths.y);}
}B[maxn];
int N,M;
void AddRect(int x,int y,int l,int r) {
    if(x>y||l>r) return;
    if(x<l) swap(x,l),swap(y,r);
    A[++N]=(Rect){x,l,r,1};A[++N]=(Rect){y+1,l,r,-1};
}
void AddPoint(int x,int y) {
    if(x<y) swap(x,y);
    B[++M]=(Point){x,y};
}
int sumv[maxn];
int query(int x) {int res=0;for(;x;x-=x&-x) res+=sumv[x];return res;}
void add(int x,int v) {for(;x<=n;x+=x&-x) sumv[x]+=v;}
ll ans;
int main() {
    n=read();m=read();
    rep(i,2,n) AddEdge(read(),read());
    dfs(1,0);
    rep(i,1,m) {
        int u=read(),v=read();AddPoint(st[u],st[v]);
        if(dep[u]<dep[v]) swap(u,v);
        if(u==v) AddRect(st[u],en[u],1,st[u]),AddRect(st[u],en[u],en[u]+1,n);
        else if(st[u]>=st[v]&&st[u]<=en[v]) {
            v=swim(u,dep[u]-dep[v]-1);
            AddRect(st[u],en[u],1,st[v]-1);
            AddRect(st[u],en[u],en[v]+1,n);
        }
        else AddRect(st[u],en[u],st[v],en[v]);
    }
    sort(A+1,A+N+1);sort(B+1,B+M+1);int j=1;
    rep(i,1,M) {
        while(j<=N&&A[j].x<=B[i].x) add(A[j].l,A[j].val),add(A[j].r+1,-A[j].val),j++;
        ans+=query(B[i].y);
    }
    rep(i,1,M) {
        int j=i;
        while(j<=M&&B[j].x==B[i].x&&B[j].y==B[i].y) j++;j--;
        ans-=(ll)(j-i+1)*(j-i)/2;
        i=j;
    }
    ans-=m;ll ans2=(ll)m*(m-1)/2;
    printf("%.6lf\n",ans*1.0/ans2);
    return 0;
}
```
