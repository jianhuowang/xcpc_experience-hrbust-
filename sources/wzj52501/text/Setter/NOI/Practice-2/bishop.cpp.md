# Setter/NOI/Practice-2/bishop.cpp

来源 ID：`wzj52501-8782d6dfba3e8f0b`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Practice-2/bishop.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–103

```cpp
#include<cstdio>
#include<cctype>
#include<vector>
#include<queue>
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
typedef long long ll;
const int maxn=300010;
const int mod=998244353;
int qpow(int n,int m) {
	int ans=1;
	for(;m;m>>=1,n=(ll)n*n%mod) if(m&1) ans=(ll)ans*n%mod;
	return ans;
}
int wn[20];
void NTT(int* A,int len,int tp) {
	int c=1,j=len>>1;
	rep(i,1,len-2) {
		if(i<j) swap(A[i],A[j]);int k=len>>1;
		while(j>=k) j-=k,k>>=1;j+=k;
	}
	for(int i=2;i<=len;i<<=1,c++)
		for(int j=0;j<len;j+=i) {
			int w=1;
			for(int k=j;k<j+(i>>1);k++) {
				int u=A[k],t=(ll)A[k+(i>>1)]*w%mod;
				A[k]=(u+t)%mod;A[k+(i>>1)]=(u-t+mod)%mod;
				w=(ll)w*wn[c]%mod;
			}
		}
	if(tp<0) {
		int inv=qpow(len,mod-2);
		rep(i,0,len-1) A[i]=(ll)A[i]*inv%mod;
		rep(i,1,len/2-1) swap(A[i],A[len-i]);
	}
}
vector<int> P[maxn];
int A[maxn],B[maxn];
void mul(int x,int y) {
	int n=P[x].size(),m=P[y].size(),len=1;
	while(len<n+m) len<<=1;
	rep(i,0,n-1) A[i]=P[x][i];rep(i,n,len-1) A[i]=0;
	rep(i,0,m-1) B[i]=P[y][i];rep(i,m,len-1) B[i]=0;
	NTT(A,len,1);NTT(B,len,1);
	rep(i,0,len-1) A[i]=(ll)A[i]*B[i]%mod;
	NTT(A,len,-1);
	P[x].resize(n+m-1);
	rep(i,0,n+m-2) P[x][i]=A[i];
}
int n,k,size[maxn],cnt,v[maxn],vis[maxn];
int fac[maxn],ifac[maxn],Inv[maxn];
int C(int n,int m) {return (ll)fac[n]*ifac[m]%mod*ifac[n-m]%mod;}
struct Node {
	int x,v;
	bool operator < (const Node& b) const {return v>b.v;}
};
priority_queue<Node> Q;
int main() {
	freopen("bishop.in","r",stdin);
	freopen("bishop.out","w",stdout);
	rep(i,1,19) wn[i]=qpow(3,mod-1>>i);
	Inv[1]=fac[0]=ifac[0]=1;
	rep(i,2,maxn-1) Inv[i]=(ll)(mod-mod/i)*Inv[mod%i]%mod;
	rep(i,1,maxn-1) {
		fac[i]=(ll)fac[i-1]*i%mod;
		ifac[i]=(ll)ifac[i-1]*Inv[i]%mod;
	}
	int T=read();
	while(T--) {
		n=read();k=read();cnt=0;
		memset(size,0,sizeof(size));
		memset(vis,0,sizeof(vis));
		rep(i,1,n) v[i]=read();
		rep(i,1,n) if(!vis[i]) {
			cnt++;int j=i;
			do size[cnt]++,vis[j]=1,j=v[j];while(j!=i);
		}
		rep(i,1,cnt) {
			P[i].resize(size[i]+1);P[i][0]=0;
			rep(j,1,size[i]) P[i][j]=C(size[i],j);
			Q.push((Node){i,size[i]+1});
		}
		rep(i,2,cnt) {
			int x=Q.top().x;Q.pop();
			int y=Q.top().x;Q.pop();
			mul(x,y);
			Q.push((Node){x,P[x].size()});
		}
		printf("%d\n",(ll)P[Q.top().x][k]*qpow(C(n,k),mod-2)%mod);
		Q.pop();
	}
	return ~~(0-0);
}
```
