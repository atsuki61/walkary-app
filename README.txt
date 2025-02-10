2025/2/10 西田圭佑
python 3.11.2

python manage.py runserver

・システムの再現手順
本システムを再現するための基本的な流れ。

１．GitHub からリポジトリをクローン
git clone https://github.com/kcg-c-seminar-34/2024C24.git
cd 2024C24

2．環境変数の設定 .env.example をもとに .env ファイルを作成し、適切な値を設定

3．仮想環境の作成・依存関係のインストール
python -m venv myvenv 
.\myvenv\Scripts\activate
pip install -r requirements.txt

4．データベースのマイグレーション
python manage.py migrate

5．GitHubのアカウントを作成して、リポジトリを作成。作成したリポジトリにプッシュ

6．Render.comにデプロイ
・5で作成したGitHubアカウントでサインインを行う。

・Blueprintsを選択し、New Bluepints instance  をクリックする。

・Connect a repositoryで先ほどpushを行ったリポジトリを接続する。

・Service Group Nameにrender.yamlで記載されているservicesのnameを入力。

・しばらくすると、Dashboard にdjango_renderが表示されるので、django_renderをクリックして、Enviroment をクリック。

・Environment VariablesのPYTHON_VERSIONを3.11.9に変更。

・Environment Variablesに以下を追加。
    SUPERUSER_NAME　admin
    SUPERUSER_EMAIL　admin@example.com
    SUPERUSER_PASSWORD　 admin1111

・Save onlyで保存。

・Manual Deploy ボタンのDeploy last commitでデプロイ。

・Render が自動生成した URL にアクセスしてデプロイできてるか確認。
