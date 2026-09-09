# Setter/NOI/noi2020-final/surreal.cpp

来源 ID：`wzj52501-c88149cd02417a9b`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/NOI/noi2020-final/surreal.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：needs-review；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 上游 surreal-README.md 指出此代码是 O(mn) 暴力，弱数据下获得满分；不得视作最优或完整验证的标程。

## 原始行 1–209

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
typedef vector<int> vi;
typedef pair<int,int> pii;
const int maxn=2000010;
int n,m,l[maxn],r[maxn];
int isleaf(int x) {
	return !l[x]&&!r[x];
}
vi sc,sl;
void print(vi& s) {
	rep(i,0,s.size()-1) printf("%d ",s[i]);puts("|");
}
int dfs(int x) {
	if(l[x]&&r[x]) {
		if(isleaf(l[x])&&isleaf(r[x])) {
			sl.pb(1);sl.pb(1);
			return 1;
		}
		else if(isleaf(l[x])) {
			sc.pb(1);
			sl.pb(1);
			return dfs(r[x]);
		}
		else if(isleaf(r[x])) {
			sc.pb(0);
			sl.pb(1);
			return dfs(l[x]);
		}
		else return 0;
	}
	else if(l[x]) {
		if(isleaf(l[x])) {
			sl.pb(1);sl.pb(0);
			return 1;
		}
		else {
			sc.pb(0);
			sl.pb(0);
			return dfs(l[x]);
		}
	}
	else if(r[x]) {
		if(isleaf(r[x])) {
			sl.pb(0);sl.pb(1);
			return 1;
		}
		else {
			sc.pb(1);
			sl.pb(0);
			return dfs(r[x]);
		}
	}
	else return 1;
}
vi mask[maxn];
int st[maxn],en[maxn],tot;
int sum[maxn];
void update(int o,int l,int r,int ql,int qr,int v) {
	rep(i,ql,qr) sum[i]+=v;
}
int findmin(int o,int l,int r) {
	int mn=tot;
	rep(i,l,r) mn=min(mn,sum[i]);
	return mn;
}
struct Trie {
	int ch[maxn][2],cnt;
	void init() {
		memset(ch[0],0,sizeof(ch[0]));
		cnt=0;
	}
	int insert(vi& c,int n,int k) {
		int j=0;
		rep(i,0,n-1) {
			if(!ch[j][c[i]]) {
				ch[j][c[i]]=++cnt;
				memset(ch[cnt],0,sizeof(ch[cnt]));
			}
			j=ch[j][c[i]];
		}
		if(!ch[j][0]) {
			ch[j][0]=++cnt;
			memset(ch[cnt],0,sizeof(ch[cnt]));
		}
		if(!ch[j][1]) {
			ch[j][1]=++cnt;
			memset(ch[cnt],0,sizeof(ch[cnt]));
		}
		return ch[j][k];
	}
	void dfs(int x) {
		if(!ch[x][0]&&!ch[x][1]) st[x]=en[x]=++tot;
		else {
			dfs(ch[x][0]);dfs(ch[x][1]);
			st[x]=st[ch[x][0]];
			en[x]=en[ch[x][1]];
		}
	}
	int check(int x) {
		rep(i,0,mask[x].size()-1) {
			int y=mask[x][i];
			update(1,1,tot,st[y],en[y],1);
		}
		if(!ch[x][0]&&!ch[x][1]) {
			int res=findmin(1,1,tot);
			rep(i,0,mask[x].size()-1) {
				int y=mask[x][i];
				update(1,1,tot,st[y],en[y],-1);
			}
			return res;
		}
		if(!check(ch[x][0])) return 0;
		if(!check(ch[x][1])) return 0;
		rep(i,0,mask[x].size()-1) {
			int y=mask[x][i];
			update(1,1,tot,st[y],en[y],-1);
		}
		return 1;
	}
	void printtree(int x,vi c) {
		vi tmp=c;
		if(!ch[x][0]&&!ch[x][1]) {
			print(c);
			return;
		}
		tmp.pb(0);printtree(ch[x][0],tmp);
		c.pb(1);printtree(ch[x][1],c);
	}
	void complete() {
		dwn(j,cnt,0) {
			if(ch[j][0]&&!ch[j][1]) {
				ch[j][1]=++cnt;
				memset(ch[cnt],0,sizeof(ch[cnt]));
			} 
			if(ch[j][1]&&!ch[j][0]) {
				ch[j][0]=++cnt;
				memset(ch[cnt],0,sizeof(ch[cnt]));
			} 
		}
	}
}Tc,Tl;
pii p[maxn];
int ps;
void solve() {
    m=read();ps=0;
    int h=0,haveroot=0;
    Tc.init();Tl.init();
	while(m--) {
		n=read();
		rep(i,1,n) l[i]=read(),r[i]=read();
		if(n==1) {
			haveroot=1;
			continue;
		}
		sl.clear();sc.clear();
		if(dfs(1)) {
			int nc=sc.size(),nl=sl.size();
			if(sl[nl-2]==1&&sl[nl-1]==0) {
				p[++ps]=mp(Tc.insert(sc,nc,0),Tl.insert(sl,nc,0));
			}
			else if(sl[nl-2]==0&&sl[nl-1]==1) {
				p[++ps]=mp(Tc.insert(sc,nc,1),Tl.insert(sl,nc,0));
			}
			else {
				p[++ps]=mp(Tc.insert(sc,nc,0),Tl.insert(sl,nc,1));
				p[++ps]=mp(Tc.insert(sc,nc,1),Tl.insert(sl,nc,1));
			}
			h=max(h,(int)sc.size()+2);
		}
	}
	Tc.complete();
	Tl.complete();
	rep(i,0,Tc.cnt) mask[i].clear();
	rep(i,1,ps) mask[p[i].xx].pb(p[i].yy);
	tot=0;Tl.dfs(0);
	if(haveroot) {
		puts("Almost Complete");
		return;
	}
	memset(sum,0,sizeof(sum));
	puts(Tc.check(0)?"Almost Complete":"No");
}
int main() {
	srand(52501);
	freopen("surreal.in","r",stdin);
	freopen("surreal.out","w",stdout);
	int T=read();
	while(T--) solve();
	return 0;
}

```
