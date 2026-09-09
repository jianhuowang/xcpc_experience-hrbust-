# Setter/BJTSC/JointProvincialSel2020_Final/count.cpp

来源 ID：`wzj52501-88212eaac4b5d6b3`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/JointProvincialSel2020_Final/count.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–168

```cpp
#include<cstdio>
#include<cstring>
#include<cctype>
#include<iostream>
#include<vector>
#include<algorithm>
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
const int maxn=35;
const int maxm=2610;
const int maxk=160010;
const int mod=998244353;
int qpow(int n,int m) {
	int ans=1;
	for(;m;m>>=1,n=(ll)n*n%mod) if(m&1) ans=(ll)ans*n%mod;
	return ans;
}
typedef int Matrix[maxn][maxn];
int gauss(int n,Matrix A) {
	int ans=1;
	rep(i,1,n) {
		int r=i;
		rep(j,i+1,n) if(A[j][i]) r=j;
		if(r!=i) swap(A[i],A[r]),ans*=-1;
		int inv=qpow(A[i][i],mod-2);
		rep(k,i+1,n) {
			int tmp=(ll)A[k][i]*inv%mod;
			rep(j,i,n) (A[k][j]+=mod-(ll)tmp*A[i][j]%mod)%=mod;
		}
	}
	rep(i,1,n) ans=(ll)ans*A[i][i]%mod;
	return (ans+mod)%mod;
}
int n,m,k,T[maxn],y[maxn];
int fac[maxn],ifac[maxn],Inv[maxn];
Matrix w,A;
struct Poly {
	int n,A[maxn*2];
	void init() {n=1;memset(A,0,sizeof(A));}
	Poly() {n=1;memset(A,0,sizeof(A));}
	Poly operator + (const Poly& b) const {
		Poly c;c.n=max(n,b.n);
		rep(i,0,c.n-1) c.A[i]=(A[i]+b.A[i])%mod;
		return c;
	}
	Poly operator * (const Poly& b) const {
		Poly c;c.n=n+b.n-1;
		rep(i,0,n-1) rep(j,0,b.n-1) (c.A[i+j]+=(ll)A[i]*b.A[j]%mod)%=mod;
		return c;
	}
	Poly operator / (const Poly& b) const {
		Poly c;c=*this;c.n=n-b.n+1;
		dwn(i,n-1,0) if(c.A[i+1]) {
			T[i]=c.A[i+1];
			rep(j,0,b.n-1) (c.A[i+j]+=mod-(ll)c.A[i+1]*b.A[j]%mod)%=mod;
		}
		else T[i]=0;
		rep(i,0,n-1) c.A[i]=T[i];
		return c;
	}
	void print() {
		dwn(i,n-1,0) printf("+ %d x^%d",A[i],i);puts("");
	}
};
int solve() {
	k=1;
	rep(x,0,n*k) {
		memset(A,0,sizeof(A));
		rep(i,1,n) rep(j,1,n) if(i!=j) {
			if(!w[i][j]) continue;
			A[i][j]=((ll)w[i][j]*x%mod+1)%mod;
		}
		rep(i,1,n) rep(j,1,n) if(i!=j) (A[i][i]+=A[i][j])%=mod,A[i][j]=(mod-A[i][j])%mod;
		y[x]=gauss(n-1,A);
	}
	Poly ans,tq;
	Poly eq,tmp;
	ans.init();tq.init();
	eq.init();tmp.init();
	eq.A[0]=1;          
	tmp.n=2;tmp.A[1]=1;  
	rep(i,0,n) {
		tmp.A[0]=mod-i;
		eq=eq*tmp;
	}
	rep(x,0,n) {
		tmp.A[0]=mod-x;
		tq=eq/tmp;
		int v=1;
		rep(i,0,n) if(i!=x) v=(ll)v*(mod+x-i)%mod;
		v=(ll)qpow(v,mod-2)*y[x]%mod;
		rep(i,0,eq.n-1) tq.A[i]=(ll)tq.A[i]*v%mod;
		ans=ans+tq;
	}
	return ans.A[1];
}
struct Edge {
	int u,v,w;
}e[maxm];
int vis[maxk],phi[maxk],pri[maxk],cnt;
void init(int n) {
	phi[1]=1;
	rep(i,2,n) {
		if(!vis[i]) pri[++cnt]=i,phi[i]=i-1;
		rep(j,1,cnt) {
			if((ll)pri[j]*i>n) break;
			vis[i*pri[j]]=1;
			if(i%pri[j]==0) {phi[i*pri[j]]=phi[i]*pri[j];break;}
			phi[i*pri[j]]=phi[i]*(pri[j]-1);
		}
	}
}
vector<int> Index[maxk];
int pa[maxn];
int findset(int x) {return x==pa[x]?x:pa[x]=findset(pa[x]);}
int main() {
	freopen("count.in","r",stdin);
	freopen("count.out","w",stdout);
	n=read();m=read();
	Inv[0]=Inv[1]=fac[0]=ifac[0]=1;
	rep(i,2,n) Inv[i]=(ll)(mod-mod/i)*Inv[mod%i]%mod;
	rep(i,1,n) fac[i]=(ll)fac[i-1]*i%mod;
	rep(i,1,n) ifac[i]=(ll)ifac[i-1]*Inv[i]%mod;
	rep(i,1,m) {
		e[i].u=read(),e[i].v=read(),e[i].w=read();
		Index[e[i].w].pb(i);
	}
	int ans=0,N=152501;
	init(N);
	int total=0;
	dwn(d,N,1) {
		int cnt=0;
		for(int j=d;j<=N;j+=d) cnt+=Index[j].size();
		if(cnt>=n-1) {
			memset(pa,0,sizeof(pa));
			memset(w,0,sizeof(w));
			rep(i,1,n) pa[i]=i;
			for(int j=d;j<=N;j+=d) {
				for(int i=0;i<Index[j].size();i++) {
					int c=Index[j][i];
					w[e[c].u][e[c].v]=e[c].w;
					w[e[c].v][e[c].u]=e[c].w;
					pa[findset(e[c].u)]=findset(e[c].v);
				} 
			}
			int connected=1;
			rep(i,1,n) if(findset(i)!=findset(1)) connected=0;
			if(connected) {
				total++;
				(ans+=1ll*phi[d]*solve()%mod)%=mod;
			}
		}
	}
	printf("%d\n",ans);
	return 0;
}
```
