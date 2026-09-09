# Setter/NOI/noi2020-final/dish.cpp

来源 ID：`wzj52501-de8d22d489bcd140`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/noi2020-final/dish.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–79

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
const ll inf=1ll<<60;
const int maxn=55*5;
const int maxm=2510;
int n,m,T,k;
int c[maxn],u[maxm],v[maxm],w[maxm];
void upd(ll& x,ll y) {if(x<y) x=y;}
int N;
struct Matrix {
	ll A[maxn][maxn];
	Matrix operator * (const Matrix& b) {
		Matrix c;
		rep(i,1,N) rep(j,1,N) {
			ll tmp=-inf;
			rep(k,1,N) upd(tmp,A[i][k]+b.A[k][j]);
			c.A[i][j]=tmp;
		}
		return c;
	}
	ll tmp[maxn];
	void mul(ll* B) {
		rep(i,1,N) {
			tmp[i]=-inf;
			rep(j,1,N) upd(tmp[i],A[i][j]+B[j]);
		}
		rep(i,1,N) B[i]=tmp[i];
	}
};
struct Item {
	int t,x,y;
	bool operator < (const Item& ths) const {
		return t<ths.t;
	}
}A[maxn];
void input() {
	n=read();m=read();T=read();k=read();
	rep(i,1,n) c[i]=read();
	rep(i,1,m) u[i]=read(),v[i]=read(),w[i]=read();
	rep(i,1,k) A[i].t=read(),A[i].x=read(),A[i].y=read();
}
Matrix X,pw[35];
ll res[maxn];
void init() {
	input();N=5*n;
	rep(i,1,N) rep(j,1,N) X.A[i][j]=-inf;
	rep(i,n+1,5*n) X.A[i][i-n]=0;
	rep(i,1,m) upd(X.A[v[i]][w[i]*n-n+u[i]],c[v[i]]);
	pw[0]=X;
	rep(i,1,30) pw[i]=pw[i-1]*pw[i-1];
}
void mul(int M) {rep(i,0,30) if(M>>i&1) pw[i].mul(res);}
int main() {
	freopen("delicacy.in","r",stdin);	
	freopen("delicacy.out","w",stdout);
	init();
	rep(i,1,N) res[i]=-inf;
	res[1]=c[1];
	A[++k]=(Item){T,0,0};
	sort(A+1,A+k+1);
	rep(i,1,k) {
		mul(A[i].t-A[i-1].t);
		res[A[i].x]+=A[i].y;
	}
	printf("%lld\n",res[1]<0?-1:res[1]);
	return 0;
}
```
