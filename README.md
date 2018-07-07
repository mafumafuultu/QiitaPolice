# Qiita警察

![licence](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)

Qiitaに投稿されるスパムを検出するために使用する。  
最新投稿20件に対して、チェックを行う。

## install

## build

powershell

```
npm run less
npm run build
cp ./resources/* ../build/QiitaPolice-win32-x64/resources -recurse -force
```

## 機能

### new item
最新投稿から20件取得し、フィルタを適用し、その結果を表示する。


### Export
フィルタにマッチしたデータを書き出す。
`./resource/rejectedData/rejected.txt` に追記される。

### Test
テストデータに対してフィルタを適用し、その結果を表示する。

### mark NG
投稿ごとに用意しているボタンで、フィルタにマッチしなかったが、問題がある投稿としてマークする。


## Filter
### NG word filter
単語単位にフィルタをかける。  
`./resource/filter/ngword.json` に単語を記載することでフィルタを行う。


### NG idiom filter
熟語単位にフィルタをかける。  
`./resource/filter/ngidiom.json` に熟語を記載することでフィルタを行う
