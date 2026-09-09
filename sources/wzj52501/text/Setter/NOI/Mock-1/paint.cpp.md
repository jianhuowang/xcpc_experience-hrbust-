# Setter/NOI/Mock-1/paint.cpp

来源 ID：`wzj52501-e9c0b5365c81565d`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/Mock-1/paint.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–88

```cpp
#include<cstdio>
#include<cctype>
#include<queue>
#include<cstring>
#include<ctime>
#include<algorithm>
#define dwn(i,s,t) for(int i=s;i>=t;i--)
#define rep(i,s,t) for(int i=s;i<=t;i++)
#define ren for(int i=first[x];i!=-1;i=next[i])
using namespace std;
inline int read() {
    int x=0,f=1;char c=getchar();
    for(;!isdigit(c);c=getchar()) if(c=='-') f=-1;
    for(;isdigit(c);c=getchar()) x=x*10+c-'0';
    return x*f;
}
typedef long long ll;
const int maxn=160010;
const int maxnode=5000010;
ll a,b,c,f[maxn],S[maxn];
int n,ls[maxn<<1],rs[maxn<<1],ToT,rt;
void build(int& o,int l,int r) {
	o=++ToT;if(l==r) return;
	int mid=l+r>>1;
	build(ls[o],l,mid);build(rs[o],mid+1,r);
}
int first[maxn<<1],next[maxnode],id[maxnode],cnt;
void AddMark(int x,int val) {
	id[++cnt]=val;next[cnt]=first[x];first[x]=cnt;
}
void query(int o,int l,int r,int ql,int qr,int val) {
	if(ql<=l&&r<=qr) AddMark(o,val);
	else {
		int mid=l+r>>1;
		if(ql<=mid) query(ls[o],l,mid,ql,qr,val);
		if(qr>mid) query(rs[o],mid+1,r,ql,qr,val);
	}
}
struct Point {
	ll x,y;int id;
	bool operator < (const Point& ths) const {return x<ths.x||(x==ths.x&&y>ths.y);}
}A[maxn];
int Q[maxn];
double slop(int i,int j) {
	if(!i) return 1e60;
	return (double)(A[i].y-A[j].y)/(A[i].x-A[j].x);
}
void update(int i,int j) {
	ll v=f[j]+a*(S[i]-S[j])*(S[i]-S[j])+c;
	if(v>f[i]) f[i]=v;
}
void solve(int o,int l,int r) {
	if(l<r) {
		int mid=l+r>>1;
		solve(ls[o],l,mid);
		solve(rs[o],mid+1,r);
	}
	if(first[o]) {
		int ct=0,fr=1,he=0;
		rep(i,l,r) A[++ct]=(Point){2*a*S[i],f[i]+a*S[i]*S[i],i};
		sort(A+1,A+ct+1);
		rep(i,1,ct) if(A[i].x!=A[i-1].x||i==1) {
			while(fr<he&&slop(Q[he-1],Q[he])<=slop(Q[he],i)) he--;
			Q[++he]=i;
		}
		for(int i=first[o];i;i=next[i]) {
			int L=fr,R=he+1;
			while(L+1<R) {
				int mid=L+R>>1;
				if(slop(Q[mid-1],Q[mid])>S[id[i]]) L=mid;
				else R=mid;
			}
			update(id[i],A[Q[L]].id);
		}
	} 
}
int main() {
	freopen("paint.in","r",stdin);
	freopen("paint.out","w",stdout);
	n=read();a=read();b=read();c=read();
	int L=read(),R=read();
	rep(i,1,n) S[i]=S[i-1]+read(),f[i]=-1ll<<60;
	build(rt,0,n);
	rep(i,L,n) query(1,0,n,max(0,i-R),i-L,i);
	solve(1,0,n);
	printf("%lld\n",f[n]+b*S[n]);
	return 0;
}
```
