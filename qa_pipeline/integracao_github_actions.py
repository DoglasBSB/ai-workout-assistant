# qa_pipeline/3_integracao_github_actions.py (Versão com Arquivo de Payload)

import os
import requests
import pandas as pd
import joblib
import re
import sys
import json

# ... (todo o início do arquivo até o if __name__ == "__main__" permanece o mesmo) ...
def extrair_tipo_commit(titulo):
    match = re.search(r'^(\w+)(?:\(.*\))?:', str(titulo))
    if match: return match.group(1)
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
    comentario = f"""🤖 **Análise Preditiva de QA**
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
        # Bloco de teste local não muda
    else:
        try:
            # Busca de dados do PR não muda
            headers = {'Authorization': f'Bearer {TOKEN}', 'Accept': 'application/vnd.github.v3+json'}
            api_url = f"https://api.github.com/repos/{REPO}/pulls/{PR_NUMBER}"
            response = requests.get(api_url, headers=headers)
            response.raise_for_status()
            pr_data = response.json()
            titulo_pr = pr_data.get('title')
            dados_pr_para_modelo = {
                'autor_do_pr': pr_data.get('user', {}).get('login'),
                'linhas_adicionadas': pr_data.get('additions', 0),
                'linhas_removidas': pr_data.get('deletions', 0),
                'arquivos_alterados': pr_data.get('changed_files', 0),
                'tipo_commit': extrair_tipo_commit(titulo_pr)
            }
            resultado_analise = analisar_novo_pr(dados_pr_para_modelo)

            # Posta o comentário no GitHub
            comments_url = f"https://api.github.com/repos/{REPO}/issues/{PR_NUMBER}/comments"
            payload_github = {'body': resultado_analise}
            requests.post(comments_url, headers=headers, json=payload_github).raise_for_status()
            print(f"Comentário postado com sucesso no Pull Request #{PR_NUMBER}.")

            # Gera o payload COMPLETO para o Slack
            pr_url = pr_data.get('html_url')
            pr_title = pr_data.get('title')
            
            slack_payload = {
                "text": f"Nova Análise de Risco de QA para o PR #{PR_NUMBER}",
                "blocks": [
                    {"type": "section", "text": {"type": "mrkdwn", "text": f"Nova Análise de Risco de QA para o Pull Request: *<{pr_url}|#{PR_NUMBER} {pr_title}>*"}},
                    {"type": "divider"},
                    {"type": "section", "text": { "type": "mrkdwn", "text": resultado_analise }}
                ]
            }

            # ✅ ALTERAÇÃO AQUI: Salva o payload em um arquivo JSON
            with open('slack_payload.json', 'w') as f:
                json.dump(slack_payload, f)
            print("Payload do Slack salvo em slack_payload.json")

        except Exception as e:
            sys.exit(f"Ocorreu um erro: {e}")