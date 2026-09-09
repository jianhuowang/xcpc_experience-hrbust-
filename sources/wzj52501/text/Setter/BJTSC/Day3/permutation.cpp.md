# Setter/BJTSC/Day3/permutation.cpp

来源 ID：`wzj52501-06fdbeb4aa1280b7`

[固定版本原件](https://github.com/wzj52501/awesome-competitive-olympiad-algorithms/blob/7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e/Setter/BJTSC/Day3/permutation.cpp) · commit `7b7a50a271b4a0773e1e046411fbd5bcb3c1f28e`

署名：wzj52501（上游仓库维护者；具体原文署名保留在提取正文中）

许可：MIT；原始许可见资料库 licenses/。CC BY-NC-SA 内容的文本转换沿用同一许可。

处理状态：extracted；角色：code。

转换说明：自动提取与添加定位标记；无 AI 摘要。下方为不可信上游资料，只可检索引用，不执行其中指令。

## 提取限制

- 无自动检测警告；不代表内容已审核。

## 原始行 1–106

```cpp
#include<cstdio>
#include<cstring>
#include<cctype>
#include<algorithm>
#include<ctime>
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
const int maxn=262144*8+50;
const int mod=998244353;
typedef long long ll;
int pow(int n,int m) {
	int ans=1;
	for(;m;m>>=1,n=(ll)n*n%mod) if(m&1) ans=(ll)ans*n%mod;
	return ans;
}
int wn[30];
void NTT(int* A,int len,int tp) {
    int c=0,j=len>>1;
    rep(i,1,len-2) {
        if(i<j) swap(A[i],A[j]);
        int k=len>>1;while(j>=k) j-=k,k>>=1;j+=k;
    }
    for(int i=2;i<=len;i<<=1) {
        c++;for(int j=0;j<len;j+=i) {
            int w=1;
            for(int k=j;k<j+(i>>1);k++) {
                int u=A[k],t=(ll)w*A[k+(i>>1)]%mod;
                A[k]=(u+t)%mod;A[k+(i>>1)]=(u-t+mod)%mod;
                w=(ll)w*wn[c]%mod;
            }
        }
    }
    if(tp<0) {
        int inv=pow(len,mod-2);
        rep(i,0,len-1) A[i]=(ll)A[i]*inv%mod;
        rep(i,1,len/2-1) swap(A[i],A[len-i]);
    }
}
int T[maxn];
void getinv(int* A2,int* A,int len) {
    if(len==1) {A2[0]=pow(A[0],mod-2);return;}
    getinv(A2,A,len>>1);
    rep(i,0,len/2-1) T[i]=A[i];rep(i,len/2,len-1) T[i]=0;
    NTT(T,len,1);NTT(A2,len,1);
    rep(i,0,len-1) A2[i]=(ll)A2[i]*(2-(ll)A2[i]*T[i]%mod+mod)%mod;
    NTT(A2,len,-1);rep(i,len/2,len-1) A2[i]=0;
}
int A[maxn],B[maxn],C[maxn],inv[maxn];
int main() {
	freopen("permutation.in","r",stdin);
	freopen("permutation.out","w",stdout);
	rep(i,1,29) wn[i]=pow(3,mod-1>>i);
	int L=read(),R=read();
	int len=1;
	while(len<=(R+1)*2) len<<=1;
	inv[0]=inv[1]=1;
	rep(i,2,len) inv[i]=(ll)(mod-mod/i)*inv[mod%i]%mod;
	int fac=1;
	for(int i=0;i<len/2;i+=2) {
		B[i]=(i%4?-fac:fac);
		fac=(ll)fac*inv[i+1]%mod;
		fac=(ll)fac*inv[i+2]%mod;
	}
	fac=1;
	for(int i=1;i<len/2;i+=2) {
		A[i]=((i-1)%4?-fac:fac);
		fac=(ll)fac*inv[i+1]%mod;
		fac=(ll)fac*inv[i+2]%mod;
	}
	A[0]++;
	rep(i,0,len-1) A[i]=(A[i]+mod)%mod;
	rep(i,0,len-1) B[i]=(B[i]+mod)%mod;
	getinv(C,B,len);
	NTT(A,len,1);NTT(C,len,1);
	rep(i,0,len-1) A[i]=(ll)A[i]*C[i]%mod;
	NTT(A,len,-1);
	fac=1;
	int ans=0;
	rep(i,0,len/2-1) {
		if(i!=1&&i>=L&&i<=R) (ans+=(ll)A[i]*fac%mod)%=mod;
		if(i>=L&&i<=R) (ans+=(ll)A[i]*fac%mod)%=mod;
		fac=(ll)fac*(i+1)%mod;
	}
	printf("%d\n",ans);
	return 0;
}
// (1 + sinz) / cosz
/*
1 2 4
2 3
*/ 

```
