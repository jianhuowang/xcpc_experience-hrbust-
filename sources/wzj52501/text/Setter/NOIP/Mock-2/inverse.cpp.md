# Setter/NOIP/Mock-2/inverse.cpp

来源 ID：`wzj52501-15472fa45b9b5d3a`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOIP/Mock-2/inverse.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–53

```cpp
#include<cstdio>
#include<cstring>
#include<cctype>
#include<algorithm>
using namespace std;
#define rep(i,s,t) for(int i=s;i<=t;i++)
#define dwn(i,s,t) for(int i=s;i>=t;i--)
#define mp make_pair
#define pb push_back
#define xx first
#define yy second
typedef long long ll;
typedef pair<int,int> pii;
inline int read() {
    int x=0,f=1;char c=getchar();
    for(;!isdigit(c);c=getchar()) if(c=='-') f=-1;
    for(;isdigit(c);c=getchar()) x=x*10+c-'0';
    return x*f;
}
const int maxn=2610;
const int inf=1e9;
int n,A[maxn];
int f[2][maxn*2];// (0 -> 1) - (1 -> 0)
char p[maxn];
int main() {
	freopen("inverse.in","r",stdin);
	freopen("inverse.out","w",stdout);
	n=read();
	scanf("%s",p+1);
	rep(i,1,n) A[i]=read();
	rep(i,0,2*n) f[0][i]=-inf;
	f[0][n]=0;int cur=0,c1=0;
	rep(i,1,n) {
		cur^=1;
		rep(j,0,2*n) f[cur][j]=-inf;
		rep(j,0,2*n) {
			int& ans=f[cur^1][j];if(ans==-inf) continue;
			if(p[i]=='1') {
				f[cur][j]=max(f[cur][j],ans);
				f[cur][j-1]=max(f[cur][j-1],ans-A[i]+c1+j-n);
			}
			else {
				f[cur][j]=max(f[cur][j],ans+c1+j-n);
				f[cur][j+1]=max(f[cur][j+1],ans-A[i]);
			}
		}
		if(p[i]=='1') c1++;
	}
	int ans=-inf;
	rep(j,0,2*n) ans=max(ans,f[cur][j]);
	printf("%d\n",ans);
	return 0;
}
```
