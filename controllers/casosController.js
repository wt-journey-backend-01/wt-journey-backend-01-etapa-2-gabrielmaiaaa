const casosRepository = require("../repositories/casosRepository")
const agentesRepository = require("../repositories/agentesRepository")

function getAllCasos(req, res) {
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

    if (status !== "aberto" && status !== "solucionado") {
        return res.status(400).json({ error: "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'." });
    }

    if (!agentesRepository.encontrarAgenteById(agente_id)) {
        return res.status(404).json({ error: "Agente informado não encontrado." });
    }

    const casoAtualizado = { titulo, descricao, status, agente_id };
    const dados = casosRepository.atualizarParcialCaso(id, casoAtualizado);

    if (!dados) {
        return res.status(404).json({ error: "Agente não encontrado." });
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

module.exports = {
   getAllCasos,
   getCaso,
   postCaso,
   putCaso,
   patchCaso,
   deleteCaso
}