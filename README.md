# Gerador de Orçamento — Capacitar Treinamentos

App web 100% estático para gerar orçamentos em PDF. Funciona offline (basta abrir o `index.html`) e também em qualquer hospedagem estática como GitHub Pages, Netlify, Vercel, etc.

## Estrutura

```
site/
├── index.html              # ponto de entrada
├── resources.js            # URLs das imagens de parcerias
├── vendor/                 # bibliotecas externas
│   ├── react.production.min.js
│   ├── react-dom.production.min.js
│   └── dc-runtime.js       # framework de componentes
└── assets/
    ├── css/
    │   ├── fonts.css       # @font-face Barlow, Spline Sans Mono
    │   ├── styles.css      # estilos base do app
    │   └── responsive.css  # adaptacao mobile
    ├── js/
    │   ├── fetch-shim.js   # intercepta fetches do runtime que nao existem em produção
    │   ├── boot.js         # injeta o template no runtime sem disparar fetches fantasmas
    │   └── mobile.js       # botao flutuante GERAR PDF + escala A4 no celular
    ├── fonts/              # arquivos .woff2 (Barlow, Barlow Condensed, Spline Sans Mono)
    └── img/                # logo Capacitar + selos das parcerias (OCEANIC, BRASMAQ)
```

## Como publicar no GitHub Pages

1. Crie um repositório novo no GitHub
2. Faça upload de toda a pasta `site/` mantendo a hierarquia
3. Vá em **Settings → Pages → Branch: main → Save**
4. Acesse em `https://<seu-usuario>.github.io/<nome-repo>/`

## Testar localmente

Como o app faz pequenas requisições internas, abra via servidor HTTP local:

```bash
cd site
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080/`. Para testar do celular na mesma rede Wi-Fi,
descubra o IP da sua máquina (`ipconfig getifaddr en0` no Mac, `hostname -I` no Linux,
`ipconfig` no Windows) e acesse `http://192.168.x.x:8080/` do celular.

## Personalização

- **Dados da empresa, parcerias, certificações**: edite a seção `state` no topo do
  `<script type="text/x-dc" data-dc-script>` em `index.html`.
- **Logo / selos das parcerias**: substitua os arquivos em `assets/img/` mantendo
  os mesmos nomes (ou atualize `resources.js`).
- **Cores**: a cor principal vermelha (`#dd2a1b`) aparece em vários lugares; uma
  busca substituir resolve.
