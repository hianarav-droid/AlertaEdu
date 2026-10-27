# Presença Inteligente

Protótipo escolar para acompanhar frequência, identificar padrões de faltas e organizar ações de apoio. Todos os nomes e registros de exemplo são fictícios.

## Estrutura

- `index.html`: estrutura das telas.
- `styles.css`: aparência responsiva.
- `js/config.js`: configuração do Supabase.
- `js/app.js`: comportamento da interface e conexão com o banco.
- `supabase/schema.sql`: tabelas, regras de acesso (RLS) e dados fictícios iniciais.

## Rodar localmente

A forma mais simples é usar a extensão **Live Server** no Visual Studio Code ou um servidor local. Também é possível abrir `index.html` diretamente para explorar o modo de demonstração local.

## Conectar ao Supabase

1. Crie um projeto em https://supabase.com/.
2. No painel, abra **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e execute.
3. Em **Project Settings / API** (ou Connect), copie a URL do projeto e a chave publicável (`publishable key` / `anon key` legada).
4. Edite `js/config.js` e preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
5. No Supabase, habilite cadastro/login por e-mail em **Authentication / Providers**.
6. Crie uma conta de teste em Authentication / Users (ou use a tela de login/cadastro, se habilitada).
7. Abra o site via Live Server e entre com a conta de teste.

**Importante:** a chave publicável pode ficar no navegador apenas porque as tabelas usam Row Level Security (RLS). Nunca coloque `service_role`, chaves secretas ou senha de banco no frontend ou no GitHub. As políticas incluídas permitem que usuários autenticados do protótipo acessem os dados escolares de demonstração; isso NÃO é uma configuração adequada para dados reais de alunos. Para uso real, crie papéis/permissões por escola e função e revise a segurança com um responsável técnico.

## Publicar no GitHub Pages

1. Crie um repositório público chamado `presenca-inteligente`.
2. Envie os arquivos desta pasta para a raiz do repositório.
3. Abra **Settings → Pages**.
4. Em Build and deployment, selecione **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
5. Aguarde o link publicado aparecer na tela do GitHub Pages.

O GitHub Pages hospeda os arquivos estáticos; o Supabase é que fornece o banco/API. Se publicar com credenciais Supabase, mantenha RLS ativo e não use dados reais ou sensíveis neste protótipo.
