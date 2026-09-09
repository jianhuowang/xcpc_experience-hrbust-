# Setter/NOI/noi2020-final/original-bbf.cpp

来源 ID：`wzj52501-d93bf23fdc2cbd49`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/noi2020-final/original-bbf.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：needs-review；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 未发现明确文件署名，作者来源未独立核验；不可按 original 前缀推定题目关联。

## 原始行 1–84

```cpp
#include<cstdio>
#include<algorithm>
#include<cstring>
#include<cmath>
#include<map>
#include<set>
#include<queue>
#include<vector>
#include<cstdlib>
#include<ctime>
#include<iostream>
using namespace std;
typedef long double ld;
typedef long long ll;
typedef unsigned int uint;
typedef unsigned long long ull;
typedef pair<int,int> pa;
#define rep(i,a,b) for(int (i)=(a);(i)<=(b);(i)++)
#define rep2(i,a,b) for(int (i)=(a);(i)<(b);(i)++)
#define per(i,a,b) for(int (i)=(a);(i)>=(b);(i)--)
#define Rep(p,x) for(int (p)=head[(x)];(p);(p)=nxt[(p)])
#define Rep2(p,x) for(int (p)=cur[(x)];(p);(p)=nxt[(p)])
#define mp make_pair
#define w1 first
#define w2 second
#define ins insert
#define pb push_back
#define ls (x<<1)
#define rs (x<<1|1)
#define mid ((l+r)>>1)
#define ms(x,y) memset(x,y,sizeof x)
#define lb(x) ((x)&(-x))
template<class T>inline void rread(T&num){
	num=0;T f=1;char ch=getchar();
	while(ch<'0'||ch>'9'){if(ch=='-')f=-1;ch=getchar();}
	while(ch>='0'&&ch<='9')num=num*10+ch-'0',ch=getchar();
	num*=f;
}
//*************************************************head*********************************************
const int maxn=5000000,mod=1e9+7,p=137;
int n,seed,ans;
ll m,A[maxn+5],B[maxn+5],C[maxn+5],step[maxn+5];
unsigned int state[16];
unsigned int index=0;
unsigned int myrand(){
	unsigned int a,b,c,d;
	a=state[index];
	c=state[(index+13)&15];
	b=a^c^(a<<16)^(c<<15);
	c=state[(index+9)&15];
	c^=(c>>11);
	a=state[index]=b^c;
	d=a^((a<<5)&0xDA442D24UL);
	index=(index+15)&15;
	a=state[index];
	state[index]=a^b^d^(a<<2)^(b<<18)^(c<<28);
	return state[index];
}
inline void Init(int n,long long &m,long long A[],long long B[],long long C[]){
	for(int i=0;i<16;i++)cin>>state[i];
	for(int i=1;i<=(n+1)/2;i++)B[i]=B[i-1]+myrand()+5;
	m=B[(n+1)/2]<<1|1;
	for(int i=1;i<=n-(n+1)/2;i++)C[i]=m-(myrand()%(B[i]-B[i-1]-1)+B[i-1]+1);
	reverse(C+1,C+(n-(n+1)/2)+1);
	for(int i=1;i<=(n+1)/2;i++)A[i]=B[i];
	for(int i=1;i<=n-(n+1)/2;i++)A[i+(n+1)/2]=C[i];
}
inline void dfs(int x){
	if(x>n){
		ll mx=0;
		rep(i,1,n)mx=max(mx,step[i]);
		ans=(ans+mx)%mod;
		return;
	}
	step[x]=A[x];dfs(x+1);
	step[x]=m-A[x];dfs(x+1);
}
int main(){
	rread(n);
	Init(n,m,A,B,C);
	dfs(1);
	cout<<ans<<endl;
	return 0;
}
```
