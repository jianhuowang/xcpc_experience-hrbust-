# Setter/BJTSC/Mock-2/sort.cpp

来源 ID：`wzj52501-c18f5aa9b6ded738`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Mock-2/sort.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–70

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
typedef long long ll;
const int maxn=510;
const int mod=998244353;
int n,m,u[maxn],v[maxn],pa[maxn];
int first[maxn],size[maxn],nxt[maxn],to[maxn],in[maxn],e;
void AddEdge(int u,int v) {
    if(u==v) return;
    to[++e]=v;nxt[e]=first[u];first[u]=e;in[v]++;
}
int findset(int x) {return pa[x]==x?x:pa[x]=findset(pa[x]);}
ll f[maxn][maxn],g[maxn][maxn];
int d[maxn][maxn][maxn];
void init() {
    d[0][0][0]=1;
    rep(i,0,n+1) rep(j,0,n+1) rep(k,max(i,j),i+j) if(i||j) {
        int& ans=d[i][j][k];
        if(i) (ans+=d[i-1][j][k-1])%=mod;
        if(j) (ans+=d[i][j-1][k-1])%=mod;
        if(i&&j) (ans+=d[i-1][j-1][k-1])%=mod;
    }
}
void dp(int x) {
    f[x][0]=1;
    ren if(to[i]!=x) {
        dp(to[i]);
        dwn(j,size[x],0) rep(k,1,size[to[i]]) {
            rep(w,max(j,k),j+k) (g[x][w]+=f[x][j]*f[to[i]][k]%mod*d[j][k][w])%=mod;
        }
        size[x]+=size[to[i]];
        rep(j,0,size[x]) f[x][j]=g[x][j],g[x][j]=0;
    }
    size[x]++;
    dwn(i,size[x],1) f[x][i]=f[x][i-1];
}
int vis[maxn];
int dfs(int x) {
    if(vis[x]<0) return 1;
    vis[x]=-1;
    ren if(!vis[to[i]]&&dfs(to[i])) return 1;
    else if(vis[to[i]]<0) return 1;
    vis[x]=1;
    return 0;
}
int main() {
    scanf("%d%d",&n,&m);char ch[2];
    init();rep(i,1,n) pa[i]=i;
    rep(i,1,m) {
        scanf("%d%s%d",&u[i],ch,&v[i]);
        if(ch[0]=='=') pa[findset(u[i])]=findset(v[i]);
    }
    rep(i,1,m) AddEdge(findset(u[i]),findset(v[i]));
    rep(i,1,n) if(!vis[findset(i)]&&dfs(findset(i)))  {
        puts("0");return 0;
    }
    rep(i,1,n) if(!in[findset(i)]) AddEdge(n+1,findset(i));
    dp(n+1);ll ans=0;
    rep(i,1,n+1) (ans+=f[n+1][i])%=mod;
    printf("%lld\n",ans);
    return 0;
}
```
