const agentesRepository = require("../repositories/agentesRepository")

function isValidDate(dateString) {
    const data = new Date(dateString);
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(dateString)) {
        return false;
    }

    if (isNaN(data.getTime())) {
        return false;
    }

    const hoje = new Date();
    if (data > hoje){
        return false;
    }

    return true;
}

function getAllAgentes(req, res) {
    const dados = agentesRepository.encontrarAgentes();

    res.status(200).json(dados);
}

function getAgente(req, res) {
    const { id } = req.params;
    const dados = agentesRepository.encontrarAgenteById(id);

    if (!dados) {
        return res.status(404).json({ error: "Agente não encontrado." });
    } 
    
    res.status(200).json(dados);
}

function postAgente(req, res) {
    const { nome, dataDeIncorporacao, cargo } = req.body;

    if(!nome || !dataDeIncorporacao || !cargo) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    if (!isValidDate(dataDeIncorporacao)) {
        return res.status(400).json({ error: "Data de Incorporação inválida ou no futuro." });
    }

    const novoAgente = { nome, dataDeIncorporacao, cargo };
    const dados = agentesRepository.adicionarAgente(novoAgente);
    
    res.status(201).json(dados);
}

function putAgente(req, res) {
    const { id } = req.params;
    const { nome, dataDeIncorporacao, cargo } = req.body;

    if(!nome || !dataDeIncorporacao || !cargo) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    if (!isValidDate(dataDeIncorporacao)) {
        return res.status(400).json({ error: "Data de Incorporação inválida ou no futuro." });
    }

    const agenteAtualizado = { nome, dataDeIncorporacao, cargo };
    const dados = agentesRepository.atualizarAgente(id, agenteAtualizado);

    if (!dados) {
        return res.status(404).json({ error: "Agente não encontrado." });
    } 

    res.status(200).json(dados);
}

function patchAgente(req, res) {
    const { id } = req.params;
    const { nome, dataDeIncorporacao, cargo } = req.body;
    
    if(!nome && !dataDeIncorporacao && !cargo) {
        return res.status(400).json({ error: "Pelo menos um campo deve ser fornecido." });
    }

    if (!isValidDate(dataDeIncorporacao)) {
        return res.status(400).json({ error: "Data de Incorporação inválida ou no futuro." });
    }

    const agenteAtualizado = { nome, dataDeIncorporacao, cargo };
    const dados = agentesRepository.atualizarParcialAgente(id, agenteAtualizado);

    if (!dados) {
        return res.status(404).json({ error: "Agente não encontrado." });
    } 
    
    res.status(200).json(dados);
}

function deleteAgente(req, res) {
    const { id } = req.params;
    const status = agentesRepository.apagarAgente(id);

    if (!status) {
        return res.status(404).json({ error: "Agente não encontrado." });
    } 
    
    res.status(204).send();
}

module.exports = {
    getAllAgentes,
    getAgente,
    postAgente,
    putAgente,
    patchAgente,
    deleteAgente
}