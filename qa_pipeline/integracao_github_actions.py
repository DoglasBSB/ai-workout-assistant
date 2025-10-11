# qa_pipeline/3_integracao_github_actions.py (Versão com Tipo de Commit)

import os
import requests
import pandas as pd
import joblib
import re 
import sys

print("PASSO 3: Iniciando integração com GitHub Actions...")


def extrair_tipo_commit(titulo):
    match = re.search(r'^(\w+)(?:\(.*\))?:', str(titulo))
    if match:
        return match.group(1)
    return 'outro'

def analisar_novo_pr(dados_pr):
    try:
        model = joblib.load("modelo_preditivo.joblib")
        model_columns = joblib.load("model_columns.joblib")
    except FileNotFoundError:
        return "ERRO: Modelo não encontrado. O modelo deve estar no repositório."

    df_novo = pd.DataFrame([dados_pr])
    df_novo['prioridade'] = 'Nenhuma'

    if 'tipo_commit' not in df_novo.columns:
        df_novo['tipo_commit'] = 'outro'
    df_novo['tipo_commit'] = df_novo['tipo_commit'].fillna('outro')
    
    df_novo_encoded = pd.get_dummies(df_novo)
    df_novo_processed = df_novo_encoded.reindex(columns=model_columns, fill_value=0)

    probabilidades = model.predict_proba(df_novo_processed)
    prob_bug = probabilidades[0][1]

    if prob_bug > 0.7: nivel_risco = "ALTO"
    elif prob_bug > 0.4: nivel_risco = "MÉDIO"
    else: nivel_risco = "BAIXO"

    #  Adiciona o tipo de commit aos fatores de risco no comentário
    comentario = f"""
    🤖 **Análise Preditiva de QA**
    - **Nível de Risco do PR:** `{nivel_risco}`
    - **Probabilidade de Bug:** `{prob_bug:.2%}`
    - **Fatores de Risco Analisados:**
        - Autor: `{dados_pr['autor_do_pr']}`
        - Tipo de Commit: `{dados_pr['tipo_commit']}`
        - Arquivos Alterados: `{dados_pr['arquivos_alterados']}`
        - Linhas Adicionadas: `{dados_pr['linhas_adicionadas']}`
    - **Sugestão para QA:**
    """
    if nivel_risco == "ALTO":
        comentario += "    - 🔴 **Prioridade máxima.** Recomenda-se teste de regressão completo e exploração manual."
    elif nivel_risco == "MÉDIO":
        comentario += "    - 🟡 **Prioridade moderada.** Recomenda-se executar a suíte de testes automatizados relevante."
    else:
        comentario += "    - 🟢 **Prioridade baixa.** Um teste de fumaça (smoke test) deve ser suficiente."
    
    return comentario

if __name__ == "__main__":
    TOKEN = os.getenv('GITHUB_TOKEN')
    REPO = os.getenv('GITHUB_REPOSITORY')
    PR_NUMBER = os.getenv('PULL_REQUEST_NUMBER')
    
    if not all([TOKEN, REPO, PR_NUMBER]):
        print("\nVariáveis de ambiente do GitHub Actions não encontradas. Rodando com dados de exemplo locais.")
        pr_de_alto_risco = {
            'autor_do_pr': 'dev_junior', 
            'linhas_adicionadas': 950, 
            'linhas_removidas': 50, 
            'arquivos_alterados': 25,
            'tipo_commit': 'feat'
        }
        print("\n--- Analisando um PR de ALTO RISCO (simulado) ---")
        print(analisar_novo_pr(pr_de_alto_risco))
    else:
        print(f"Rodando em ambiente GitHub Actions para o PR #{PR_NUMBER} em {REPO}...")
        headers = {'Authorization': f'Bearer {TOKEN}', 'Accept': 'application/vnd.github.v3+json'}
        api_url = f"https://api.github.com/repos/{REPO}/pulls/{PR_NUMBER}"
        try:
            response = requests.get(api_url, headers=headers)
            response.raise_for_status()
            pr_data = response.json()
            
            titulo_pr = pr_data.get('title')
            
            dados_pr_para_modelo = {
                'autor_do_pr': pr_data.get('user', {}).get('login'),
                'linhas_adicionadas': pr_data.get('additions', 0),
                'linhas_removidas': pr_data.get('deletions', 0),
                'arquivos_alterados': pr_data.get('changed_files', 0),
                'tipo_commit': extrair_tipo_commit(titulo_pr) # ✅ ALTERAÇÃO AQUI
            }
            resultado_analise = analisar_novo_pr(dados_pr_para_modelo)
            comments_url = f"https://api.github.com/repos/{REPO}/issues/{PR_NUMBER}/comments"
            payload = {'body': resultado_analise}
            response_comment = requests.post(comments_url, headers=headers, json=payload)
            response_comment.raise_for_status()
            print(f"Comentário postado com sucesso no Pull Request #{PR_NUMBER}.")
        except requests.exceptions.RequestException as e:
            sys.exit(f"Erro ao interagir com a API do GitHub: {e}")