const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");
const errorHandler = require("../utils/errorHandler");

function getAllCasos(req, res) {
    const { agente_id, status } = req.query;

    if (agente_id){
        if (!agentesRepository.encontrarAgenteById(agente_id)) {
            return res.status(404).json(errorHandler.handleError(404, "ID do agente informado não encontrado no sistema.", "agenteNaoEncontrado", "ID do agente informado não encontrado no sistema."));
        }

        const dados = casosRepository.listarCasosPorAgente(agente_id);

        if (!dados) {
            return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado com esse id de agente", "casoNaoEncontrado", "Caso não encontrado com esse id de agente"));
        }

        return res.status(200).json(dados);
    }

    if (status){
        if (status !== "aberto" && status !== "solucionado") {
            return res.status(400).json(errorHandler.handleError(400, "Tipo de status inválido", "tipoStatusInvalido", "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'."));
        }

        const dados = casosRepository.listarCasosPorStatus(status);

        if (!dados) {
            return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado com esse status"));
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
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado."));
    }

    res.status(200).json(caso);
}

function postCaso(req, res) {
    const { titulo, descricao, status, agente_id } = req.body;

    if (!titulo || !descricao || !status || !agente_id) {
        return res.status(400).json(errorHandler.handleError(400, "Todos os campos são obrigatórios", "camposObrigatorios", "Todos os campos são obrigatórios."));
    }

    if (status !== "aberto" && status !== "solucionado") {
        return res.status(400).json(errorHandler.handleError(400, "Tipo de status inválido", "tipoStatusInvalido", "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'."));
    }

    if (!agentesRepository.encontrarAgenteById(agente_id)) {
        return res.status(404).json(errorHandler.handleError(404, "Agente informado não encontrado", "agenteNaoEncontrado", "Agente informado não encontrado."));
    }

    const novoCaso = { titulo, descricao, status, agente_id };
    const dados = casosRepository.adicionarCaso(novoCaso);

    res.status(201).json(dados);
}

function putCaso(req, res) {
    const { id } = req.params;
    const { titulo, descricao, status, agente_id } = req.body;

    if (!titulo || !descricao || !status || !agente_id) {
        return res.status(400).json(errorHandler.handleError(400, "Todos os campos são obrigatórios", "camposObrigatorios", "Todos os campos são obrigatórios."));
    }

    if (status !== "aberto" && status !== "solucionado") {
        return res.status(400).json(errorHandler.handleError(400, "Tipo de status inválido", "tipoStatusInvalido", "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'."));
    }

    if (!agentesRepository.encontrarAgenteById(agente_id)) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não encontrado. Verifique se o agente está registrado no sistema."));
    }

    const casoAtualizado = { titulo, descricao, status, agente_id };
    const dados = casosRepository.atualizarCaso(id, casoAtualizado);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado."));
    }

    res.status(200).json(dados);
}

function patchCaso(req, res) {
    const { id } = req.params;
    const { titulo, descricao, status, agente_id } = req.body;

    if (!titulo && !descricao && !status && !agente_id) {
        return res.status(400).json(errorHandler.handleError(400, "Um Campo Obrigatório", "camposObrigatorios", "Pelo menos um campo deve ser fornecido."));
    }

    if (status && status !== "aberto" && status !== "solucionado") {
        return res.status(400).json(errorHandler.handleError(400, "Tipo de status inválido", "tipoStatusInvalido", "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'."));
    }

    if (agente_id && !agentesRepository.encontrarAgenteById(agente_id)) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não encontrado. Verifique se o agente está registrado no sistema."));
    }

    const casoAtualizado = { titulo, descricao, status, agente_id };
    const dados = casosRepository.atualizarParcialCaso(id, casoAtualizado);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado."));
    } 

    res.status(200).json(dados);
}

function deleteCaso(req, res) {
    const { id } = req.params;
    const status = casosRepository.apagarCaso(id);

    if (!status) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Caso não encontrado."));
    }

    res.status(204).send();
}

function getAgenteDoCaso(req, res) {
    const { caso_id } = req.params;

    if (!casosRepository.findById(caso_id)) {
        return res.status(404).json(errorHandler.handleError(404, "ID do caso informado não encontrado", "casoNaoEncontrado", "ID do caso informado não encontrado."));
    }

    const dados = casosRepository.encontrarAgenteDoCaso(caso_id);

    if (!dados) {
        return res.status(404).json(errorHandler.handleError(404, "Agente não encontrado", "agenteNaoEncontrado", "Agente não encontrado. Verifique se o agente está registrado no sistema."));
    }

    res.status(200).json(dados)
}

function getCasosPorString(req, res) {
    const { q } = req.query;

    if(!q) {
        return res.status(400).json(errorHandler.handleError(400, "Parâmetro não encontrado", "parametroNaoEncontrado", "Informe uma palavra para buscar."));
    }

    const dados = casosRepository.encontrarCasoPorString(q);

    if (!dados || dados.length === 0) {
        return res.status(404).json(errorHandler.handleError(404, "Caso não encontrado", "casoNaoEncontrado", "Nenhum caso encontrado com a palavra fornecida."));
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