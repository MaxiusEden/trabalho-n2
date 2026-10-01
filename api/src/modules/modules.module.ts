import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ModulesController],
  providers: [ModulesService],
})
export class ModulesModule {}
