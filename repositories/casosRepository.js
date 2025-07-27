const { v4: uuidv4 } = require('uuid');

const casos = [
    {
        id: "f5fb2ad5-22a8-4cb4-90f2-8733517a0d46",
        titulo: "homicidio",
        descricao: "Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.",
        status: "aberto",
        agente_id: "401bccf5-cf9e-489d-8412-446cd169a0f1" 
    
    },
]

function findAll() {
    return casos
}

function findById(id) {
    const caso = casos.find((caso) => caso.id === id);

    if (!caso) {
        return false;
    }

    return caso;
}

function adicionarCaso(dados) {
    const novoCaso = { id: uuidv4(), ...dados};
    
    casos.push(novoCaso);
    
    return novoCaso;
}

function atualizarCaso(id, casoAtualizado) {
    const idCasos = casos.findIndex((caso) => caso.id === id);

    if (idCasos === -1) {
        return false;
    }

    casos[idCasos] = { id: casos[idCasos].id, ...casoAtualizado };

    return casos[idCasos];
}

function atualizarParcialCaso(id, casoAtualizado) {
    const idCasos = casos.findIndex((caso) => caso.id === id);

    if (idCasos === -1) {
        return false;
    }

    casos[idCasos].id = casos[idCasos].id;  
    casos[idCasos].titulo = casoAtualizado.titulo || casos[idCasos].titulo;
    casos[idCasos].descricao = casoAtualizado.descricao || casos[idCasos].descricao;
    casos[idCasos].status = casoAtualizado.status || casos[idCasos].status;
    casos[idCasos].agente_id = casoAtualizado.agente_id || casos[idCasos].agente_id;
    
    return casos[idCasos];
}

function apagarCaso(id) {
    const idCasos = casos.findIndex((caso) => caso.id === id);

    if (idCasos === -1) {
        return false;
    }

    casos.splice(idCasos, 1);
    
    return true;
}

module.exports = {
    findAll,
    findById,
    adicionarCaso,
    atualizarCaso,
    atualizarParcialCaso,
    apagarCaso
};
