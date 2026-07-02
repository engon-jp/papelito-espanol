# ¿Cómo estás? — ESTAR 作文練習アプリ

## 概要
動詞 **estar** と主語人称代名詞の作文練習アプリ。Papelito Español の第3メニュー。¡Soy estudiante! をベースに（見た目・操作感・サマリ/復習モードをそのまま踏襲）、中身を estar の2大用法＝**状態**（¿Cómo estás? ― Estoy muy bien.）と**場所**（¿Dónde estáis? ― Estamos en la estación.）に差し替えたもの。学生にスマホ配布する前提。

## 基本情報
- **形態**：単一 `index.html`（ゼロビルド・依存なし・vanilla JS）。PWA対応（`manifest.json`・アイコン設定済み・ルート `sw.js` によるオフライン対応）。
- **保存キー**：localStorage `estar-trainer-v1`（レベル・ラウンド・スコア・各問の正誤）。
- **1ラウンド**：10問（その場自動生成）。レベル別に独立。サマリ画面＋間違えた問題の復習モードあり（実装は姉妹アプリと同一構造）。
- **音声**：文はその場生成のため端末の音声合成（Web Speech API, `es-ES`）。主語人称代名詞表は `assets/audio/pronouns/{singular,plural}.mp3`（ElevenLabs音声・姉妹アプリからコピー）。**estar 活用表の `assets/audio/conjugation/estar.mp3` は未生成**（それまで音声合成で代替。ElevenLabs での生成は任意・後日）。
- **判定**：Nivel 1〜3 は厳格一致（大小文字・アクセント・記号）。Nivel 4 は自己採点。

## 設計判断（2026-07-02）
- **その場生成方式**（¡Soy estudiante! と同じ）。固定文リストは作らない。
- **estar は6形中4形にアクセント**（estás・está・estáis・están）→ アクセント入力練習の主戦場。活用表にも注意書きあり。
- **補語は3種構造**（語彙の差し替えはデータ部の配列だけで完結）：
  1. `STATES_INV` 状態・無変化：bien／muy bien／mal／regular。`q`/`neg` フラグで不自然な組合せ（「¿Estás regular?」「no … regular」等）を出題から除外。
  2. `STATES_ADJ` 状態・形容詞（性数一致4形）：cansado／contento／enfermo／ocupado／nervioso／triste（tristeは数のみ変化＝2択）。
  3. `PLACES` 場所（en＋名詞・無変化）：en casa／en la universidad／en la estación／en la biblioteca／en la cafetería／en el tren／en Tokio／en España。
- **Nivel 3/4 の一問一答は3形式**：疑問詞 cómo 35%（状態）／dónde 35%（場所）／sí-no型 30%（ser アプリと同型・状態場所両方）。**疑問詞型の3人称は倒置語順**（¿Dónde está él?＝疑問詞→動詞→主語・主語は小文字）。疑問詞型の答えは肯定のみ・主語省略（Estoy muy bien.）。
- 語彙は遠藤さんの了承済み提案リスト（大学生活中心）で実装。**教科書に合わせた微調整は後日**（要リスト）。
- 現在進行形（estar + gerundio）は対象外（将来の別メニュー候補）。

## 出題仕様
- **Nivel 1**：3つの選択枠 ①主語（4択・性ペア排他）②estar（6形から4択）③補語（無変化=4語の意味弁別／形容詞=同一語4形の一致弁別／場所=4か所の意味弁別）。否定は`no`固定枠。
- **Nivel 2**：①②③手入力（③はタップでヒント）。文頭自動大文字化・アクセントバー。
- **Nivel 3**：一問一答。疑問詞型=「¿[疑問詞][estar]([3人称主語])?」＋「[estar][補語].」／sí-no型=ser アプリと同構成。疑問詞・estar・Sí/No は手入力、補語はタップでヒント。
- **Nivel 4**：質問文・答え文の2欄に全文手入力→正解表示→自己採点。
- **単語チェック**：日→西のみ。estar・疑問詞（cómo/dónde）・状態10種（形容詞は4形併記）・場所8種。

## 現在のステータス（最終更新: 2026-07-02）
- 実装完了（`index.html` / `manifest.json` / アイコン180・192・512px＝地図ピン＋スマイル / pronouns音声コピー / 親ランチャーにカード追加 / `sw.js` PRECACHE 追加）。
- ローカル検証済み：genStatement・genQA 各5,000件のサンプリングで活用一致・性数一致・語順・記号・不自然組合せ除外のエラー0。N1〜N4のUIフロー・自己採点・回帰（既存2アプリ）・コンソール/ネットワークエラー0。
- **ローカル試用後の修正（2026-07-02・第2弾）**：
  1. contento の訳語「うれしい」→「満足している」に統一（jaA/jaNeg/jaQ・VOCAB）
  2. **muy bien は Nivel 1/2（4択）に出さない**方針に変更。`bien` と紛らわしく、4択の中で正誤判定される場合に違和感があったため。`STATES_INV` に `basic` フラグを追加し、`pickComplement()` に `basicOnly` 引数を新設。`genStatement()`（N1/2用）は `basicOnly=true` で呼び出し、`genQAWh`/`genQASiNo`（N3/4用）は従来どおり（`muy bien` は手入力の一問一答でのみ出題される＝遠藤さんの最初の例文 "Estoy muy bien." はこの経路で再現される）
  3. mal の訳語「具合が悪い」→「調子が悪い」に統一（jaA/jaNeg/jaQ・VOCAB）
  4. UI文言の「補語」を「状態・場所」に変更（HINTS・Nivel1のシートタイトル「補語を選ぶ」→「状態・場所を選ぶ」）。理由：学生にとって分かりにくい文法用語であるうえ、`en España` 等の場所句は厳密には「補語」ではないため。※ ¡Soy estudiante! 側の「補語」は学生/先生/国籍という真の述語補語なので変更していない（統一したい場合は要相談）
  5. 単語チェックから estar を削除（活用表で別途扱うため語彙カードとしては不要）。bien/muy bien/mal/regular に品詞（副詞／副詞句）を明記（形容詞グループは元々「形容詞」表記あり）
  6. **Nivel 4 のバグ修正**：答え欄プレースホルダーが疑問詞型（cómo/dónde）でも常に「Sí/No, ….」と表示され、sí/no を含まない答え文（例："Estoy cansado."）と矛盾していた。`prob.qKind` で分岐し、疑問詞型は「….」に変更
  7. 単語チェックの品詞表記「男/女/男複/女複」→「男/女/単/複」に統一（性と数の2軸を示す表記として簡潔化。¡Soy estudiante! の国籍語彙も同様に統一）
- 未公開（コミット済み・push は遠藤さん確認後）。

## 次のアクション
- 語彙を教科書に合わせて微調整（遠藤さんからリストをもらう）。
- `assets/audio/conjugation/estar.mp3` を ElevenLabs で生成・配置（任意）。
- 画像生成（Atelier等）でのマスコット差し替えは姉妹アプリと同じ Phase B。

## 資料の所在
- ベースにしたアプリ：`~/Documents/_MyProjects/アプリ制作/soy-estudiante/`（構造・共通機能の設計メモは同アプリと yo-hablo-espanol の PROGRESS.md 参照）。
- 実装計画（設計協議の記録）：`~/.claude/plans/estar-joyful-stonebraker.md`（2026-07-02）。
