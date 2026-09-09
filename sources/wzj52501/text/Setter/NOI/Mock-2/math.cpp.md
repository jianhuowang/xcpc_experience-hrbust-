# Setter/NOI/Mock-2/math.cpp

来源 ID：`wzj52501-94d0feeab473da3f`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Mock-2/math.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–91

```cpp
#include<cstdio>
#include<stack>
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
const int maxn=200010;
const int mod=1000000007;
const int maxnode=8000010;
int inv[maxn],ls[maxnode],rs[maxnode],mulv[maxnode],ToT;
void update(int& y,int x,int l,int r,int p,int la,int v) {
	mulv[y=++ToT]=(ll)mulv[x]*inv[la]%mod*v%mod;
	if(l==r) return;int mid=l+r>>1;
	ls[y]=ls[x];rs[y]=rs[x];
	if(p<=mid) update(ls[y],ls[x],l,mid,p,la,v);
	else update(rs[y],rs[x],mid+1,r,p,la,v);
}
int query(int o,int l,int r,int ql,int qr) {
	if(!o) return 1;
	if(ql<=l&&r<=qr) return mulv[o];
	int mid=l+r>>1,res=1;
	if(ql<=mid) res=query(ls[o],l,mid,ql,qr);
	if(qr>mid) res=(ll)res*query(rs[o],mid+1,r,ql,qr)%mod;
	return res;
}
vector<pii> fac[maxn];
stack<pii> S[maxn];
int vis[maxn],root[maxn],pw[30],P;
int calc(int n,int k) {return query(root[n],1,P,n-k+1,n);}
void solve(int n) {
	inv[1]=1;
	rep(i,2,n) inv[i]=(ll)(mod-mod/i)*inv[mod%i]%mod;
	mulv[0]=pw[0]=1;
	rep(i,2,n) if(!vis[i]) {
		int cur=i*i,d=1;
		rep(j,1,20) pw[j]=pw[j-1]*i;
		for(int j=i;j<=n;j+=i) {
			rep(k,1,20) if(j%pw[k]) {d=k-1;break;}
			fac[j].pb(mp(i,d)),vis[j]=1;
		}
	}
	rep(i,1,n) {
		update(root[i],root[i-1],1,n,i,1,i);
		rep(j,0,fac[i].size()-1) {
			int p=fac[i][j].xx,q=fac[i][j].yy;
			rep(k,1,20) pw[k]=(ll)pw[k-1]*p%mod;
			while(S[p].size()) {
				int x=S[p].top().xx,r=S[p].top().yy;S[p].pop();
				if(r<=q) update(root[i],root[i],1,n,x,pw[r],1),q-=r;
				else {
					update(root[i],root[i],1,n,x,pw[q],1);
					S[p].push(mp(x,r-q));
					q=0;
				}
				if(!q) break;
			}
			S[p].push(mp(i,fac[i][j].yy));
		}
	}
}
int Q,c[maxn],d[maxn];
int main() {
	Q=read();
	int n=read(),k=read();
	int a=read(),b=read();P=read();
	solve(P);
	rep(i,1,Q-1) c[i]=read();
	rep(i,1,Q-1) d[i]=read();
	rep(i,1,Q) {
		int lastans;
		printf("%d\n",lastans=calc(n,k));
		n=((ll)a*lastans+c[i])%P+1;
		k=((ll)b*lastans+d[i])%n+1;
	}
    return 0; 
}
```
