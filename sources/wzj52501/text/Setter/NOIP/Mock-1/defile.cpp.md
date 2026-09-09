# Setter/NOIP/Mock-1/defile.cpp

来源 ID：`wzj52501-356ff0426aa7703f`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOIP/Mock-1/defile.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–63

```cpp
#include<cstdio>
#include<cstring>
#include<cctype>
#include<cmath>
#include<algorithm>
#include<vector>
#define pb push_back
#define mp make_pair
#define xx first
#define yy second
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
typedef pair<int,int> pii;
int n,m,ans;
pii A[8],B[8];
int tar[8];
int lefta[8],leftb[8];
void dfs(int x) {
	if(x==m+1) {
		rep(i,1,n) lefta[i]=A[i].yy;
		rep(i,1,m) {
			int y=tar[i];
			leftb[i]=max(B[i].yy-A[y].xx,0);
			if(y) lefta[y]-=B[i].xx;
		}
		rep(i,1,n) lefta[i]=max(lefta[i],0);
		rep(x,1,14) {
			int ok=0;
			rep(i,1,n) if(lefta[i]==x) ok=1;
			rep(i,1,m) if(leftb[i]==x) ok=1;
			if(ok) {
				rep(i,1,n) if(lefta[i]==x) lefta[i]=0;
				rep(i,1,m) if(leftb[i]==x) leftb[i]=0;
			}
			else break;
		}
		int ok=1;
		rep(i,1,n) if(lefta[i]) ok=0;
		rep(i,1,m) if(leftb[i]) ok=0;
		if(ok) ans=1;
		return;
	}
	if(!B[x].xx) tar[x]=0,dfs(x+1);
	else rep(i,0,n) tar[x]=i,dfs(x+1);
}
int main() {
	freopen("defile.in","r",stdin);
	freopen("defile.out","w",stdout);
	n=read();m=read();
	rep(i,1,n) A[i].xx=read(),A[i].yy=read();
	rep(i,1,m) B[i].xx=read(),B[i].yy=read();
	dfs(1);
	puts(ans?"Yes":"No");
	return 0;
}
```
