# @repo/etl

FAMIC（農林水産消費安全技術センター）の農薬登録情報エクセルファイル（.xls）をCSVに変換するスクリプト。

## 前提条件

- FAMICからダウンロードしたエクセルファイルが `assets/raw/` に配置されていること
  - `登録基本部.xls`
  - `登録適用部一.xls`
  - `登録適用部二.xls`
- データソース: https://www.acis.famic.go.jp/ddata/index2.htm

## 使い方

```bash
# リポジトリルートから実行
pnpm etl convert
```

`assets/csv/` に以下のファイルが出力される。

| ファイル | 内容 | 行数目安 |
|---------|------|---------|
| `pesticides.csv` | 農薬基本情報（登録番号、名称、有効成分、剤型など） | 約6,300行 |
| `applications.csv` | 適用情報（作物名、病害虫、希釈倍率など）。適用部一・二を結合 | 約100,000行 |

## 出力仕様

- エンコーディング: UTF-8
- 区切り文字: カンマ
- ヘッダー: 英語スネークケース
- null値: 空文字
- 登録年月日: Excelシリアル値から `YYYY-MM-DD` に変換

## データ更新手順

1. FAMICの[ダウンロードページ](https://www.acis.famic.go.jp/ddata/index2.htm)から最新のエクセルファイルをダウンロード
2. `assets/raw/` のファイルを差し替え
3. `pnpm etl convert` を実行
