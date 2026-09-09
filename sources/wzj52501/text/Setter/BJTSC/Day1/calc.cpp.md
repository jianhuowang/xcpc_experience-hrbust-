# Setter/BJTSC/Day1/calc.cpp

来源 ID：`wzj52501-a19887d8ed6861da`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Day1/calc.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–126

```cpp
#include<cstdio>
#include<cstring>
#include<cctype>
#include<algorithm>
#include<vector>
#define pb push_back
#define mp make_pair
#define xx first
#define yy second
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
const int mod=998244353;
const int maxn=510;
int qpow(int n,ll m) {
	(n+=mod)%=mod;int ans=1;
	for(;m;m>>=1,n=(ll)n*n%mod) if(m&1) ans=(ll)ans*n%mod;
	return ans;
}
struct F {//a + b sqrt(c)
	int a,b,c;
	F(){}
	F(int _a,int _b,int _c):a(_a),b(_b),c(_c){}
	F operator + (F x) {return F((a+x.a)%mod,(b+x.b)%mod,c);}
	F operator - (F x) {return F((a-x.a+mod)%mod,(b-x.b+mod)%mod,c);}
	F operator * (F x) {return F(((ll)a*x.a%mod+(ll)c*b%mod*x.b%mod)%mod,((ll)a*x.b%mod+(ll)b*x.a%mod)%mod,c);}
	F inv() {
		int f=qpow(((ll)a*a%mod-(ll)b*b%mod*c%mod+mod)%mod,mod-2);
		return F((ll)a*f%mod,(ll)(mod-b)*f%mod,c);
	}
	bool operator == (F x) {return a==x.a&&b==x.b&&c==x.c;}
	F operator / (F x) {return (*this)*x.inv();}
	void print() {printf("%d + %di\n",a,b);}
};
F Qpow(F n,ll m) {
	F ans=n;m--;
	for(;m;m>>=1,n=n*n) if(m&1) ans=ans*n;
	return ans;
}
int fac[maxn],ifac[maxn];
int C(int n,int m) {return (ll)fac[n]*ifac[m]%mod*ifac[n-m]%mod;}
int f(ll n,int k) {
	if(!k) return n%mod;n++;
	F ans(0,0,5);
	F x1(1,1,5),x2(1,mod-1,5);x1=x1/F(2,0,5);x2=x2/F(2,0,5);
	F x(1,0,5),y(1,0,5);
	rep(j,1,k) y=y*x2;
	rep(j,0,k) {
		int res=C(k,j);
		if(k-j&1) res=(mod-res)%mod;
		F t;t=x*y;
		if(t==F(1,0,5)) ans=ans+F(n%mod*res%mod,0,5);
		else ans=ans+F(res,0,5)*(Qpow(t,n+1)-t)/(t-F(1,0,5));
		x=x*x1;y=y/x2;
	}
	rep(j,1,k) ans=ans/F(0,1,5);
	return (ans.a+mod-1)%mod;
}
int g(ll n,int k) {
	if(!k) return n%mod;
	F ans(0,0,3);
	F x1(2,1,3),x2(2,mod-1,3),A(3,1,3),B(3,mod-1,3);
	F x(1,0,3),y(1,0,3),a(1,0,3),b(1,0,3);
	rep(j,1,k) y=y*x2,b=b*B;
	rep(j,0,k) {
		int res=C(k,j);
		F t;t=x*y;
		if(t==F(1,0,3)) ans=ans+a*b*F(n%mod*res%mod,0,3);
		else ans=ans+F(res,0,3)*a*b*(Qpow(t,n+1)-t)/(t-F(1,0,3));
		x=x*x1;y=y/x2;
		a=a*A;b=b/B;
	}
	rep(j,1,k) ans=ans/F(6,0,3);
	return ans.a;
}
int s1[maxn][maxn];
void init(int N) {
	fac[0]=ifac[0]=ifac[1]=1;
	rep(i,1,N) fac[i]=(ll)fac[i-1]*i%mod;
	rep(i,2,N) ifac[i]=(ll)(mod-mod/i)*ifac[mod%i]%mod;
	rep(i,1,N) ifac[i]=(ll)ifac[i-1]*ifac[i]%mod;
	s1[0][0]=1; 
	rep(i,1,N) rep(j,1,i) s1[i][j]=(s1[i-1][j-1]+(ll)s1[i-1][j]*(i-1)%mod)%mod;
}
int calcf(ll n,int k) {
	if(!n) return 0;
	int ans=0;
	rep(j,0,k) {
		int tmp=(ll)f(n,j)*s1[k][j]%mod;
		if(k-j+1&1) (ans+=tmp)%=mod; 
		else (ans+=mod-tmp)%=mod;
	}
	return (ll)ans*ifac[k]%mod;
}
int calcg(ll n,int k) {
	if(!n) return 0;
	n/=2;
	int ans=0;
	rep(j,0,k) {
		int tmp=(ll)g(n,j)*s1[k][j]%mod;
		if(k-j+1&1) (ans+=tmp)%=mod; 
		else (ans+=mod-tmp)%=mod;
	}
	return (ll)ans*ifac[k]%mod;
}
int main() {
	init(501);
	int T,m;scanf("%d%d",&T,&m);
	while(T--) {
		ll l,r;int k;
		scanf("%lld%lld%d",&l,&r,&k);
		int res=0;
		if(m==2) res=(calcf(r,k)-calcf(l-1,k)+mod)%mod;
		else res=(calcg(r,k)-calcg(l-1,k)+mod)%mod;
		printf("%lld\n",(ll)res*qpow((r-l+1)%mod,mod-2)%mod);
	}
	return 0;
}
```
