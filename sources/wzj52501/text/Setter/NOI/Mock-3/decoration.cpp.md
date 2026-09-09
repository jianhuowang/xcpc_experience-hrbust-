# Setter/NOI/Mock-3/decoration.cpp

来源 ID：`wzj52501-8d3087413781f58b`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Mock-3/decoration.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–202

```cpp
#include<cstdio>
#include<cstring>
#include<cctype>
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
const int maxn=256;
const int maxm=9;
const int mod=998244353;
int N,sa,sb;
struct Matrix {
	int A[maxn][maxn];
	Matrix operator * (const Matrix& b) const {
		Matrix c;
		rep(i,1,N) rep(j,1,N) {
			int res=0;
			rep(k,1,N) (res+=(ll)A[i][k]*b.A[k][j]%mod)%=mod;
			c.A[i][j]=res;
		}
		return c;
	}
	void print() {
		rep(i,1,N) rep(j,1,N) printf("%d%c",A[i][j],j==N?'\n':' ');
	}
}ans;
int pow(int n,int m) {
    int ans=1;
    for(;m;m>>=1,n=(ll)n*n%mod) if(m&1) ans=(ll)ans*n%mod;
    return ans;
}
int inv(int n) {return pow(n,mod-2);}
int delta(Matrix A,int n) {
    int ans=1;
    rep(i,1,n) {
        int k=i;
        rep(j,i,n) if(A.A[j][i]) {k=j;break;}
        if(i!=k) swap(A.A[i],A.A[k]),ans*=-1;
        int t=inv(A.A[i][i]);
        rep(j,i+1,n) {
        	int tmp=(ll)t*A.A[j][i]%mod;
			dwn(k,n,i) (A.A[j][k]+=mod-(ll)tmp*A.A[i][k]%mod)%=mod;
		}
    }
    rep(i,1,n) ans=(ll)ans*A.A[i][i]%mod;
    return (ans+mod)%mod;
}
int n;
struct Poly {
    int A[maxn*2];
    Poly() {memset(A,0,sizeof(A));}
    Poly operator * (const Poly& b) const {
        Poly c;rep(i,0,2*n) c.A[i]=0;
        rep(i,0,n) rep(j,0,n) (c.A[i+j]+=(ll)A[i]*b.A[j]%mod)%=mod;
        return c;
    }
    Poly operator + (const Poly& b) const {
        Poly c;rep(i,0,2*n) c.A[i]=(A[i]+b.A[i])%mod;
        return c;
    }
    Poly operator % (const Poly& b) const {
        Poly c;rep(i,0,2*n) c.A[i]=A[i];
        dwn(i,n,0) if(c.A[i+n]) {
            rep(j,0,n) c.A[i+j]=(c.A[i+j]+mod-(ll)c.A[i+n]*b.A[j]%mod)%mod;
        }
        return c;
    }
    Poly operator * (const int& b) const {
        Poly c;
        rep(i,0,2*n) c.A[i]=(ll)A[i]*b%mod;
        return c;
    }
    void print() {
        dwn(i,2*n,0) if(A[i]) {
            dwn(j,i,0) printf("%dx^%d ",A[j],j);
            break;
        }
        puts("");
    }
};
int v[maxn];
Poly prek[maxn],sufk[maxn],p[maxn],t;
void get_poly(Matrix A) {
	n=N;
    prek[0].A[1]=1;
    rep(i,1,n) {
        t.A[0]=mod-i;t.A[1]=1;
        prek[i]=prek[i-1]*t;
    }
    sufk[n+1].A[0]=1;
    dwn(i,n,1) {
        t.A[0]=mod-i;t.A[1]=1;
        sufk[i]=sufk[i+1]*t;
    }
    Matrix B;
    rep(x,0,n) {
        rep(i,1,n) rep(j,1,n) B.A[i][j]=(A.A[i][j]-x*(i==j?1:0)+mod)%mod;
        v[x]=delta(B,n);
        rep(j,0,n) if(x!=j) v[x]=(ll)v[x]*inv(x-j+mod)%mod;
        if(!x) p[x]=sufk[1];
        else if(x==n) p[x]=prek[n-1];
        else p[x]=sufk[x+1]*prek[x-1];
        p[x]=p[x]*v[x];
    }
    memset(t.A,0,sizeof(t.A));
    rep(i,0,n) t=t+p[i];
    int Inv=inv(t.A[n]);
    rep(i,0,n) t.A[i]=(ll)t.A[i]*Inv%mod;
}
int cntt[maxn],mapp[maxn][maxn],w[maxn][maxn];
int m,A[maxm],B[maxm],cS;
void dfs(int x,int c1,int c2) {
	if(x==m+1) {
		int ok=1,S2=0,res=1;
		rep(i,1,m) if(!A[i]) ok=0;
		rep(i,1,m) if(B[i]) S2|=1<<i-1;
		rep(i,1,c1) res=(ll)res*sa%mod;
		rep(i,1,c2) res=(ll)res*sb%mod;
		if(ok) {
			w[S2][cS]=1;
			(mapp[S2][cS]+=res)%=mod;
		}
		return;
	}
	B[x]=0;dfs(x+1,c1,c2);
	if(!A[x]) {
		B[x]=A[x]=1;
		dfs(x+1,c1+1,c2);
		B[x]=A[x]=0;
	}
	if(x!=1&&!B[x-1]) {
		B[x-1]=B[x]=1;
		dfs(x+1,c1,c2+1);
		B[x-1]=B[x]=0;
	}
}
void Add(Matrix& A,Matrix& B,int v) {
	rep(i,1,N) rep(j,1,N) {
		(A.A[i][j]+=(ll)B.A[i][j]*v%mod)%=mod;
	}
}
void Qpow(Matrix& C,char* M,int extra) {
	Poly ret,tmp,tmp2;
	memset(ret.A,0,sizeof(ret.A));
	memset(tmp.A,0,sizeof(tmp.A));
	ret.A[0]=1;tmp.A[1]=1;
    int m=strlen(M);
    dwn(i,m-1,0) {
    	int add=M[i]-'0';if(add&1) ret=(ret*tmp)%t;
        tmp=(tmp*tmp)%t;tmp2=tmp;if(add&2) ret=(ret*tmp)%t;
        tmp=(tmp*tmp)%t;if(add&4) ret=(ret*tmp)%t;
		tmp=(tmp*tmp)%t;if(add&8) ret=(ret*tmp)%t;
        tmp=(tmp2*tmp)%t;
    }
    Matrix B;
    rep(i,1,n) rep(j,1,n) B.A[i][j]=(i==j?1:0);
    memset(C.A,0,sizeof(C.A));
    rep(i,0,n) {
        Add(C,B,ret.A[i]);
        B=B*ans;
    }
    if(extra) C=C*ans;
}
int calc(char* l,int extra) {
	Matrix tmp;Qpow(tmp,l,extra);
	return tmp.A[N][N-1];
}
char l[2600],r[2600];
int main() {
//	freopen("decoration.in","r",stdin);
//	freopen("decoration.out","w",stdout);
	sprintf(l,"10");
	sprintf(r,"10");
//	scanf("%s%s",l,r);
//	m=read();sa=read();sb=read();
	m=4;sa=sb=1;
	int all=1<<m;N=all;
	rep(S,0,all-1) {
		rep(j,1,m) A[j]=S>>j-1&1;
		cS=S;dfs(1,0,0);
	}
	rep(k,0,N-1) rep(i,0,N-1) rep(j,0,N-1) w[i][j]|=w[i][k]&w[k][j];
	int mx=0;
	rep(S,0,all-1) if(w[S][N-1]) cntt[S]=++mx;
	N=mx+1;
	rep(i,0,all-1) rep(j,0,all-1) if(cntt[i]&&cntt[j]) ans.A[cntt[i]][cntt[j]]=mapp[i][j];
	ans.A[N][N-1]=ans.A[N][N]=1;
	get_poly(ans);
	printf("%d\n",(calc(r,1)-calc(l,0)+mod)%mod);
	return ~~(0-0);
}
/*
2 2
3 1 1
*/
```
