import MainGrid from '../src/componentes/MainGrid'
import Box from '../src/componentes/Box'
import nookies from 'nookies';
import jwt from 'jsonwebtoken';
import { AlurakutMenu, AlurakutProfileSidebarMenuDefault, AlurakutStyles, OrkutNostalgicIconSet } from '../src/lib/AlurakutCommons'
import { ProfileRelationsBoxWrapper } from '../src/componentes/ProfileRelations'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router';


function ProfileSidebar(props){
  const {githubUser} = props

  return (
    <Box as="aside">
      <img src={`https://github.com/${githubUser}.png`} style={{ borderRadius:'8px'}} />
      <hr />

      <p>
        <a className="boxLink" href={`https://github.com/${githubUser}`}>
          @{githubUser}
        </a>
      </p>
      <hr />
       
      <AlurakutProfileSidebarMenuDefault githubUser={githubUser} />
      
    </Box>
  )
}

function ProfileRelationsBox(propriedades) {
  return(
    
    <ProfileRelationsBoxWrapper>
      <h2 className="smallTitle">
        {propriedades.title} ({propriedades.items.length})
      </h2>

      <ul>
        {propriedades.items.slice(0,6).map((itemAtual) => {
          return (
            <li key={itemAtual}>
              <a href={`${itemAtual.html_url}`} >
                <img src={itemAtual.avatar_url} />
                <span>{itemAtual.login}</span>
              </a>
            </li>
          )
        })}
      </ul>

    </ProfileRelationsBoxWrapper>
  )
}



export default function Home(props) {

  const pessoasComunidade = [
    'juunegreiros',
    'omariosouto',
    'peas',
    'rafaballerini',
    'marcobrunodev',
    'felipefialho',
  ]

  const [comunidades, setcomunidades] =  useState([]);

  const githubUser = props.githubUser;

  // Acessando api do github
  const[githubFriends, setgithubFriends] = useState([]);

  // Uma vez carregada, a useEffects só executa novamente se algum dado tiver mudado
  useEffect(function (){
    // função responsavel por acessar a api e retornar os dados
    async function getData(){
      const response = await fetch(
        'https://api.github.com/users/raffae2679/followers'
      );
      const data = await response.json();
      setgithubFriends(data); 
    }
    getData();

    // API GraphQL
    fetch('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        'Authorization': '6c5c939ea64cd0c6bd871405f254b9',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ "query": `query{
        allComunidades {
          id
          titulo
          imageUrl
        }
      }` })
    })
    .then((response) => response.json())
    .then((respostaCompleta) => {
      const comunidadesVindasDoDato = respostaCompleta.data.allComunidades;

      setcomunidades(comunidadesVindasDoDato) 
    })

  }, []);

  return (
    <>
      <AlurakutMenu />
      <MainGrid>
      
        <div className="profileArea" style={{ gridArea: 'profileArea'}}>
          <ProfileSidebar githubUser={githubUser} />
        </div>
      
        <div className="welcomeArea" style={{ gridArea: 'welcomeArea'}}>
          <Box> 
            <h1 className="title">
              Bem vindo
            </h1>

            <OrkutNostalgicIconSet></OrkutNostalgicIconSet>

          </Box>

          <Box>
            <h2 className="subTitle">O que você deseja fazer?</h2>
            <form onSubmit={function handleCriaComunidade(e) {
              e.preventDefault();
              const dadosdoForm = new FormData(e.target)
              
              const comunidade = {
                titulo: dadosdoForm.get('title'),
                imageUrl: dadosdoForm.get('image'),
              }
              
              fetch('/api/comunidades', {
                method: 'POST',
                headers: {
                  'Content-Type':'application/json',
                },
                body: JSON.stringify(comunidade),
              })
              .then(async (response) => {
                const dados = await response.json();

                const comunidade = dados.registroCriado;
                const comunidadesAtualizadas = [...comunidades, comunidade]
                setcomunidades(comunidadesAtualizadas)
              })

            }}>
              <div>
                <input
                placeholder="Qual vai ser o nome da sua comunidade?" 
                name="title" 
                aria-label="Qual vai ser o nome da sua comunidade?"
                type="Text"
                />
              </div> 

              <div>
                <input
                placeholder="Coloque uma url para usarmos de capa" 
                name="image" 
                aria-label="Coloque uma url para usarmos de capa"
                type="Text"
                />
              </div> 

              <button>
                Criar comunidade
              </button>


            </form>
          </Box>
        </div>

        <div className="profileReleationsArea" style={{ gridArea: 'profileReleationsArea'}}>
          
          <ProfileRelationsBox title="Seguidores"  items={githubFriends}/>
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Comunidades ({comunidades.length})
            </h2>

            <ul>
              {comunidades.map((itemAtual) => {
                return (
                  <li key={itemAtual.id}>
                    <a href={`${itemAtual.id}`} >
                      <img src={itemAtual.imageUrl} />
                      <span>{itemAtual.titulo}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
          
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Pessoas da comunidade ({githubFriends.length})
            </h2>

            <ul>
              {pessoasComunidade.map((itemAtual) => {
                return (
                  <li key={itemAtual}>
                    <a href={`https://github.com/${itemAtual}`}>
                      <img src={`https://github.com/${itemAtual}.png`} />
                      <span>{itemAtual}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </ProfileRelationsBoxWrapper>

          
        </div>

      </MainGrid>
    </>
  )
}

export async function getServerSideProps(context) {
  const cookies = nookies.get(context);
  const token = cookies.USER_TOKEN;
  const { githubUser } = jwt.decode(token);

  const { isAuthenticated } = await fetch('https://alurakut.vercel.app/api/auth', {
    headers: {
      Authorization: token
    }
  })
  .then((resposta) => resposta.json())

  console.log(isAuthenticated);

  if(!isAuthenticated){
    return {
      redirect:{
        destination: '/login',
        permanent: false,
      }
    }
  }

  return {
    props: {
      githubUser,
    }, // will be passed to the page component as props
  }
}
