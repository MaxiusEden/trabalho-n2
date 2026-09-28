import Link from 'next/link';

type Endpoint = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  body?: string;
  responses: string[];
};

type Resource = {
  tag: string;
  description: string;
  endpoints: Endpoint[];
};

const RESOURCES: Resource[] = [
  {
    tag: 'users',
    description:
      'CRUD de usuários. `password` nunca aparece nas respostas. Regras: e-mail válido e único, nome não vazio, senha com no mínimo 6 caracteres.',
    endpoints: [
      {
        method: 'POST',
        path: '/api/users',
        summary: 'Criar um novo usuário',
        body: '{ "email": "joao@email.com", "name": "João Silva", "password": "senha123" }',
        responses: ['201 Criado', '400 Dados inválidos', '409 E-mail já cadastrado'],
      },
      {
        method: 'GET',
        path: '/api/users',
        summary: 'Listar todos os usuários',
        responses: ['200 OK'],
      },
      {
        method: 'GET',
        path: '/api/users/:id',
        summary: 'Buscar um usuário pelo ID (inclui as matrículas)',
        responses: ['200 OK', '400 ID inválido', '404 Não encontrado'],
      },
      {
        method: 'PATCH',
        path: '/api/users/:id',
        summary: 'Atualizar um usuário (todos os campos opcionais)',
        body: '{ "name": "João da Silva" }',
        responses: ['200 OK', '400 Dados inválidos', '404 Não encontrado', '409 E-mail em uso'],
      },
      {
        method: 'DELETE',
        path: '/api/users/:id',
        summary: 'Remover um usuário (apaga as matrículas dele em cascata)',
        responses: ['200 OK', '404 Não encontrado'],
      },
      {
        method: 'POST',
        path: '/api/login',
        summary: 'Conferir credenciais da tela de Login',
        body: '{ "email": "aluno@perero.com", "password": "senha123" }',
        responses: ['200 OK', '400 Dados inválidos', '401 Credenciais incorretas'],
      },
    ],
  },
  {
    tag: 'trilhas',
    description:
      'CRUD de trilhas de aprendizado. O total de cursos vem de `_count.courses` e não é editável.',
    endpoints: [
      {
        method: 'POST',
        path: '/api/trilhas',
        summary: 'Criar uma trilha',
        body: '{ "title": "Trilha Frontend", "description": "HTML, CSS, JS, React e muito mais." }',
        responses: ['201 Criado', '400 Dados inválidos'],
      },
      { method: 'GET', path: '/api/trilhas', summary: 'Listar as trilhas', responses: ['200 OK'] },
      {
        method: 'GET',
        path: '/api/trilhas/:id',
        summary: 'Buscar uma trilha com os cursos dela',
        responses: ['200 OK', '404 Não encontrada'],
      },
      {
        method: 'PATCH',
        path: '/api/trilhas/:id',
        summary: 'Atualizar uma trilha',
        body: '{ "description": "Nova descrição" }',
        responses: ['200 OK', '400 Dados inválidos', '404 Não encontrada'],
      },
      {
        method: 'DELETE',
        path: '/api/trilhas/:id',
        summary: 'Remover uma trilha (os cursos ficam sem trilha)',
        responses: ['200 OK', '404 Não encontrada'],
      },
    ],
  },
  {
    tag: 'courses',
    description:
      'CRUD de cursos, incluindo o conteúdo programático. `priceCents` é o preço em centavos; `lessons` substitui a lista inteira de aulas quando enviado.',
    endpoints: [
      {
        method: 'POST',
        path: '/api/courses',
        summary: 'Criar um curso com suas aulas',
        body: '{ "title": "React para Iniciantes", "description": "...", "image": "https://...", "priceCents": 9700, "trilhaId": 1, "lessons": [{ "title": "Introdução", "duration": 10 }] }',
        responses: ['201 Criado', '400 Dados inválidos ou trilha inexistente'],
      },
      {
        method: 'GET',
        path: '/api/courses?trilhaId=',
        summary: 'Listar os cursos, opcionalmente filtrando por trilha',
        responses: ['200 OK', '400 trilhaId inválido'],
      },
      {
        method: 'GET',
        path: '/api/courses/:id',
        summary: 'Buscar um curso pelo ID',
        responses: ['200 OK', '404 Não encontrado'],
      },
      {
        method: 'PATCH',
        path: '/api/courses/:id',
        summary: 'Atualizar um curso (use "trilhaId": null para desvincular)',
        body: '{ "priceCents": 12900, "trilhaId": null }',
        responses: ['200 OK', '400 Dados inválidos', '404 Não encontrado'],
      },
      {
        method: 'DELETE',
        path: '/api/courses/:id',
        summary: 'Remover um curso (aulas e matrículas caem em cascata)',
        responses: ['200 OK', '404 Não encontrado'],
      },
    ],
  },
  {
    tag: 'enrollments',
    description:
      'Matrículas — a relação entre usuário e curso. O índice único do banco impede matrícula duplicada.',
    endpoints: [
      {
        method: 'POST',
        path: '/api/enrollments',
        summary: 'Matricular um usuário em um curso',
        body: '{ "userId": 1, "courseId": 1 }',
        responses: [
          '201 Criado',
          '400 Usuário ou curso inexistente',
          '409 Já matriculado nesse curso',
        ],
      },
      {
        method: 'GET',
        path: '/api/enrollments?userId=&courseId=',
        summary: 'Listar matrículas, com filtros opcionais',
        responses: ['200 OK'],
      },
      {
        method: 'GET',
        path: '/api/enrollments/:id',
        summary: 'Buscar uma matrícula pelo ID',
        responses: ['200 OK', '404 Não encontrada'],
      },
      {
        method: 'DELETE',
        path: '/api/enrollments/:id',
        summary: 'Cancelar uma matrícula',
        responses: ['200 OK', '404 Não encontrada'],
      },
    ],
  },
];

const METHOD_CLASS: Record<Endpoint['method'], string> = {
  GET: 'bg-primary',
  POST: 'bg-success',
  PATCH: 'bg-warning',
  DELETE: 'bg-danger',
};

/**
 * Documentação da API — equivale à página do Swagger descrita no PDF, que ali
 * também fica em `/api`. É montada a partir desta lista, sem depender de nada
 * externo.
 */
export default function ApiDocsPage() {
  return (
    <div className="container">
      <h1 className="page-title">Documentação da API</h1>
      <p className="text-muted">
        Perero Cursos API · v1.0 · todas as rotas respondem JSON. Erros seguem o formato{' '}
        <code>{'{ statusCode, message, error }'}</code>, com <code>message</code> podendo ser uma
        lista quando a validação falha.
      </p>

      {RESOURCES.map((resource) => (
        <section key={resource.tag} className="mb-5">
          <h2 className="h5 border-bottom pb-2">{resource.tag}</h2>
          <p className="text-muted small">{resource.description}</p>

          {resource.endpoints.map((endpoint) => (
            <div key={`${endpoint.method} ${endpoint.path}`} className="card mb-2">
              <div className="card-body py-3">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className={`badge method-badge ${METHOD_CLASS[endpoint.method]}`}>
                    {endpoint.method}
                  </span>
                  <code className="fs-6">{endpoint.path}</code>
                  <span className="text-muted small">— {endpoint.summary}</span>
                </div>

                {endpoint.body && (
                  <pre className="tag--neutral rounded p-2 mt-2 mb-2 small overflow-auto">
                    <code>{endpoint.body}</code>
                  </pre>
                )}

                <div className="d-flex gap-2 flex-wrap mt-2">
                  {endpoint.responses.map((response) => (
                    <span key={response} className="tag tag--neutral">
                      {response}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>
      ))}

      <Link href="/" className="btn btn-outline-primary">
        Voltar para a Home
      </Link>
    </div>
  );
}
