# Site-CEUNSP

Site institucional conceito do **Colégio CEUNSP** (Itu e Salto), com a **Astra**, a estrela mascote do projeto
"Astra — Proposta para o Colégio CEUNSP".

## Como abrir

É um site estático, sem dependências. Abra `index.html` no navegador ou rode um servidor local:

```bash
python3 -m http.server 8080
# depois acesse http://localhost:8080
```

## Estrutura

- `index.html`: página única com todas as seções
- `assets/css/style.css`: identidade visual (azul-marinho `#0e2350`, vermelho `#e1251b`, branco `#fbfaf7`; fontes Fredoka, Nunito Sans e Caveat)
- `assets/js/main.js`: interações
- `assets/img/`: Astra (versões 3D, simplificada e expressões) e mockups da Linha Astra

## Interações

- Céu estrelado que reage ao mouse, com estrelas cadentes; clique para soltar estrelas
- Astra do topo inclina com o mouse e responde a cliques (7 cliques = chuva de estrelas)
- Astra guia flutuante que comenta cada seção
- Linha do tempo e galeria de produtos arrastáveis
- Abas de segmentos, cartões 3D, troca entre versões da Astra
- Quiz "Qual Astra é você?" com as 6 expressões
- Jornada da matrícula animada pela rolagem
- Chat "Pais perguntam, a Astra responde"
- Montador de visita por unidade, etapa e período (nenhum dado é enviado)
- Easter egg: digite `astra` em qualquer lugar da página

> Site conceito, não é o site oficial do colégio. Endereços, telefones e segmentos vieram de fontes públicas e devem ser confirmados com a instituição.
