import fs from 'node:fs';
import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { loginAsAdmin, loginAsAluno } from './helpers/authHelper.js';
import { criarDadosAlunoUnico } from './helpers/dataFactory.js';

const casosDeTeste = JSON.parse(
  fs.readFileSync(new URL('./fixtures/alunos-trabalhos.json', import.meta.url))
);

describe('Fluxo: admin cadastra aluno, aluno loga e registra entrega de trabalho', function () {
  this.timeout(20000);

  casosDeTeste.forEach((caso) => {
    describe(`Cenário: ${caso.nome}`, () => {
      const dadosAluno = criarDadosAlunoUnico(caso);
      let adminToken;
      let alunoId;
      let alunoToken;

      before(async () => {
        adminToken = await loginAsAdmin(app);
      });

      it('Admin: deve logar com sucesso e receber um token JWT', () => {
        expect(adminToken).to.be.a('string').and.not.empty;
      });

      it('Admin: deve cadastrar um novo aluno', async () => {
        const resposta = await request(app)
          .post('/api/admin/alunos')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(dadosAluno);

        expect(resposta.status).to.equal(201);
        expect(resposta.body).to.have.property('id');
        expect(resposta.body.email).to.equal(dadosAluno.email);
        expect(resposta.body).to.not.have.property('senha');

        alunoId = resposta.body.id;
      });

      it('Admin: deve matricular o aluno na disciplina do cenário', async () => {
        const resposta = await request(app)
          .post(`/api/admin/disciplinas/${caso.disciplinaId}/matriculas`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ alunoId });

        expect(resposta.status).to.equal(201);
        expect(resposta.body.alunoId).to.equal(alunoId);
        expect(resposta.body.disciplinaId).to.equal(caso.disciplinaId);
      });

      it('Aluno: deve logar com o e-mail e a senha definidos pelo admin', async () => {
        alunoToken = await loginAsAluno(app, { email: dadosAluno.email, senha: dadosAluno.senha });
        expect(alunoToken).to.be.a('string').and.not.empty;
      });

      it('Aluno: deve registrar a entrega de um trabalho na disciplina matriculada', async () => {
        const resposta = await request(app)
          .post(`/api/alunos/${alunoId}/trabalhos`)
          .set('Authorization', `Bearer ${alunoToken}`)
          .send({
            disciplinaId: caso.disciplinaId,
            titulo: caso.trabalho.titulo,
            descricao: caso.trabalho.descricao,
          });

        expect(resposta.status).to.equal(201);
        expect(resposta.body.alunoId).to.equal(alunoId);
        expect(resposta.body.disciplinaId).to.equal(caso.disciplinaId);
        expect(resposta.body.titulo).to.equal(caso.trabalho.titulo);
        expect(resposta.body.status).to.equal('entregue');
      });
    });
  });
});
