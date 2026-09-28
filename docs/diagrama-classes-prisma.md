# Diagrama de classes - LAB03

Este diagrama foi montado a partir de `prisma/schema.prisma` e segue o modelo de dados do LAB03 - Plataforma de Cursos Online.

```mermaid
classDiagram
  direction LR

  class Usuario {
    Int idUsuario
    String nomeCompleto
    String email
    String senhaHash
    DateTime dataCadastro
  }

  class Categoria {
    Int idCategoria
    String nome
    String descricao
  }

  class Curso {
    Int idCurso
    String titulo
    String descricao
    Int? idInstrutor
    Int? idCategoria
    NivelCurso nivel
    DateTime dataPublicacao
    Int totalAulas
    Float totalHoras
  }

  class Modulo {
    Int idModulo
    Int idCurso
    String titulo
    Int ordem
  }

  class Aula {
    Int idAula
    Int idModulo
    String titulo
    TipoConteudo tipoConteudo
    String urlConteudo
    Int duracaoMinutos
    Int ordem
  }

  class Matricula {
    Int idMatricula
    Int idUsuario
    Int idCurso
    DateTime dataMatricula
    DateTime? dataConclusao
  }

  class ProgressoAula {
    Int idUsuario
    Int idAula
    DateTime dataConclusao
    StatusProgresso status
  }

  class Avaliacao {
    Int idAvaliacao
    Int idUsuario
    Int idCurso
    Int nota
    String? comentario
    DateTime dataAvaliacao
  }

  class Trilha {
    Int idTrilha
    String titulo
    String descricao
    Int? idCategoria
  }

  class TrilhaCurso {
    Int idTrilha
    Int idCurso
    Int ordem
  }

  class Certificado {
    Int idCertificado
    Int idUsuario
    Int idCurso
    Int? idTrilha
    String codigoVerificacao
    DateTime dataEmissao
  }

  class Plano {
    Int idPlano
    String nome
    String descricao
    Float preco
    Int duracaoMeses
  }

  class Assinatura {
    Int idAssinatura
    Int idUsuario
    Int idPlano
    DateTime dataInicio
    DateTime dataFim
  }

  class Pagamento {
    Int idPagamento
    Int idAssinatura
    Float valorPago
    DateTime dataPagamento
    MetodoPagamento metodoPagamento
    String idTransacaoGateway
    DateTime dataFim
  }

  Usuario "0..1" <-- "0..*" Curso : instrui
  Categoria "0..1" <-- "0..*" Curso : classifica
  Curso "1" <-- "0..*" Modulo : contem
  Modulo "1" <-- "0..*" Aula : contem

  Usuario "1" <-- "0..*" Matricula : realiza
  Curso "1" <-- "0..*" Matricula : recebe

  Usuario "1" <-- "0..*" ProgressoAula : conclui
  Aula "1" <-- "0..*" ProgressoAula : registra

  Usuario "1" <-- "0..*" Avaliacao : escreve
  Curso "1" <-- "0..*" Avaliacao : avaliado

  Categoria "0..1" <-- "0..*" Trilha : organiza
  Trilha "1" <-- "0..*" TrilhaCurso : possui
  Curso "1" <-- "0..*" TrilhaCurso : compoe

  Usuario "1" <-- "0..*" Certificado : recebe
  Curso "1" <-- "0..*" Certificado : certifica
  Trilha "0..1" <-- "0..*" Certificado : certifica

  Usuario "1" <-- "0..*" Assinatura : assina
  Plano "1" <-- "0..*" Assinatura : contratado
  Assinatura "1" <-- "0..*" Pagamento : gera
```

## Tabelas no banco

O Prisma usa modelos em singular no client, mas as tabelas fisicas foram mapeadas com `@@map` para os nomes do LAB03:

- `Usuarios`
- `Categorias`
- `Cursos`
- `Modulos`
- `Aulas`
- `Matriculas`
- `Progresso_Aulas`
- `Avaliacoes`
- `Trilhas`
- `Trilhas_Cursos`
- `Certificados`
- `Planos`
- `Assinaturas`
- `Pagamentos`
