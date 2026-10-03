import request from 'supertest';

export async function loginAsAdmin(app) {
  const email = process.env.ADMIN_EMAIL;
  const senha = process.env.ADMIN_SENHA;

  const resposta = await request(app).post('/api/auth/login').send({ email, senha });

  if (resposta.status !== 200) {
    throw new Error(
      `Falha ao autenticar como administrador: status ${resposta.status} - ${JSON.stringify(resposta.body)}`
    );
  }

  return resposta.body.token;
}

export async function loginAsAluno(app, { email, senha }) {
  const resposta = await request(app).post('/api/auth/login').send({ email, senha });

  if (resposta.status !== 200) {
    throw new Error(
      `Falha ao autenticar como aluno: status ${resposta.status} - ${JSON.stringify(resposta.body)}`
    );
  }

  return resposta.body.token;
}

export default { loginAsAdmin, loginAsAluno };
