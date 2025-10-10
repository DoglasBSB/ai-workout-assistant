# 2_treinar_modelo.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

print("PASSO 2: Iniciando o treinamento do modelo...")
NOME_ARQUIVO_DADOS = "dados_treino_unificados.csv"
df = pd.read_csv(NOME_ARQUIVO_DADOS)

# ✅ ALTERAÇÃO AQUI: Removendo a linha de 'modulo_afetado'
df['prioridade'].fillna('Nenhuma', inplace=True)

df_encoded = pd.get_dummies(df, columns=['autor_do_pr', 'prioridade'], drop_first=True)

X = df_encoded.drop(['gerou_bug'], axis=1)
y = df_encoded['gerou_bug']

MODEL_COLUMNS = X.columns
joblib.dump(MODEL_COLUMNS, 'model_columns.joblib')

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
model.fit(X_train, y_train)
print("Modelo treinado com sucesso.")

y_pred = model.predict(X_test)
print("\n--- Avaliação do Modelo no Conjunto de Teste ---")
print(f"Acurácia: {accuracy_score(y_test, y_pred):.2f}")
print(classification_report(y_test, y_pred))

NOME_ARQUIVO_MODELO = "modelo_preditivo.joblib"
joblib.dump(model, NOME_ARQUIVO_MODELO)
print(f"\nModelo e colunas salvos com sucesso em '{NOME_ARQUIVO_MODELO}' e 'model_columns.joblib'.")