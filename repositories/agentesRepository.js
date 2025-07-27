const { v4: uuidv4 } = require('uuid');

const agentes = [   
    {
        "id": "401bccf5-cf9e-489d-8412-446cd169a0f1",
        "nome": "Rommel Carneiro",
        "dataDeIncorporacao": "1992/10/04",
        "cargo": "delegado"
    }, 
]

function encontrarAgentes(){
    return agentes;
}

function encontrarAgenteById(id){
    const agente = agentes.find((agente) => agente.id === id);

    if(!agente){
        return false;
    }

    return agente;
}

function adicionarAgente(dados) {
    const novoAgente = { id: uuidv4(), ...dados};
    
    agentes.push(novoAgente);

    return novoAgente;
}

function atualizarAgente(id, agenteAtualizado) {
    const idAgente = agentes.findIndex((agente) => agente.id === id);

    if(idAgente === -1){
        return false;
    }

    agentes[idAgente] = { id: agentes[idAgente].id, ...agenteAtualizado };
    
    return agentes[idAgente];
}

function atualizarParcialAgente(id, agenteAtualizado) {
    const idAgente = agentes.findIndex((agente) => agente.id === id);

    if(idAgente === -1){
        return false;
    }

    agentes[idAgente].id = agentes[idAgente].id;  
    agentes[idAgente].nome = agenteAtualizado.nome || agentes[idAgente].nome;
    agentes[idAgente].cargo = agenteAtualizado.cargo || agentes[idAgente].cargo;
    agentes[idAgente].dataDeIncorporacao = agenteAtualizado.dataDeIncorporacao || agentes[idAgente].dataDeIncorporacao;
    
    return agentes[idAgente];
}

function apagarAgente(id) {
    const idAgente = agentes.findIndex((agente) => agente.id === id);

    if(idAgente === -1){
        return false;
    }

    agentes.splice(idAgente, 1);
    return true;
}

module.exports = {
    encontrarAgentes,
    encontrarAgenteById,
    adicionarAgente,
    atualizarAgente,
    atualizarParcialAgente,
    apagarAgente
}