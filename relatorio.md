<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 8 créditos restantes para usar o sistema de feedback AI.

# Feedback para gabrielmaiaaa:

Nota final: **87.4/100**

# Feedback do seu Desafio da API do Departamento de Polícia 🚓👮‍♂️

Olá, Gabriel! Tudo bem? 😄 Antes de mais nada, parabéns pelo esforço e pelo código que você entregou! 🎉 Você conseguiu implementar a maior parte dos endpoints para os recursos `/agentes` e `/casos` com todos os métodos HTTP (GET, POST, PUT, PATCH, DELETE), e isso é incrível! Além disso, você estruturou seu projeto de forma modular, separando rotas, controllers e repositories, o que é uma prática essencial para manter o código organizado e escalável. 👏

Também achei muito bacana que você implementou validações importantes, como a verificação de datas no agente e a validação do status do caso. Isso mostra que você está atento à integridade dos dados, um ponto fundamental em APIs RESTful.

Ah! E não posso deixar de destacar que você chegou a implementar alguns bônus, especialmente a filtragem e mensagens de erro customizadas (mesmo que ainda estejam com pontos a melhorar). Isso demonstra que você foi além do básico, e isso é muito valioso! 🚀

---

## Analisando os Pontos que Precisam de Atenção 🔍

### 1. Atualização Parcial (PATCH) dos Agentes com Problemas

Você implementou o endpoint PATCH para agentes no `agentesController.js`:

```js
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
```

**O que está acontecendo aqui?**

- O problema está na validação da data: você sempre chama `isValidDate(dataDeIncorporacao)`, mesmo quando o campo `dataDeIncorporacao` não foi enviado no corpo da requisição (PATCH é parcial, ou seja, o cliente pode enviar só alguns campos).

- Isso faz com que, se o usuário quiser atualizar apenas o `nome` ou o `cargo`, mas não enviar `dataDeIncorporacao`, a validação falhe porque `dataDeIncorporacao` será `undefined` e `isValidDate(undefined)` retornará `false`.

**Como corrigir?**

Você deve validar a data **apenas se o campo foi enviado**, assim:

```js
if (dataDeIncorporacao && !isValidDate(dataDeIncorporacao)) {
    return res.status(400).json({ error: "Data de Incorporação inválida ou no futuro." });
}
```

Essa pequena mudança vai desbloquear a atualização parcial quando não houver data no payload.

---

### 2. Atualização Parcial (PATCH) de Casos com Problemas Semelhantes

No `casosController.js`, a função `patchCaso` tem uma lógica parecida:

```js
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
```

**Problemas aqui:**

- Você está validando o campo `status` mesmo quando ele não foi enviado (PATCH é parcial). Se `status` for `undefined`, a condição `status !== "aberto" && status !== "solucionado"` será verdadeira, causando erro indevido.

- Similarmente, está verificando se o agente existe sempre que `agente_id` é enviado, mas sem checar se `agente_id` foi informado antes.

- Além disso, a mensagem de erro final está incorreta: ao atualizar um caso inexistente, você retorna `"Agente não encontrado."` — deveria ser `"Caso não encontrado."`

**Como melhorar:**

```js
if (status && status !== "aberto" && status !== "solucionado") {
    return res.status(400).json({ error: "Tipo de status inválido. Selecionar 'aberto' ou 'solucionado'." });
}

if (agente_id && !agentesRepository.encontrarAgenteById(agente_id)) {
    return res.status(404).json({ error: "Agente informado não encontrado." });
}
```

E corrija a mensagem de erro para:

```js
if (!dados) {
    return res.status(404).json({ error: "Caso não encontrado." });
}
```

---

### 3. Penalidades: ID está sendo alterado via PUT — Isso não pode! 🚫

Você tem um problema importante na atualização completa (`PUT`) tanto de agentes quanto de casos: o campo `id` está sendo substituído, e isso não é permitido.

No `agentesRepository.js`:

```js
function atualizarAgente(id, agenteAtualizado) {
    const idAgente = agentes.findIndex((agente) => agente.id === id);

    if(idAgente === -1){
        return false;
    }

    agentes[idAgente] = { id: agentes[idAgente].id, ...agenteAtualizado };
    
    return agentes[idAgente];
}
```

Aqui você está preservando o `id` original, o que está correto! Mas veja no controller:

```js
const { nome, dataDeIncorporacao, cargo } = req.body;
// ...
const agenteAtualizado = { nome, dataDeIncorporacao, cargo };
```

Se o cliente enviar um campo `id` no corpo, ele será ignorado, porque você só está pegando esses campos. Então isso está OK.

Agora, vamos ver o `casosRepository.js`:

```js
function atualizarCaso(id, casoAtualizado) {
    const idCasos = casos.findIndex((caso) => caso.id === id);

    if (idCasos === -1) {
        return false;
    }

    casos[idCasos] = { id: casos[idCasos].id, ...casoAtualizado };

    return casos[idCasos];
}
```

Aqui, você também preserva o `id` original.

Mas o problema está no controller `putCaso`:

```js
const { titulo, descricao, status, agente_id } = req.body;
// ...
const casoAtualizado = { titulo, descricao, status, agente_id };
```

Você não está pegando `id` do corpo, então teoricamente não deveria permitir alteração.

**Então, onde está o problema?**

O problema pode estar no fato do cliente conseguir enviar o campo `id` no corpo JSON (mesmo que você não o use), e sua API não está explicitamente bloqueando isso.

Para evitar que o `id` seja alterado, você deve garantir que o `id` não seja aceito do cliente no payload, ou que seja removido antes da atualização.

**Sugestão:**

No controller, antes de criar o objeto para atualizar, remova o `id` do corpo, ou ignore-o:

```js
const { id: _, ...dadosParaAtualizar } = req.body; // descarta o id do payload

const casoAtualizado = {
    titulo: dadosParaAtualizar.titulo,
    descricao: dadosParaAtualizar.descricao,
    status: dadosParaAtualizar.status,
    agente_id: dadosParaAtualizar.agente_id
};
```

Assim, mesmo que o cliente envie `id`, ele será ignorado.

---

### 4. Filtros e Mensagens de Erro Customizadas (Bônus) Ainda Não Implementados

Percebi que você tentou implementar filtros para os casos e agentes, e mensagens de erro personalizadas, mas elas ainda não estão funcionando como esperado. Isso é normal, pois são funcionalidades mais avançadas!

Para esse tipo de requisito, recomendo estudar como manipular query params no Express (`req.query`) e como montar respostas customizadas. O vídeo [Manipulação de Requisições e Respostas](https://youtu.be/--TQwiNIw28) pode te ajudar bastante.

Além disso, para organizar melhor os erros, você pode criar um middleware para tratamento de erros na pasta `utils/errorHandler.js`, que você já tem no projeto, mas parece que ainda não está sendo usado.

---

### 5. Estrutura do Projeto

Sua estrutura está praticamente perfeita e segue o padrão esperado! 👏

```
.
├── controllers/
├── repositories/
├── routes/
├── docs/
├── utils/
├── server.js
├── package.json
```

Parabéns por essa organização, isso facilita muito a manutenção e o crescimento da aplicação!

---

## Dicas e Recursos para Você 💡

- Para entender melhor como trabalhar com validação condicional no PATCH e garantir que só valide campos enviados, veja este vídeo que explica validação em APIs Node.js/Express:  
  https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_

- Para evitar que campos indesejados sejam atualizados (como o `id`), e para manipular objetos de forma segura, recomendo estudar destruturação e manipulação de objetos no JavaScript, além de boas práticas de API REST:  
  https://expressjs.com/pt-br/guide/routing.html

- Para implementar filtros e ordenação via query params, este vídeo é sensacional para entender o fluxo completo de requisição/resposta e manipulação de parâmetros:  
  https://youtu.be/--TQwiNIw28

- Para organizar o tratamento de erros de forma centralizada e elegante, veja como criar middlewares de erro no Express:  
  https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH

---

## Resumo dos Principais Pontos para Melhorar 🎯

- [ ] Ajustar a validação condicional no PATCH para agentes e casos, validando campos **somente se enviados**.  
- [ ] Corrigir mensagens de erro para refletir o recurso correto (ex: `"Caso não encontrado"` em vez de `"Agente não encontrado"` no patch de casos).  
- [ ] Garantir que o campo `id` **não seja alterado** em atualizações PUT e PATCH, ignorando `id` no corpo da requisição.  
- [ ] Investir na implementação dos filtros e mensagens de erro customizadas para os bônus.  
- [ ] Usar o middleware de tratamento de erros para centralizar respostas de erro.  

---

Gabriel, você está no caminho certo! 🚀 Cada ajuste que você fizer vai deixar sua API mais robusta, profissional e alinhada às boas práticas do mercado. Continue praticando, revisando seu código e explorando esses conceitos.

Se precisar, volte aos vídeos recomendados e não hesite em experimentar as mudanças passo a passo. Estou aqui torcendo pelo seu sucesso! 💪✨

Um abraço de Code Buddy! 🤖❤️

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>