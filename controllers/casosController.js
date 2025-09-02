const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");
const errorHandler = require("../utils/errorHandler");
const { ApiError } = require("../utils/errorHandler");
const { dadosAgentes, dadosParcialAgentes, agenteIdValido, agenteCargoESorteValido } = require('../utils/agenteValidacao');
const { z } = require('zod');

function listarPorAgente(res, agente_id, next) {
    if (!agentesRepository.encontrarAgenteById(agente_id)) {
        return next(new ApiError(404, "ID do agente informado não encontrado no sistema."));
    }

    const dados = casosRepository.listarCasosPorAgente(agente_id);

    if (!dados || dados.length === 0) {
        return next(new ApiError(404, "Caso não encontrado com esse id de agente"));
    }

    return res.status(200).json(dados);
}

function listarPorStatus(res, status, next) {
    const dados = casosRepository.listarCasosPorStatus(status);

    if (!dados || dados.length === 0) {
        return next(new ApiError(404, "Caso não encontrado com esse status"));
    }

    return res.status(200).json(dados);
}

function listarPorAgenteEStatus(res, agente_id, status, next) {
    if (!agentesRepository.encontrarAgenteById(agente_id)) {
        return next(new ApiError(404, "ID do agente informado não encontrado no sistema."));
    }

    const dados = casosRepository.listarCasosPorAgenteEStatus(agente_id, status);

    if (!dados || dados.length === 0) {
        return next(new ApiError(404, "Caso não encontrado com esse agente e status"));
    }

    return res.status(200).json(dados);
}

function getAllCasos(req, res, next) {
    try {
        const { agente_id, status } = validarAgente_idEStatus.parse(req.query);

        if (agente_id && status) {
            return listarPorAgenteEStatus(res, agente_id, status);
        }

        else if (agente_id) {
            return listarPorAgente(res, agente_id);
        }

        else if (status) {
            return listarPorStatus(res, status);
        }

        const dados = casosRepository.findAll();

        if (!dados) {
            return next(new ApiError(404, "Nenhum caso registrado em nosso sistema."));
        }

        res.status(200).json(dados);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(400, "Parâmetros inválidos"))
        }
        next(error);   
    }
}

function getCaso(req, res, next) {
    try {
        const { id } = validarIDs.parse(req.params);

        const caso = casosRepository.findById(id);

        if (!caso) {
            return next(new ApiError(404, "Caso não encontrado."));
        }

        res.status(200).json(caso);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(404, "ID inválido"))
        } 
        next(error);         
    }
}

function postCaso(req, res, next) {
    try {
        const { titulo, descricao, status, agente_id } = validarDadosCasos.parse(req.body);

        if (!agentesRepository.encontrarAgenteById(agente_id)) {
            return next(new ApiError(404, "Agente informado não encontrado."));
        }

        const novoCaso = { titulo, descricao, status, agente_id };
        const dados = casosRepository.adicionarCaso(novoCaso);

        if(!dados) {
            return next(new ApiError(404, "Agente não foi encontrado com esse id."));
        }

        res.status(201).json(dados);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(400, "Parâmetros inválidos"))
        }
        next(error); 
    }
}

function putCaso(req, res, next) {
    try {
        let id;
        try {
            id = validarIDs.parse(req.params).id;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return next(new ApiError(404, "ID inválido"))
            } 
            return next(error); 
        }

        const { titulo, descricao, status, agente_id } = validarDadosCasos.parse(req.body);

        if (!agentesRepository.encontrarAgenteById(agente_id)) {
            return next(new ApiError(404, "Agente não encontrado. Verifique se o agente está registrado no sistema."));
        }

        const casoAtualizado = { titulo, descricao, status, agente_id };
        const dados = casosRepository.atualizarCaso(id, casoAtualizado);

        if (!dados) {
            return next(new ApiError(404, "Caso não encontrado."));
        }

        res.status(200).json(dados);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(400, "Parâmetros inválidos"))            
        }
        next(error);   
    }
}

function patchCaso(req, res, next) {
    try {
        let id;
        try {
            id = validarIDs.parse(req.params).id;            
        } catch (error) {
            if (error instanceof z.ZodError) {
                return next(new ApiError(404, "ID inválido"))
            } 
            return next(error);              
        }

        const { titulo, descricao, status, agente_id } = validarDadosParcialCasos.parse(req.body);

        const casoAtualizado = { titulo, descricao, status, agente_id };
        const dados = casosRepository.atualizarCaso(id, casoAtualizado);

        if (!dados) {
            return next(new ApiError(404, "Caso não encontrado."));
        } 

        res.status(200).json(dados);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(400, "Parâmetros inválidos"))            
        }
        next(error);          
    }
}

function deleteCaso(req, res, next) {
    try {
        const { id } = validarIDs.parse(req.params);

        const status = casosRepository.apagarCaso(id);

        if (!status) {
            return next(new ApiError(404, "Caso não encontrado."));
        }

        res.status(204).send();        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(404, "ID inválido"))
        }
        next(error);    
    }
}

function getAgenteDoCaso(req, res, next) {
    try {
        const { caso_id } = validarIDs.parse(req.params);    

        if (!casosRepository.findById(caso_id)) {
            return next(new ApiError(404, "ID do caso informado não encontrado."));
        }

        const dados = casosRepository.encontrarAgenteDoCaso(caso_id);

        if (!dados) {
            return next(new ApiError(404, "Agente não encontrado. Verifique se o agente está registrado no sistema."));
        }

        res.status(200).json(dados);        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(404, "ID inválido"))
        }
        next(error);
    }
}

function getCasosPorString(req, res, next) {
    try {
        const { q } = validarString.parse(req.query);

        const dados = casosRepository.encontrarCasoPorString(q);

        if (!dados || dados.length === 0) {
            return next(new ApiError(404, "Nenhum caso encontrado com a palavra fornecida."));
        }

        res.status(200).json(dados);        
    } catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ApiError(400, "Parâmetros inválidos"))            
        }
        next(error);
    }
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