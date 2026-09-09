# Setter/NOI/noi2020-final/problem.cpp

来源 ID：`wzj52501-f9c5e21f865f69ca`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/noi2020-final/problem.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–218

```cpp
#include<cstdio>
#include<cstring>
#include<cctype>
#include<algorithm>
#include<vector>
#include<cmath>
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
typedef vector<int> vi;
const int maxn=100010;
const int maxnode=18000010;
int n,p[maxn];
int cntv[maxnode],ls[maxnode],rs[maxnode],root[maxn<<2],ToT;
ll sumv[maxnode];
void build1d(int& o,int l,int r,int p) {
	o=++ToT;cntv[o]++;
	if(l==r) return;
	int mid=l+r>>1;
	if(p<=mid) build1d(ls[o],l,mid,p);
	else build1d(rs[o],mid+1,r,p);
}
void maintain2d(int& o,int x,int y,int l,int r) {
	if(!cntv[x]&&!cntv[y]) return;
	o=++ToT;cntv[o]=cntv[x]+cntv[y];
	if(l==r) return;
	int mid=l+r>>1;
	maintain2d(ls[o],ls[x],ls[y],l,mid);
	maintain2d(rs[o],rs[x],rs[y],mid+1,r);
	sumv[o]=(ll)cntv[ls[x]]*cntv[rs[y]];
	sumv[o]+=sumv[ls[o]]+sumv[rs[o]]+sumv[x]+sumv[y];
	sumv[o]-=sumv[ls[x]]+sumv[rs[x]]+sumv[ls[y]]+sumv[rs[y]];
}
void build2d(int o,int l,int r) {
	if(l==r) build1d(root[o],1,n,p[l]);
	else {
		int mid=l+r>>1,lc=o<<1,rc=lc|1;
		build2d(lc,l,mid);
		build2d(rc,mid+1,r);
		maintain2d(root[o],root[lc],root[rc],1,n);
	}
}
vi S[50];
int N,curi,blo[maxn];
ll Sum[50][50],res,ans[maxn*2];
struct Query {
	int id,l,r;
	bool operator < (const Query& ths) const {
		if(blo[l]!=blo[ths.l]) return l<ths.l;
		return blo[l]&1?r<ths.r:r>ths.r;
	}
}Q[maxn];
vector<Query> Qx[maxn<<2],Qy[maxn<<2];
void calcx(int o,int x,int y) {
	Qx[o].pb((Query){curi,x,y});
}
void calcy(int o,int l,int r) {
	Qy[o].pb((Query){curi,l,r});
}
void query1d(int o,int k,int l,int r,int L,int R,int qx,int qy,vi& ret) {
	if(qx<=l&&r<=qy) {
		if(N==1) calcy(k,L,R);
		ret.pb(o);
		return;
	}
	int mid=l+r>>1;
	if(qx<=mid) query1d(ls[o],k*2,l,mid,L,R,qx,qy,ret);
	if(qy>mid) query1d(rs[o],k*2+1,mid+1,r,L,R,qx,qy,ret);
}
void query2d(int o,int l,int r,int ql,int qr,int qx,int qy) {
	if(ql<=l&&r<=qr) {
		calcx(o,qx,qy);
		return query1d(root[o],1,1,n,ql,qr,qx,qy,S[N++]);
	}
	int mid=l+r>>1,lc=o<<1,rc=lc|1;
	if(ql<=mid) query2d(lc,l,mid,ql,qr,qx,qy);
	if(qr>mid) query2d(rc,mid+1,r,ql,qr,qx,qy);
}
int C[maxn];
int tmp[maxn],A[maxn],B[maxn],tot;
int sum(int x) {
	int res=0;
	for(;x;x-=x&-x) res+=C[x];
	return res;
}
void add(int x,int v) {
	for(;x<=tot;x+=x&-x) C[x]+=v;
}
ll curans;
void addr(int x) {
	curans+=sum(x-1);
	add(x,1);
}
void delr(int x) {
	curans-=sum(x-1);
	add(x,-1);
}
void addl(int x) {
	curans+=sum(tot)-sum(x);
	add(x,1);
}
void dell(int x) {
	curans-=sum(tot)-sum(x);
	add(x,-1);
}
void dfsx(int o,int l,int r) {
	if(l==r) return;
	int mid=l+r>>1,lc=o<<1,rc=lc|1;
	dfsx(lc,l,mid);dfsx(rc,mid+1,r);
	if(!Qx[o].size()) return;
	tot=curans=0;
	rep(i,l,r) tmp[++tot]=p[i];
	int SIZE=(int)sqrt(tot);
	rep(i,1,tot) blo[i]=(i-1)/SIZE+1;
	sort(tmp+1,tmp+tot+1);
	rep(i,1,tot) {
		C[i]=0;
		A[i]=lower_bound(tmp+1,tmp+tot+1,p[i+l-1])-tmp;	
	}
	rep(i,1,tot) B[A[i]]=i;
	rep(i,1,tot) A[i]=B[i];
	int m=Qx[o].size();
//	rep(i,1,tot) printf("%d ",A[i]);puts("");
	rep(i,0,Qx[o].size()-1) {
		int x=lower_bound(tmp+1,tmp+tot+1,Qx[o][i].l)-tmp;
		int y=upper_bound(tmp+1,tmp+tot+1,Qx[o][i].r)-tmp-1;
		Q[i+1]=(Query){Qx[o][i].id,x,y};
//		printf("+ %d %d , %d %d (%d)\n",l,r,x,y,Qx[o][i].id);
	}
	sort(Q+1,Q+m+1);
	int L=1,R=0;
	rep(i,1,m) {
		while(L>Q[i].l) addl(A[--L]);
		while(R<Q[i].r) addr(A[++R]);
		while(L<Q[i].l) dell(A[L++]);
		while(R>Q[i].r) delr(A[R--]);
	//	printf("%d: [%d,%d] %lld\n",Q[i].id,L,R,curans);
		ans[Q[i].id]+=curans;
	}
}
void dfsy(int o,int l,int r) {
	if(l==r) return;
	int mid=l+r>>1,lc=o<<1,rc=lc|1;
	dfsy(lc,l,mid);dfsy(rc,mid+1,r);
	if(!Qy[o].size()) return;
	tot=curans=0;
	rep(i,l,r) tmp[++tot]=p[i];
	int SIZE=(int)sqrt(tot)+1;
	rep(i,1,tot) blo[i]=(i-1)/SIZE+1;
	sort(tmp+1,tmp+tot+1);
	
	rep(i,1,tot) {
		C[i]=0;
		A[i]=lower_bound(tmp+1,tmp+tot+1,p[i+l-1])-tmp;	
	}
	rep(i,1,tot) B[A[i]]=i;
	rep(i,1,tot) A[i]=B[i];
//	rep(i,1,tot) printf("%d ",A[i]);puts("");
	int m=Qy[o].size();
	rep(i,0,Qy[o].size()-1) {
		int x=lower_bound(tmp+1,tmp+tot+1,Qy[o][i].l)-tmp;
		int y=upper_bound(tmp+1,tmp+tot+1,Qy[o][i].r)-tmp-1;
		Q[i+1]=(Query){Qy[o][i].id,x,y};
//		printf("+ %d %d , %d %d (%d)\n",l,r,x,y,Qy[o][i].id);
	}
	sort(Q+1,Q+m+1);
	int L=1,R=0;
	rep(i,1,m) {
		while(L>Q[i].l) addl(A[--L]);
		while(R<Q[i].r) addr(A[++R]);
		while(L<Q[i].l) dell(A[L++]);
		while(R>Q[i].r) delr(A[R--]);
		ans[Q[i].id]+=curans;
//		printf("%d: [%d,%d] %lld\n",Q[i].id,L,R,curans);
	}
}
void solve_inverse() {
	dfsx(1,1,n);
	rep(i,1,n) A[p[i]]=i;
	rep(i,1,n) p[i]=A[i];
	dfsy(1,1,n);
}
int main() {
	freopen("problem.in","r",stdin);
	freopen("problem.out","w",stdout);
	n=read();int m=read();
	rep(i,1,n) p[i]=read();
	build2d(1,1,n);
	rep(i,1,m) {
		int l=read(),r=read(),x=read(),y=read();
		curi=i;res=N=0;
		query2d(1,1,n,l,r,x,y);
		int M=S[0].size();
		rep(i,1,N) rep(j,1,M) {
			Sum[i][j]=Sum[i-1][j]+Sum[i][j-1]-Sum[i-1][j-1]+cntv[S[i-1][j-1]];
			res+=(ll)cntv[S[i-1][j-1]]*Sum[i-1][j-1];
			res-=sumv[S[i-1][j-1]];
		}
		rep(i,0,N-1) S[i].clear();
		ans[i]+=res;
	}
	solve_inverse();
	rep(i,1,m) printf("%lld\n",ans[i]);
	return 0;
}

```
