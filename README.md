# Sistema de Fichas de Catequese - Paróquia Sant'Ana

Este sistema permite que os pais preencham digitalmente as fichas de inscrição para catequese e gerem PDFs para enviar à secretaria da paróquia.

## Estrutura do Projeto

```
fichas-catequese/
├── index.html                    # Página inicial com botões para escolher a ficha
├── ficha-crisma.html            # Formulário para inscrição na Crisma  
├── ficha-primeira-eucaristia.html # Formulário para inscrição na Primeira Eucaristia
├── index.css                    # Estilos CSS compartilhados
├── index.js                     # JavaScript da página inicial
└── README.md                    # Este arquivo
```

## Como Usar

### Para os Pais/Responsáveis:

1. Abra o arquivo `index.html` no navegador
2. Escolha a ficha desejada:
   - **Crisma**: Para jovens que já fizeram a Primeira Eucaristia
   - **Primeira Eucaristia**: Para crianças que já foram batizadas
3. Preencha todos os campos obrigatórios
4. Clique em "Gerar PDF" para imprimir ou salvar
5. Envie o PDF para a secretaria da paróquia

## Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilos e responsividade
- **JavaScript**: Interatividade e máscaras de input
- **Tailwind CSS**: Framework CSS via CDN
- **IMask**: Biblioteca para máscaras de input

## Estrutura dos Dados

### Campos Comuns:
- Nome do catequizando
- Data de nascimento, naturalidade, nacionalidade
- Ano escolar, horário escolar, escola
- Endereço completo
- CPF e celular
- Informações do batismo
- Dados dos pais (nome, celular, email)
- Informações da turma de catequese

### Campos Específicos da Crisma:
- Informações sobre Primeira Eucaristia
- Padrinho e Madrinha

## Instalação

Este é um site estático. Basta:

1. Fazer download de todos os arquivos
2. Manter a estrutura de pastas
3. Abrir o `index.html` no navegador
4. Ou hospedar em qualquer servidor web