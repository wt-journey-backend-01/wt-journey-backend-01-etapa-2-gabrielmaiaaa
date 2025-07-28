const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");

function getAllCasos(req, res) {
    const { agente_id, status } = req.query;

    if (agente_id){
        if (!agentesRepository.encontrarAgenteById(agente_id)) {
            return res.status(404).json({ error: "ID do agente informado não encontrado no sistema." });
        }

        const dados = casosRepository.listarCasosPorAgente(agente_id);

        if (!dados) {
            return res.status(404).json({ error:"Caso não encontrado com esse id de agente" });
        }

        return res.status(200).json(dados);
    }

    if (status){
        if (status !== "aberto" && status !== "solucionado") {
            return res.status(400).json({ error: "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'." });
        }

        const dados = casosRepository.listarCasosPorStatus(status);

        if (!dados) {
            return res.status(404).json({ error:"Caso não encontrado com esse status!" });
        }

        return res.status(200).json(dados);
    }

    const dados = casosRepository.findAll();

    res.status(200).json(dados);
}

function getCaso(req, res) {
    const { id } = req.params;
    const caso = casosRepository.findById(id);

    if (!caso) {
        return res.status(404).json({ message: "Caso não encontrado" });
    }

    res.status(200).json(caso);
}

function postCaso(req, res) {
    const { titulo, descricao, status, agente_id } = req.body;

    if (!titulo || !descricao || !status || !agente_id) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    if (status !== "aberto" && status !== "solucionado") {
        return res.status(400).json({ error: "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'." });
    }

    if (!agentesRepository.encontrarAgenteById(agente_id)) {
        return res.status(404).json({ error: "Agente informado não encontrado." });
    }

    const novoCaso = { titulo, descricao, status, agente_id };
    const dados = casosRepository.adicionarCaso(novoCaso);

    res.status(201).json(dados);
}

function putCaso(req, res) {
    const { id } = req.params;
    const { titulo, descricao, status, agente_id } = req.body;

    if (!titulo || !descricao || !status || !agente_id) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    if (status !== "aberto" && status !== "solucionado") {
        return res.status(400).json({ error: "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'." });
    }

    if (!agentesRepository.encontrarAgenteById(agente_id)) {
        return res.status(404).json({ error: "Agente informado não encontrado." });
    }

    const casoAtualizado = { titulo, descricao, status, agente_id };
    const dados = casosRepository.atualizarCaso(id, casoAtualizado);

    if (!dados) {
        return res.status(404).json({ message: "Caso não encontrado" });
    }

    res.status(200).json(dados);
}

function patchCaso(req, res) {
    const { id } = req.params;
    const { titulo, descricao, status, agente_id } = req.body;

    if (!titulo && !descricao && !status && !agente_id) {
        return res.status(400).json({ error: "Pelo menos um campo deve ser fornecido." });
    }

    if (status && status !== "aberto" && status !== "solucionado") {
        return res.status(400).json({ error: "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'." });
    }

    if (agente_id && !agentesRepository.encontrarAgenteById(agente_id)) {
        return res.status(404).json({ error: "Agente informado não encontrado." });
    }

    const casoAtualizado = { titulo, descricao, status, agente_id };
    const dados = casosRepository.atualizarParcialCaso(id, casoAtualizado);

    if (!dados) {
        return res.status(404).json({ error: "Caso não encontrado." });
    } 

    res.status(200).json(dados);
}

function deleteCaso(req, res) {
    const { id } = req.params;
    const status = casosRepository.apagarCaso(id);

    if (!status) {
        return res.status(404).json({ error: "Caso não encontrado." });
    }

    res.status(204).send();
}

function getAgenteDoCaso(req, res) {
    const { casos_id } = req.params;
    console.log(casos_id)

    if (!casosRepository.findById(casos_id)) {
        return res.status(404).json({ message: "ID do caso informado não encontrado" });
    }

    const dados = casosRepository.encontrarAgenteDoCaso(casos_id);

    if (!dados) {
        return res.status(404).json({ message: "Agente não encontrado. Verifique se o agente está registrado no sistema." });
    }

    res.status(200).json(dados)
}

function getCasosPorString(req, res) {
    const { q } = req.query;

    if(!q) {
        return res.status(400).json({ error: "Paramêtro não encontrado. Informe uma palavra para buscar." });
    }

    const dados = casosRepository.encontrarCasoPorString(q);

    if (!dados || dados.length === 0) {
        return res.status(404).json({ message: "Nenhum caso encontrado com a palavra fornecida." });
    }

    res.status(200).json(dados);
}

module.exports = {
   getAllCasos,
   getCaso,
   postCaso,
   putCaso,
   patchCaso,
   deleteCaso,
   getAgenteDoCaso,
   getCasosPorString
}