# Setter/BJTSC/Mock-2/mission.cpp

来源 ID：`wzj52501-ad29c2e7ea08ca77`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Mock-2/mission.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–106

```cpp
#include<cstdio>
#include<cctype>
#include<queue>
#include<cmath>
#include<cstring>
#include<algorithm>
#define rep(i,s,t) for(int i=s;i<=t;i++)
#define dwn(i,s,t) for(int i=s;i>=t;i--)
#define ren for(int i=first[x];i;i=next[i])
using namespace std;
inline int read() {
    int x=0,f=1;char c=getchar();
    for(;!isdigit(c);c=getchar()) if(c=='-') f=-1;
    for(;isdigit(c);c=getchar()) x=x*10+c-'0';
    return x*f;
}
const int maxn=10010;
const int MAXN=300010;
const int MAXM=1000010;
struct Dinic {
    int n,m,s,t,first[MAXN],next[MAXM];
    struct Edge {int from,to,flow;}edges[MAXM];
    int q[MAXN],cur[MAXN],d[MAXN],vis[MAXN],clo;
    Dinic() {memset(first,-1,sizeof(first));}
    void AddEdge(int u,int v,int w) {
        edges[m]=(Edge){u,v,w};next[m]=first[u];first[u]=m++;
        edges[m]=(Edge){v,u,0};next[m]=first[v];first[v]=m++;
    }
    int BFS() {
        int l=1,r=0;q[++r]=s;vis[s]=++clo;
        while(l<=r) {
            int x=q[l++];cur[x]=first[x];
            for(int i=first[x];i!=-1;i=next[i]) {
                Edge& e=edges[i];
                if(e.flow&&vis[e.to]!=clo) {
                    vis[e.to]=clo;
                    d[e.to]=d[x]+1;
                    q[++r]=e.to;
                }
            }
        }
        return vis[t]==clo;
    }
    int DFS(int x,int a) {
        if(x==t||!a) return a;
        int flow=0,f;
        for(int& i=cur[x];i!=-1;i=next[i]) {
            Edge& e=edges[i];
            if(d[e.to]==d[x]+1&&(f=DFS(e.to,min(a,e.flow)))) {
                e.flow-=f;edges[i^1].flow+=f;
                flow+=f;a-=f;if(!a) break;
            }
        }
        return flow;
    }
    int solve(int s,int t) {
        this->s=s;this->t=t;int flow=0;
        while(BFS()) flow+=DFS(s,1e9);
        return flow;
    }
}sol;
int n,m,first[maxn],next[maxn],to[maxn],e;
void AddEdge(int u,int v) {
    to[++e]=v;next[e]=first[u];first[u]=e;
}
int s,t,root[MAXN],ls[MAXN],rs[MAXN],ToT;
void insert(int v) {
    int l=1,r=n;ToT++;
    while(l<r) {
        int mid=l+r>>1;
        if(v<=mid) sol.AddEdge(ToT,ls[ToT]=ToT+1,1e9),r=mid;
        else sol.AddEdge(ToT,rs[ToT]=ToT+1,1e9),l=mid+1;
        ToT++;
    }
    sol.AddEdge(ToT,t,1);
}
int merge(int x,int y,int l,int r) {
    if(x*y==0) return x+y;
    int o=++ToT,mid=l+r>>1;
    if(l==r) sol.AddEdge(o,x,1e9),sol.AddEdge(o,y,1e9);
    else {
        sol.AddEdge(o,ls[o]=merge(ls[x],ls[y],l,mid),1e9);
        sol.AddEdge(o,rs[o]=merge(rs[x],rs[y],mid+1,r),1e9);
    }
    return o;
}
void dfs(int x) {ren dfs(to[i]),root[x]=merge(root[x],root[to[i]],1,n);}
void query(int o,int l,int r,int ql,int qr) {
    if(!o) return;if(ql<=l&&r<=qr) sol.AddEdge(ToT,o,1e9);
    else {
        int mid=l+r>>1;
        if(ql<=mid) query(ls[o],l,mid,ql,qr);
        if(qr>mid) query(rs[o],mid+1,r,ql,qr);
    }
}
int main() {
	n=read();m=read();s=1;t=ToT=2;
    rep(i,2,n) AddEdge(read(),i);
    rep(i,1,n) root[i]=ToT+1,insert(read());
    dfs(1);while(m--) {
        int l=read(),r=read(),x=read(),k=read();
        sol.AddEdge(s,++ToT,k);query(root[x],1,n,l,r);
    }
    printf("%d\n",sol.solve(s,t));
    return 0;
}
```
