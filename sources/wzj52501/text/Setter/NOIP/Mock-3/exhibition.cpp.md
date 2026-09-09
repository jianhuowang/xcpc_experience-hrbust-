# Setter/NOIP/Mock-3/exhibition.cpp

来源 ID：`wzj52501-b207cf1dd4b38a50`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOIP/Mock-3/exhibition.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–52

```cpp
#include<cstdio>
#include<cstring>
#include<cctype>
#include<algorithm>
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
const int maxn=160010;
int n,m,S[maxn],A[maxn],f[maxn],g[maxn];
ll sum[maxn];
int main() {
	freopen("exhibition.in","r",stdin);
	freopen("exhibition.out","w",stdout);
	n=read();m=read();
	rep(i,1,m*2) A[read()]++;
	rep(i,1,n) S[i]=S[i-1]+A[i],sum[i]=sum[i-1]+(ll)A[i]*i;
	int p=0,ssum=0,cur=0;
	rep(i,1,n) {
		ssum+=A[i];
		while(cur<(ssum+1)/2) cur+=A[++p];
		f[i]=p;
	}
	p=n+1;ssum=cur=0;
	dwn(i,n,1) {
		ssum+=A[i];
		while(cur<(ssum+1)/2) cur+=A[--p];
		g[i]=p;
	}
	ll ans=1ll<<60;
	rep(mid,0,n) { 
		ll res=0;
		if(S[mid]) {
			res+=(ll)S[f[mid]]*f[mid]-sum[f[mid]];
			res+=(sum[mid]-sum[f[mid]])-(ll)f[mid]*(S[mid]-S[f[mid]]);
		}
		if(S[mid]!=S[n]) {
			res+=(ll)(S[g[mid+1]]-S[mid])*g[mid+1]-(sum[g[mid+1]]-sum[mid]);
			res+=(sum[n]-sum[g[mid+1]])-(ll)(S[n]-S[g[mid+1]])*g[mid+1];
		}
		ans=min(ans,res);
	}
	printf("%lld\n",ans);
	return 0;
}
```
