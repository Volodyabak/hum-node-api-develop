import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Artistory Api')
    .setDescription('Artistory Api')
    .setVersion('2.0')
    .setExternalDoc('Postman Collection', '/explorer-json')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/explorer', app, document);
}
