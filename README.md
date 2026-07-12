# Intima IA

Este repositório contém **dois projetos distintos e desconectados entre si**. Leia esta seção antes de mexer em qualquer coisa — é fácil confundir os dois.

## Estrutura do repositório

### `site-producao/` — o app real, em produção

É este código que roda hoje em `intimaia.site`. HTML/CSS/JS puro (sem framework, sem bundler, sem etapa de build) — os arquivos são servidos exatamente como estão no repositório.

```
site-producao/
├── index.html       # Landing page
├── quiz.html + quiz.js
├── analysis.html + analysis.js   # Diagnóstico pós-quiz, antes do pagamento
├── login.html                    # Login por e-mail (assinantes)
├── app.html + app.js             # Chat — o produto em si
├── auth.js                       # Controle de acesso / checagem de assinatura
├── state.js                      # Estado compartilhado (localStorage)
├── content.js                    # Conteúdo/textos usados no quiz e no chat
└── style.css                     # Estilos + temas (roxo/rosa/verde/azul)
```

O front-end conversa com um backend próprio via endpoints relativos (`/api/chat`, `/api/check-subscriber`, `/api/conversations/...`), que fica fora deste repositório — nenhuma chave de API ou credencial fica exposta no código-cliente.

### `src/` — protótipo de estudo (React + Vite + Tailwind)

**Não está conectado à produção.** É um scaffold separado, criado à parte, contendo apenas uma tela de login estática. Não compartilha código, estado ou dados com `site-producao/`. Trate como um ambiente de estudo/experimentação até que exista uma decisão explícita de migrar o app real para React.

```
src/
├── main.jsx          # Bootstrap do React
├── IntimaIA.jsx       # Única tela existente (login)
└── GlobalStyles.css   # Estilos globais + diretivas Tailwind
```

Os arquivos `package.json`, `vite.config.js`, `tailwind.config.js` e `postcss.config.js` na raiz do repositório pertencem a este protótipo, não ao app em produção.

---

## Deploy

### `site-producao/` → Hostinger (processo real de deploy)

Como não há build, o deploy é upload direto dos arquivos:

1. Acesse o painel da Hostinger → **Gerenciador de Arquivos** (ou conecte via **FTP/SFTP** com as credenciais do painel).
2. Navegue até a pasta raiz do domínio `intimaia.site` (geralmente `public_html/` ou uma subpasta configurada para o domínio).
3. Envie todo o conteúdo de `site-producao/` para essa pasta, mantendo os nomes de arquivo exatamente como estão (`index.html`, `app.html`, `style.css`, `state.js` etc. — os `<script src="...">` e `<link href="...">` usam caminhos relativos simples, então tudo precisa ficar no mesmo nível).
4. Os endpoints `/api/...` chamados pelo front-end (`auth.js`, `app.js`) precisam continuar respondendo nesse mesmo domínio — isso é responsabilidade do backend, que **não faz parte deste repositório**. Confirme com quem administra o backend que ele está publicado e acessível antes de considerar o deploy completo.
5. Não é necessário rodar `npm install` nem `npm run build` para publicar este projeto.

> **Nota:** este documento assume o cenário mais comum de hospedagem compartilhada da Hostinger (File Manager/FTP servindo arquivos estáticos). Se o domínio estiver configurado de outra forma (proxy, Node.js app, etc.), ajuste os passos de acordo.

### `src/` (protótipo React/Vite) → build local, referência para o futuro

Este processo **ainda não está em uso real** — documentado aqui como referência, caso o protótipo evolua para virar o app publicado:

```bash
npm install       # instala as dependências (React, Vite, Tailwind...)
npm run build     # gera a pasta dist/ com os arquivos prontos para produção
```

O comando `npm run build` compila o React e processa o Tailwind, gerando em `dist/` um `index.html` + assets estáticos otimizados. Para publicar esse resultado na Hostinger, o processo seria o mesmo do `site-producao/` (passos 1–3 acima), mas enviando o **conteúdo de `dist/`** em vez do protótipo em si — nunca a pasta `src/` diretamente.

Antes de fazer isso valer para produção, seria preciso: (a) decidir formalmente migrar o app real para este stack, e (b) portar toda a lógica hoje em `site-producao/` (quiz, autenticação, chat, chamadas de API) para dentro do React — hoje o protótipo tem só a tela de login.
