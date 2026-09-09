# Setter/BJTSC/Day3/arcana.cpp

来源 ID：`wzj52501-6d599d9a58610b68`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Day3/arcana.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–136

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
const int maxn=160010;
const int mod=998244353;
const int maxnode=1500010;
int ToT,ls[maxnode],siz[maxnode],rs[maxnode];
int qpow(int n,int m) {
	int ans=1;
	for(;m;m>>=1,n=(ll)n*n%mod) if(m&1) ans=(ll)ans*n%mod;
	return ans;
}
int n,m,b,f[maxn],pw[maxn];
char s[maxn];
struct Node {
	int axb,ax,xb,x,l;
	Node(int v=0) {
		l=1;
		x=ax=v;
		axb=xb=(ll)b*v%mod;
	}
	Node operator + (Node b) {
		if(!b.l) return *this;
		if(!l) return b;
		Node c(0);
		c.l=l+b.l;
		c.x=(x+b.x)%mod;
		c.ax=((ax+b.ax)%mod+(ll)l*b.x%mod)%mod;
		c.xb=(b.xb+(ll)xb*pw[b.l]%mod)%mod;
		c.axb=(ll)axb*pw[b.l]%mod;
		(c.axb+=((ll)l*b.xb%mod+b.axb)%mod)%=mod;
		return c;
	}
	int ans() {
		int res=(axb-ax+mod)%mod;
		res=(ll)res*qpow(((ll)l*(l+1)/2)%mod*(b-1)%mod,mod-2)%mod;
		return res;
	}
}sumv[maxnode];
int val[maxnode];
void copy(int& y,int x) {
	ls[y]=ls[x];rs[y]=rs[x];siz[y]=siz[x];
	sumv[y]=sumv[x];val[y]=val[x];
}
void maintain(int x) {
	siz[x]=siz[ls[x]]+siz[rs[x]]+1;
	sumv[x]=sumv[ls[x]]+(Node(val[x]));
	sumv[x]=sumv[x]+sumv[rs[x]];
}
void split(int o,int k,int& left,int& right) {
	if(!k) {left=0,right=o;return;}
	if(k==siz[o]) {left=o,right=0;return;}
	int z=++ToT;copy(z,o);
	if(siz[ls[z]]>=k) {
		right=z;split(ls[z],k,left,ls[right]);
		maintain(right);
	}
	else {
		left=z;split(rs[z],k-siz[ls[z]]-1,rs[left],right);
		maintain(left);
	}
}
int Rand() {return (rand()<<15)|rand();}
int merge(int x,int y) {
	if(!x) return y;
	if(!y) return x;
	int z=++ToT;
	if(Rand()%(siz[x]+siz[y])<=siz[x]) {
		copy(z,x);rs[z]=merge(rs[z],y);
		maintain(z);
		return z;
	}
	else {
		copy(z,y);ls[z]=merge(x,ls[z]);
		maintain(z);
		return z;
	}
}
void build(int& o,int l,int r) {
	o=0;if(l>r) return;
	int mid=l+r>>1;o=++ToT;val[o]=s[mid]-'0';
	build(ls[o],l,mid-1);build(rs[o],mid+1,r);
	maintain(o);
}
int cnt;
void print(int o) {
	if(!o) return;
	print(ls[o]);
	s[++cnt]=val[o]+'0';
	print(rs[o]);
}
int main() {
	freopen("arcana.in","r",stdin);
	freopen("arcana.out","w",stdout);
	srand(52501);
	n=read();m=read();b=10;sumv[0].l=0;
	f[1]=1;pw[1]=b;pw[0]=1;
	rep(i,1,n+1) f[i+1]=((ll)f[i]*b%mod+1)%mod,pw[i+1]=(ll)pw[i]*b%mod;
	scanf("%s",s+1);
	int root,o,left,mid,right,tmp;
	build(root,1,n);
	while(m--) {
		int t=read(),l=read(),r=read();
		if(t==1) {
			split(root,l-1,left,o);
			split(o,r-l+1,mid,right);
			printf("%d\n",sumv[mid].ans());
		}
		else {
			int x=read()+1;swap(l,r);
			split(root,l-1,left,o);
			split(o,x,mid,right);
			split(root,r-1,left,o);
			split(o,x,tmp,right);
			root=merge(left,mid);
			root=merge(root,right);
		}
		if(m%10000==0) {
			cnt=ToT=0;
			print(root);
			build(root,1,n);
		}
	}
	return 0;
}
```
