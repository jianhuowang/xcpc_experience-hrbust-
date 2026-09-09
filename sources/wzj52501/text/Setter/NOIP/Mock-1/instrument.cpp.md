# Setter/NOIP/Mock-1/instrument.cpp

来源 ID：`wzj52501-480a46e49e784c9b`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOIP/Mock-1/instrument.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–51

```cpp
#include<cstdio>
#include<cstring>
#include<cctype>
#include<cmath>
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
const int maxn=530010;
const int mod=998244353;
int n,A[maxn],f[maxn],st[maxn],last[maxn],tmp[maxn],g[maxn],sumv[maxn];
int check(int lim) {
	sumv[0]=1;
	rep(i,1,n) {
		int l=st[i]-1,r=i-lim;
		if(l>r) f[i]=0;
		else f[i]=(sumv[r]-(l>=1?sumv[l-1]:0))?1:0;
		sumv[i]=sumv[i-1]+f[i];
	}
	return f[n];
}
int calc(int ans) {
	g[0]=sumv[0]=1;
	rep(i,1,n) {
		int l=st[i]-1,r=i-ans;
		if(l>r) g[i]=0;
		else g[i]=(sumv[r]-(l>=1?sumv[l-1]:0)+mod)%mod;
		sumv[i]=(sumv[i-1]+g[i])%mod;
	}
	return g[n];
}
int main() {
	freopen("instrument.in","r",stdin);
	freopen("instrument.out","w",stdout);
	n=read();
	rep(i,1,n) tmp[i]=A[i]=read();
	sort(tmp+1,tmp+n+1);
	rep(i,1,n) A[i]=lower_bound(tmp+1,tmp+n+1,A[i])-tmp;
	rep(i,1,n) st[i]=max(st[i-1],last[A[i]]+1),last[A[i]]=i;
	int l=1,r=n+1,mid;
	while(l+1<r) if(check(mid=l+r>>1)) l=mid; else r=mid;
	printf("%d\n%d\n",l,calc(l));
	return 0;
}
```
