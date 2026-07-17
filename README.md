# Intima IA

Site real do funil (`intimaia.site`), em HTML/CSS/JS puro — sem framework, sem bundler, sem etapa de build. Os arquivos são servidos exatamente como estão neste repositório.

## Estrutura

```
index.html          # Landing page
quiz.html + quiz.js  # Quiz de diagnóstico
vsl.html + vsl.js    # VSL — transição entre quiz e diagnóstico
analysis.html + analysis.js  # Diagnóstico + planos (checkout)
login.html           # Login por e-mail (assinantes)
app.html + app.js    # Chat — o produto em si
auth.js              # Controle de acesso / checagem de assinatura
state.js             # Estado compartilhado (localStorage)
content.js           # Conteúdo/textos usados no quiz e no chat
style.css            # Estilos + temas (roxo/rosa/verde/azul)
```

O front-end conversa com um backend próprio via endpoints relativos (`/api/chat`, `/api/check-subscriber`, `/api/conversations/...`), que fica fora deste repositório — nenhuma chave de API ou credencial fica exposta no código-cliente.

> Havia anteriormente um protótipo de estudo em React/Vite (`src/`) desconectado deste site. Foi removido em 2026-07-16 por nunca ter sido usado e por ter colidido com `index.html` quando os arquivos do site foram achatados pra raiz do repositório. O histórico do Git preserva os arquivos caso precisem ser recuperados.

## Deploy → Hostinger

Como não há build, o deploy é upload direto dos arquivos:

1. Acesse o painel da Hostinger → **Gerenciador de Arquivos** (ou conecte via **FTP/SFTP** com as credenciais do painel).
2. Navegue até a pasta raiz do domínio `intimaia.site` (geralmente `public_html/` ou uma subpasta configurada para o domínio).
3. Envie todo o conteúdo deste repositório para essa pasta, mantendo os nomes de arquivo exatamente como estão (`index.html`, `app.html`, `style.css`, `state.js` etc. — os `<script src="...">` e `<link href="...">` usam caminhos relativos simples, então tudo precisa ficar no mesmo nível, sem subpastas).
4. Os endpoints `/api/...` chamados pelo front-end (`auth.js`, `app.js`) precisam continuar respondendo nesse mesmo domínio — isso é responsabilidade do backend, que **não faz parte deste repositório**. Confirme com quem administra o backend que ele está publicado e acessível antes de considerar o deploy completo.
5. Não é necessário rodar `npm install` nem `npm run build` para publicar este projeto.

> **Nota:** este documento assume o cenário mais comum de hospedagem compartilhada da Hostinger (File Manager/FTP servindo arquivos estáticos). Se o domínio estiver configurado de outra forma (proxy, Node.js app, etc.), ajuste os passos de acordo.
