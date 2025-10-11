# 1_extrair_dados_reais.py (Versão com Tipo de Commit)

import os
import requests
import pandas as pd
import re
import sys
import json

USAR_DADOS_REAIS = True
DADOS_TREINO_FINAL_CSV = 'dados_treino_unificados.csv'


def extrair_tipo_commit(titulo):
    match = re.search(r'^(\w+)(?:\(.*\))?:', str(titulo))
    if match:
        return match.group(1)
    return 'outro' # Retorna 'outro' se não seguir o padrão

def buscar_dados_reais_github():
    print("-> MODO REAL: Buscando dados da API do GitHub...")
    TOKEN = os.getenv('GITHUB_TOKEN')
    REPO = os.getenv('GITHUB_REPOSITORY')
    if not all([TOKEN, REPO]):
        sys.exit("ERRO: Variáveis de ambiente GITHUB_TOKEN e GITHUB_REPOSITORY são necessárias.")
    headers = {'Authorization': f'Bearer {TOKEN}'}
    api_url = f"https://api.github.com/repos/{REPO}/pulls?state=closed&per_page=100"
    try:
        response = requests.get(api_url, headers=headers)
        response.raise_for_status()
        prs_data = response.json()
    except requests.exceptions.RequestException as e:
        sys.exit(f"Erro ao buscar PRs do GitHub: {e}")
    lista_de_prs = []
    for pr in prs_data:
        pr_detail_url = pr['url']
        try:
            detail_response = requests.get(pr_detail_url, headers=headers)
            detail_response.raise_for_status()
            pr_detail = detail_response.json()
            
            titulo_pr = pr_detail.get('title') # Pega o título
            
            lista_de_prs.append({
                'autor_do_pr': pr_detail.get('user', {}).get('login'),
                'titulo_do_pr': titulo_pr,
                'linhas_adicionadas': pr_detail.get('additions', 0),
                'linhas_removidas': pr_detail.get('deletions', 0),
                'arquivos_alterados': pr_detail.get('changed_files', 0),
                'tipo_commit': extrair_tipo_commit(titulo_pr) # 
            })
        except requests.exceptions.RequestException:
            continue
    print(f"   - Encontrados {len(lista_de_prs)} Pull Requests no GitHub.")
    return pd.DataFrame(lista_de_prs)

def buscar_dados_reais_notion():
    
    print("-> MODO REAL: Buscando dados da API do Notion...")
    NOTION_SECRET = os.getenv('NOTION_SECRET')
    DATABASE_ID = os.getenv('NOTION_DATABASE_ID')
    if not all([NOTION_SECRET, DATABASE_ID]):
        sys.exit("ERRO: As variáveis de ambiente NOTION_SECRET e NOTION_DATABASE_ID são necessárias.")
    headers = {"Authorization": f"Bearer {NOTION_SECRET}", "Content-Type": "application/json", "Notion-Version": "2022-06-28"}
    api_url = f"https://api.notion.com/v1/databases/{DATABASE_ID}/query"
    try:
        response = requests.post(api_url, headers=headers, json={})
        response.raise_for_status()
        bugs_data = response.json().get('results', [])
    except requests.exceptions.RequestException as e:
        sys.exit(f"Erro ao buscar bugs do Notion: {e.response.text}")
    lista_de_bugs = []
    for bug in bugs_data:
        properties = bug.get('properties', {})
        try:
            unique_id_prop = properties.get('ID', {}).get('unique_id', {})
            prefix = unique_id_prop.get('prefix')
            number = unique_id_prop.get('number')
            if prefix and number is not None:
                card_id = f"{prefix}-{number}"
                prioridade = properties.get('Criticidade', {}).get('select', {}).get('name')
                lista_de_bugs.append({'id_do_card': card_id, 'prioridade': prioridade})
        except (TypeError, IndexError):
            continue
    print(f"   - Encontrados {len(lista_de_bugs)} bugs no Notion.")
    return pd.DataFrame(lista_de_bugs)


def unir_e_preparar_dados(df_github, df_notion):
    print("\nIniciando a união e rotulagem dos dados...")
    def extrair_id_notion(titulo):
        match = re.search(r'\(notion:(BUGS-\d+)\)', str(titulo))
        return match.group(1) if match else None
    df_github['id_notion_linkado'] = df_github['titulo_do_pr'].apply(extrair_id_notion)
    lista_de_bugs_reais = df_notion['id_do_card'].tolist()
    df_github['gerou_bug'] = df_github['id_notion_linkado'].isin(lista_de_bugs_reais).astype(int)
    df_final = pd.merge(df_github, df_notion, left_on='id_notion_linkado', right_on='id_do_card', how='left')
    
   
    colunas_para_treino = ['autor_do_pr', 'linhas_adicionadas', 'linhas_removidas', 'arquivos_alterados', 'tipo_commit', 'prioridade', 'gerou_bug']
    
    df_final = df_final[colunas_para_treino]
    df_final.to_csv(DADOS_TREINO_FINAL_CSV, index=False)
    print(f"-> Processo concluído! Dataset final salvo em '{DADOS_TREINO_FINAL_CSV}'.")
    print(f"Distribuição de bugs no dataset final:\n{df_final['gerou_bug'].value_counts()}")

def main():
    # ... (esta função não precisa de alteração)
    df_github_prs = buscar_dados_reais_github()
    df_notion_bugs = buscar_dados_reais_notion()
    if df_notion_bugs.empty:
        print("\nAVISO: Nenhum bug foi lido do Notion. O processo de treinamento será interrompido.")
        sys.exit(0)
    unir_e_preparar_dados(df_github_prs, df_notion_bugs)

if __name__ == "__main__":
    main()