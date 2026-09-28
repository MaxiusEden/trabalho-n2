import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe()); // Ativa validação dos DTOs

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
