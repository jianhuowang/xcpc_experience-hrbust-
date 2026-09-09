# Setter/BJTSC/Day1/arcana.cpp

来源 ID：`wzj52501-0d5a4b09b9751574`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Day1/arcana.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–124

```cpp
#include<cstdio>
#include<cstring>
#include<cctype>
#include<algorithm>
#include<vector>
#include<cmath>
#include<queue> 
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
const int maxn=1610;
double val[maxn],all;
int ch[maxn][10],cnt,valy[maxn];
void insert(char* s,double v) {
	int j=0,c;
	for(int i=0;s[i];i++) {
		c=s[i]-'0';
		if(!ch[j][c]) ch[j][c]=++cnt;
		j=ch[j][c];
	}
//	if(valy[j]) printf("%s\n",s);
	val[j]+=v;valy[j]++;
	all=max(all,v);
}
queue<int> Q;
int fa[maxn];
void getfail() {
	rep(c,0,9) if(ch[0][c]) Q.push(ch[0][c]);
	while(Q.size()) {
		int u=Q.front();Q.pop();
		rep(c,0,9) {
			if(!ch[u][c]) {ch[u][c]=ch[fa[u]][c];continue;}
			int v=ch[u][c],j=fa[u];
			while(j&&!ch[j][c]) j=fa[j];
			fa[v]=ch[j][c];Q.push(v);
			val[v]+=val[fa[v]];
			valy[v]+=valy[fa[v]];
		}
	}
}
char P[maxn],s[maxn];
int n,m;
double f[maxn][maxn];
void upd(double& x,double v) {x=max(x,v);}
int check(double x) {
	rep(i,0,n) rep(j,0,cnt) f[i][j]=-1e10;
	f[0][0]=0.0;
	rep(i,0,n-1) rep(j,0,cnt) {
		double& res=f[i][j];
		if(res+n*all<0) continue;
		int v;
		if(P[i+1]=='.') {
			rep(c,0,9) {
				v=ch[j][c];
				upd(f[i+1][v],res+val[v]-valy[v]*x);
			}
		}
		else v=ch[j][P[i+1]-'0'],upd(f[i+1][v],res+val[v]-valy[v]*x);
	}
	double res=f[n][0];
	rep(i,1,cnt) res=max(res,f[n][i]);
	return res>0.0;
}
pii g[maxn][maxn];
void print(double x) {
	rep(i,0,n) rep(j,0,cnt) f[i][j]=-1e10,g[i][j]=mp(11,0);
	f[0][0]=0.0;
	rep(i,0,n-1) rep(j,0,cnt) {
		double& res=f[i][j];
		if(res+n*all<0) continue;
		int v;
		if(P[i+1]=='.') {
			rep(c,0,9) {
				v=ch[j][c];
				if(f[i+1][v]<res+val[v]-valy[v]*x) f[i+1][v]=res+val[v]-valy[v]*x,g[i+1][v]=mp(c,j);
			}
		}
		else {
			v=ch[j][P[i+1]-'0'];
			if(f[i+1][v]<res+val[v]-valy[v]*x) f[i+1][v]=res+val[v]-valy[v]*x,g[i+1][v]=mp(P[i+1]-'0',j);
		}
	}
	double res=f[n][0];pii best=g[n][0];
	rep(i,1,cnt) if(res<f[n][i]) res=f[n][i],best=g[n][i];
	int i=n;
	do {
		putchar(best.xx+'0');
		i--;best=g[i][best.yy];
	}while(i>=1);
}
int main() {
//	freopen("arcana.in","r",stdin);
//	freopen("arcana.ans","w",stdout);
	n=read();m=read();
	scanf("%s",P+1);
	reverse(P+1,P+n+1);
	rep(i,1,m) {
		scanf("%s",s);int l=strlen(s);
		reverse(s,s+l);
		insert(s,log(read()));
	}
	getfail();
	double l=0.0,r=all;
	while(r-l>1e-9) {
		double mid=(l+r)*0.5;
		if(check(mid)) l=mid;
		else r=mid;
	}
	print(l-1e-9);
	return 0;
}

```
