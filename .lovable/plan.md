# Painel de Propriedades e Produtos — integração com a API Laravel

## Mapeamento da API (resumo)

```text
Públicas:   POST /api/login, /api/register, /api/verify-email
            GET  /api/properties[/:id], /api/products[/:id], /api/properties/:id/products
Autenticadas (Bearer token, prefixo /api/auth):
  Sessão:   me, refresh, logout, 2fa-register
  Usuários: user (GET, POST), user/:id (GET, DELETE)
  Propriedades: properties CRUD
  Produtos:     products CRUD, properties/:id/products CRUD
  Estoque:      products/:id/stocks/:id (PUT soma a quantidade, não sobrescreve)
  Localização:  countries > states > cities > neighborhoods > streets (CRUD em cada nível)
Listagens são paginadas (Laravel: data, current_page, last_page).
```

Campos:
- Propriedade: name, n_property, complement, main_image, cover_image, content_html, additional_info, contact1_email, contact2_email, number1, number2, number3, street_id, user_id
- Produto: name, tipo, img_main, img_cover, html, disabled, property_id, user_id (price aparece nos exemplos da API)
- Tipo do usuário: campo `tipo_nome` retornado por /api/auth/me ("admin" ou "user")

## Páginas

1. **Institucional (/)** — apresenta o projeto, como funciona (cadastro, produtos, mapas), botão "Fale conosco no WhatsApp" abrindo `https://wa.me/5513981412290`.
2. **Entrar / Cadastrar (/entrar)** — login e registro pela API.
3. **Painel do usuário (/painel)** — visual limpo, cada campo com texto explicativo:
   - Minhas propriedades: lista + formulário. Endereço digitado como País, Estado, Cidade, Bairro e Rua com sugestões; o que não existir é criado automaticamente na API antes de salvar a propriedade.
   - Meus produtos: lista + formulário com escolha da propriedade vinculada (pelo nome) e ajuste de estoque.
   - Mapa: pré-visualização, link direto e código de iframe para copiar.
   - Importar/Exportar.
4. **Painel admin (/admin)** — visível apenas para `tipo_nome = admin`. Abas por recurso (usuários, propriedades, produtos, países, estados, cidades, bairros, ruas). Cada aba é uma grande tabela editável célula a célula, com adicionar linha, excluir, busca e paginação.
5. **Mapa público (/mapa/$userId)** — tela cheia, sem menu (próprio para iframe). Marcadores das propriedades do usuário; ao clicar, abre painel com os produtos daquela loja.

## Mapa
- Leaflet + OpenStreetMap (gratuito).
- Coordenadas obtidas pelo endereço (rua, número, bairro, cidade) via Nominatim, guardadas em cache no navegador para não repetir buscas.

## Importar / Exportar
- Formatos: planilha CSV e JSON, um arquivo contendo propriedades e produtos.
- Sem IDs de chaves estrangeiras: propriedade traz o endereço por extenso (pais, estado, cidade, bairro, rua); produto traz o `n_property`/nome da propriedade a que pertence. Apenas o `id` da própria propriedade/produto aparece.
- Na importação: linha com `id` existente é atualizada, sem `id` é criada; endereços inexistentes são criados; propriedades são processadas antes dos produtos. Tela de pré-visualização mostra o que será criado/atualizado e um relatório de erros ao final.

## Visual
- Direção editorial cartográfica: fundo papel claro, verde-escuro como cor principal, acentos em terracota; títulos em Space Grotesk, texto em DM Sans. Ícones lucide; nenhum emoji em textos.

## Detalhes técnicos
- Como a API roda em localhost:8000, todas as chamadas são feitas diretamente do navegador (o servidor publicado não alcança o seu localhost). O endereço da API fica configurável (padrão `http://localhost:8000`) e salvo no navegador. A API precisa permitir CORS (já retorna `access-control-allow-origin: *`).
- Token guardado em localStorage, renovação via /refresh; rotas protegidas verificam a sessão no cliente. A permissão real continua sendo da API.
- Camada `src/lib/api/` tipada por recurso, com React Query; formulários com zod.
- Resolução de endereço: busca por nome em cada nível (filtrando pelo pai), cria se não existir, retorna `street_id`.
- Mapa carregado só no navegador (lazy import) para não quebrar a renderização no servidor.
- Testes para: regras de importação (criar vs atualizar, ordem, resolução de propriedade por nome) e checagem de permissão admin.
- Limitação: o mapa público/iframe só funciona para quem consegue acessar a API; publicar exige a API num endereço público.
