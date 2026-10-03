import { randomUUID } from 'node:crypto';

export function criarDadosAlunoUnico(caso) {
  const sufixo = randomUUID().slice(0, 8);
  return {
    nome: caso.nome,
    email: `${caso.emailPrefix}.${sufixo}@example.com`,
    matricula: `${caso.matriculaPrefix}-${sufixo}`,
    senha: caso.senha,
  };
}

export default { criarDadosAlunoUnico };
