# Bird Finder - Aplicativo GIS para Identificação de Espécies de Aves

Aplicativo (PWA) GIS com intuito de explorar as possibilidades do iNaturalist API. A ideia é dar mais liberdade ao usuário para identificar espécies de aves em sua região a partir de diversos filtros, incluindo geométricos.

Ferramenta desenvolvida para entusiastas da observação de aves (Birdwatching), ornitólogos e amantes da natureza. O objetivo principal do aplicativo é possibilitar a identificação rápida e precisa de espécies de aves com base em diversas informações, como localidades, nomes científicos e populares e áreas de interesse.

## Tecnologias

- JavaScript
- HTML5
- CSS3
- [https://leafletjs.com] Leaflet
- [https://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html] Leaflet Draw
- [https://github.com/Leaflet/Leaflet.markercluster] Leaflet.markercluster
- [https://getbootstrap.com] Boostrap

## Instalação

Para instalar e configurar o WebGIS, siga os passos abaixo:

1. Clone o repositório para sua máquina local.
2. **Usando um servidor local (como XAMPP, WampServer, IIS):**
   - Copie a pasta do projeto para o diretório de projetos do seu servidor (por exemplo, `htdocs` para XAMPP).
   - Inicie o servidor e acesse o projeto através do navegador usando a URL correspondente (por exemplo, `http://localhost/bird-finder`).
3. **Usando o plugin Live Server do Visual Studio Code:**
   - Abra o projeto no Visual Studio Code.
   - Instale o plugin "Live Server" se ainda não o tiver.
   - Clique com o botão direito no arquivo `index.html` e selecione "Open with Live Server". Isso iniciará um servidor local e abrirá o projeto em seu navegador padrão.
4. **Realizando deploy pelo Heroku:**
    - [https://www.heroku.com] Realize login da sua conta no heroku.
    - Clique no botão `New` e depois no item `Create new app`.
    - De um nome para o app no campo `App name`.
    - Clique no botão `Create app`.
    - Com a aplicação criada, clique na aba `Deploy`.
    - Em `Deployment method` selecione `GitHub`.
    - Em `App connected to GitHub` conecte com sua conta no GitHub.
    - Após conectar e dar as devidas permissões, pesquise o repositório da aplicação no GitHub e clique em `Conectar`.
    - Para habilitar deploys automaticos, vá em `Automatic deploys` e habilite o deploy na branch desejada.
    - Faça o primeiro deploy da aplicação em `Manual deploy`, selecionando a branch e depois clicando no botão `Deploy Branch`.

## Estrutura de Diretórios

### assets

Aqui estão armazenados todos os recursos estáticos, como imagens, ícones e fontes utilizadas no projeto.

### config

Contém arquivos de configuração do projeto.

### css

Aqui estão os arquivos de estilos do projeto, organizados de acordo com a metodologia BEM ou outra de sua escolha.

### js

Contém todos os scripts JavaScript do projeto e lógica de negócio (core).

#### main.js

Ponto de entrada da aplicação. Inicializa o app e carrega configurações, parametros e módulos necessários, também armazena métodos não-GIS.

#### app.js

Contém a lógica principal da aplicação e interface de mapa.

### libs

Aqui estão as bibliotecas e frameworks de terceiros utilizados no projeto.

### locales

Contém as linguagens disponíveis para o aplicativo, excluindo a linguagem padrão en-US.