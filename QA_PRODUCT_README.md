QA Manual — Produto / Galeria & Variantes

Passos para testar localmente:
1. yarn install
2. yarn dev
3. Abrir http://localhost:3000/products/camiseta-cafe (demo page)

Cenários:
- Ao abrir, cor padrão (primeira) deve estar selecionada e apenas imagens dessa cor aparecem.
- Ao clicar em outra cor, galeria troca para as imagens da cor selecionada (sem misturar).
- Ao selecionar um tamanho com estoque 0, botão "Adicionar ao carrinho" fica desabilitado.
- Miniaturas atualizam borda/estado ao clicar.
- Verificar no Network que imagens carregam por prioridade/ lazy.

Testes automatizados:
- yarn test (rodar jest)

Notas:
- Este PR adiciona componentes exemplares. Integre ao fluxo de dados real (server) substituindo mockProduct por fetch/getServerSideProps.
- Instalar dependências: framer-motion, @testing-library/react, jest, ts-jest, @types/jest se necessário.
