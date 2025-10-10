# qa_pipeline/2_treinar_modelo.py (Versão Final Robusta)

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import sys

print("PASSO 2: Iniciando o treinamento do modelo...")
NOME_ARQUIVO_DADOS = "dados_treino_unificados.csv"
try:
    df = pd.read_csv(NOME_ARQUIVO_DADOS)
except FileNotFoundError:
    print(f"ERRO: Arquivo '{NOME_ARQUIVO_DADOS}' não encontrado. O script de extração falhou ou não gerou dados.")
    sys.exit(1)

df['prioridade'] = df['prioridade'].fillna('Nenhuma')
df_encoded = pd.get_dummies(df, columns=['autor_do_pr', 'prioridade'], drop_first=True)

if 'gerou_bug' not in df_encoded.columns:
    sys.exit("ERRO: A coluna 'gerou_bug' não foi encontrada no dataset. Verifique o passo de união dos dados.")

X = df_encoded.drop(['gerou_bug'], axis=1)
y = df_encoded['gerou_bug']

MODEL_COLUMNS = X.columns
joblib.dump(MODEL_COLUMNS, 'model_columns.joblib')

# ✅ NOVA VERIFICAÇÃO INTELIGENTE AQUI
# Verifica se a classe menos comum tem pelo menos 2 membros para permitir a estratificação.
min_class_count = y.value_counts().min()
stratify_option = y if min_class_count >= 2 else None

if stratify_option is None:
    print(f"\nAVISO: A menor classe tem apenas {min_class_count} membro(s). A estratificação será desativada para evitar erros.\n")

# Usa a opção de estratificação definida acima
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=stratify_option)

model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
model.fit(X_train, y_train)
print("Modelo treinado com sucesso.")

# Prevenção de erro caso o conjunto de teste seja muito pequeno e não tenha todas as classes
if len(y_test.unique()) < 2:
    print("\nAVISO: O conjunto de teste não contém ambas as classes (bugs e não-bugs), a avaliação de performance será limitada.")

y_pred = model.predict(X_test)
print("\n--- Avaliação do Modelo no Conjunto de Teste ---")
print(f"Acurácia: {accuracy_score(y_test, y_pred):.2f}")
print(classification_report(y_test, y_pred, zero_division=0))

NOME_ARQUIVO_MODELO = "modelo_preditivo.joblib"
joblib.dump(model, NOME_ARQUIVO_MODELO)
print(f"\nModelo e colunas salvos com sucesso em '{NOME_ARQUIVO_MODELO}' e 'model_columns.joblib'.")