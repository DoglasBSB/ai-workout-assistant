# qa_pipeline/3_integracao_github_actions.py (Versão com Análise de Módulos)

import os
import requests
import pandas as pd
import joblib
import re
import sys
import json
from collections import defaultdict # Usaremos para agrupar ficheiros por diretório

print("PASSO 3: Iniciando integração com GitHub Actions...")

def extrair_tipo_commit(titulo):
    match = re.search(r'^(\w+)(?:\(.*\))?:', str(titulo))
    if match: return match.group(1)
    return 'outro'

# ✅ ALTERAÇÃO AQUI: A função agora também recebe a lista de módulos afetados
def analisar_novo_pr(dados_pr, modulos_afetados):
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

    # Constrói a string dos módulos afetados
    modulos_str = "\n        - ".join(f"`{modulo}`" for modulo in modulos_afetados) if modulos_afetados else "Nenhum específico identificado" # Adiciona ` para formatar como código

    # ✅ ALTERAÇÃO AQUI: Adiciona a seção "Módulos Afetados" ao comentário
    comentario = f"""
    🤖 **Análise Preditiva de QA**
    - **Nível de Risco do PR:** `{nivel_risco}`
    - **Probabilidade de Bug:** `{prob_bug:.2%}`
    - **Fatores de Risco Analisados:**
        - Autor: `{dados_pr['autor_do_pr']}`
        - Tipo de Commit: `{dados_pr['tipo_commit']}`
        - Arquivos Alterados: `{dados_pr['arquivos_alterados']}`
        - Linhas Adicionadas: `{dados_pr['linhas_adicionadas']}`
    - **Módulos Afetados:**
        - {modulos_str}
    - **Sugestão para QA:**
    """
    if nivel_risco == "ALTO":
        comentario += "    - 🔴 **Prioridade máxima.** Foco nos módulos afetados. Recomenda-se teste de regressão completo e exploração manual."
    elif nivel_risco == "MÉDIO":
        comentario += "    - 🟡 **Prioridade moderada.** Validar funcionalidade principal e testar módulos afetados."
    else:
        comentario += "    - 🟢 **Prioridade baixa.** Um teste de fumaça (smoke test) deve ser suficiente."

    return comentario

# ✅ NOVA FUNÇÃO: Para processar a lista de ficheiros e extrair os diretórios
def extrair_modulos(lista_ficheiros):
    modulos = set()
    for ficheiro in lista_ficheiros:
        # Pega o caminho do diretório, ignorando o nome do ficheiro
        partes = ficheiro.split('/')
        if len(partes) > 1:
            # Adiciona o caminho até ao diretório pai
            modulos.add("/".join(partes[:-1]))
        # Se for um ficheiro na raiz, podemos adicionar a raiz para clareza
        else:
            modulos.add("(raiz)")

    # Limita o número de módulos listados para não poluir o comentário
    return sorted(list(modulos))[:5] # Mostra no máximo os 5 primeiros diretórios únicos

if __name__ == "__main__":
    TOKEN = os.getenv('GITHUB_TOKEN')
    REPO = os.getenv('GITHUB_REPOSITORY')
    PR_NUMBER = os.getenv('PULL_REQUEST_NUMBER')

    if not all([TOKEN, REPO, PR_NUMBER]):
        # Bloco de teste local não muda significativamente, podemos omitir módulos aqui
        print("\nVariáveis de ambiente do GitHub Actions não encontradas. Rodando com dados de exemplo locais.")
        pr_de_alto_risco = {
            'autor_do_pr': 'dev_junior',
            'linhas_adicionadas': 950,
            'linhas_removidas': 50,
            'arquivos_alterados': 25,
            'tipo_commit': 'feat'
        }
        print("\n--- Analisando um PR de ALTO RISCO (simulado) ---")
        # Para teste local, passamos uma lista vazia de módulos
        print(analisar_novo_pr(pr_de_alto_risco, []))
    else:
        print(f"Rodando em ambiente GitHub Actions para o PR #{PR_NUMBER} em {REPO}...")
        headers = {'Authorization': f'Bearer {TOKEN}', 'Accept': 'application/vnd.github.v3+json'}

        try:
            # 1. Busca dados gerais do PR
            api_url_pr = f"https://api.github.com/repos/{REPO}/pulls/{PR_NUMBER}"
            response_pr = requests.get(api_url_pr, headers=headers)
            response_pr.raise_for_status()
            pr_data = response_pr.json()
            titulo_pr = pr_data.get('title')

            # 2. ✅ NOVO PASSO: Busca a lista de ficheiros alterados neste PR
            api_url_files = f"{api_url_pr}/files?per_page=100" # Aumenta o per_page para pegar mais ficheiros
            response_files = requests.get(api_url_files, headers=headers)
            response_files.raise_for_status()
            files_data = response_files.json()
            lista_nomes_ficheiros = [f['filename'] for f in files_data]
            print(f"   - Ficheiros alterados encontrados: {len(lista_nomes_ficheiros)}")

            # 3. Processa a lista de ficheiros para extrair módulos
            modulos_afetados = extrair_modulos(lista_nomes_ficheiros)
            print(f"   - Módulos afetados identificados: {modulos_afetados}")

            # 4. Prepara dados para o modelo (como antes)
            dados_pr_para_modelo = {
                'autor_do_pr': pr_data.get('user', {}).get('login'),
                'linhas_adicionadas': pr_data.get('additions', 0),
                'linhas_removidas': pr_data.get('deletions', 0),
                'arquivos_alterados': pr_data.get('changed_files', 0),
                'tipo_commit': extrair_tipo_commit(titulo_pr)
            }

            # 5. ✅ ALTERAÇÃO AQUI: Passa os módulos para a função de análise
            resultado_analise = analisar_novo_pr(dados_pr_para_modelo, modulos_afetados)

            # 6. Posta o comentário no GitHub (como antes)
            comments_url = f"https://api.github.com/repos/{REPO}/issues/{PR_NUMBER}/comments"
            payload_github = {'body': resultado_analise}
            requests.post(comments_url, headers=headers, json=payload_github).raise_for_status()
            print(f"Comentário postado com sucesso no Pull Request #{PR_NUMBER}.")

        except Exception as e:
            sys.exit(f"Ocorreu um erro: {e}")