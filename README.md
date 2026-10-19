# Property Linker

Faça uma mapeamento dessa api e em seguida crie uma interface para ela.

Note que existem 2 tipos de usuarios, user e admin

o user pode alterar products e propertys, o admin pode alterar qualquer coisa,

a interface do admin deve ser parecida com uma grande tabela onde é possivel alterar todo e qualquer campo no banco de dados.

a interface do usuario deve ser limpa e objetiva, com textos explicando os campos

Permita também com que o usuario gere mapas, esse mapa vai conter suas propriedades, e ao clicar em uma propriedade, será mostrado os produtos que aquela loja selecionada possui

Note que esse projeto deve ter como resultado final, permitir com que:

usuarios registrem propriedades, sendo que quando adicionar uma rua/bairro que não exista, ele é adicionado automaticamente.

usuarios registrem produtos e vincule a propriedades.

usuarios gerem mapas sendo possivel importa-los via iframe ou acessando diretamente.

utilize icones mas de forma alguma use emoticons nos textos.

adicione uma pagina institucional apresentando o projeto e convidando o publico a entrar em contato via whatsapp pelo numero 13 981412290 (utilize o botão para redirecionar ao whatsapp)

Crie um metodo para importar e exportas os dados das propriedades e produtos de forma com que seja possivel adicionar ou atualizar esses dois recursos de uma vez, (evite o uso de ID para chaves estrangeiras, apenas o ID da propriedade/produto deve aparecer)

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fa98af1f-08fc-4ffe-963e-cf11a6255fd3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
