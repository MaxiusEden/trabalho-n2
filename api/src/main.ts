import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Acréscimo ao PDF: libera o frontend Next (porta 3001) a chamar a API pelo navegador.
  app.enableCors({ origin: 'http://localhost:3001' });

  // Ativa validação dos DTOs. Acréscimo ao PDF: campos fora do DTO dão 400.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  // Acréscimo ao PDF: erros do Prisma viram 409/404 em vez de 500.
  app.useGlobalFilters(new PrismaExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('User CRUD API')
    .setDescription('Documentação da API com NestJS, Prisma e JWT')
    .setVersion('1.0')
    .addTag('users')
    .addTag('auth')
    .addBearerAuth(
      // Adiciona o campo de autenticação no Swagger
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        in: 'header',
      },
      'token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
