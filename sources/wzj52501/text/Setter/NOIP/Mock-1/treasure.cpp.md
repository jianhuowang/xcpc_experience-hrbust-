# Setter/NOIP/Mock-1/treasure.cpp

来源 ID：`wzj52501-9d7f43f2dc297ce5`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOIP/Mock-1/treasure.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–87

```cpp
#include<cstdio>
#include<cstring>
#include<cctype>
#include<algorithm>
#define xx first
#define yy second
#define mp make_pair
#define rep(i,s,t) for(int i=s;i<=t;i++)
#define dwn(i,s,t) for(int i=s;i>=t;i--)
using namespace std;
inline int read() {
    int x=0,f=1;char c=getchar();
    for(;!isdigit(c);c=getchar()) if(c=='-') f=-1;
    for(;isdigit(c);c=getchar()) x=x*10+c-'0';
    return x*f;
}
typedef pair<int,int> pii;
typedef long long ll;
const int maxn=510;
const int inf=1e9;
const int maxk=17;
const int mx[]={1,-1,0,0};
const int my[]={0,0,1,-1};
int n,m,k,T,cnt;
pii A[maxk];
int num[maxn][maxn],vis[maxn][maxn],d[maxn][maxn];
int f[maxk][maxk];
char M[maxn][maxn];
int Q[maxn*maxn];
void bfs(int x,int y,int u) {
	int l=1,r=0;
	memset(vis,0,sizeof(vis));d[x][y]=0;
	vis[x][y]=1;Q[++r]=(x-1)*m+y;
	while(l<=r) {
		x=(Q[l]-1)/m+1;
		y=(Q[l++]-1)%m+1;
		rep(dir,0,3) {
			int nx=x+mx[dir],ny=y+my[dir];
			if(nx>=1&&ny>=1&&nx<=n&&ny<=m&&M[nx][ny]!='#'&&!vis[nx][ny]) {
				d[nx][ny]=d[x][y]+1;
				Q[++r]=(nx-1)*m+ny;
				vis[nx][ny]=1;
			}
		}
	}
	rep(i,0,cnt) {
		if(vis[A[i].xx][A[i].yy]) f[u][i]=d[A[i].xx][A[i].yy];
		else f[u][i]=inf;
	}
}
int g[maxk][1<<maxk];
int best[maxk];
int main() {
	freopen("treasure.in","r",stdin);
	freopen("treasure.out","w",stdout);
	n=read();m=read();k=read();T=read();
	rep(i,1,n) scanf("%s",M[i]+1);
	memset(num,-1,sizeof(num));
	rep(i,1,n) rep(j,1,m) {
		if(M[i][j]=='*') {
			A[++cnt]=mp(i,j);
			num[i][j]=cnt;
		}
		if(M[i][j]=='S') A[0]=mp(i,j),num[i][j]=0;
	}
	rep(i,1,n) rep(j,1,m) if(num[i][j]>=0) bfs(i,j,num[i][j]);
	cnt++;
	rep(i,0,cnt-1) rep(j,0,(1<<cnt)-1) g[i][j]=inf;
	g[0][1]=0;
	rep(S,0,(1<<cnt)-1) {
		rep(i,0,cnt-1) {
			int& ans=g[i][S];if(ans==inf) continue;
			rep(j,0,cnt-1) if(!(S>>j&1)) g[j][S^(1<<j)]=min(g[j][S^(1<<j)],ans+f[i][j]);
		}
	}
	int ans=0;
	rep(i,0,cnt) best[i]=inf;
	rep(S,0,(1<<cnt)-1) {
		int k=0,mn=inf;
		rep(i,0,cnt-1) if(S>>i&1) k++;
		rep(i,0,cnt-1) mn=min(mn,g[i][S]);
		if(mn<=T) ans=max(ans,k-1);
		best[k-1]=min(best[k-1],mn);
	}
	printf("%d\n",ans);
	return 0;
}
```
