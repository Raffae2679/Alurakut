import { SiteClient } from 'datocms-client';

export default async function recebedordeRequests(request,response){
    if(request.method === "POST"){
        const TOKEN = 'bdca87275eb070afe0c7cc2c0e797c';

        const client = new SiteClient(TOKEN);

        const registroCriado = await client.items.create({
            itemType: "975973",
            ...request.body,
            //titulo: "Comunidade teste",
            //imageUrl: "https://github.com/raffae2679.png",
        });

        response.json({
            dados: 'Algum dado qualquer',
            registroCriado: registroCriado,
        })

        return;
    }
    
    response.status(404).json({
        mensagem:"Ainda não temos nada no GET, mas no POST tem"
    })
}