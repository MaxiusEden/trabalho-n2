import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../generated/prisma/enums';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

// Rotas próprias para as aulas (decisão de 30/09/2026). A leitura vem no
// GET /courses/:id. Toda escrita recalcula TotalAulas e TotalHoras do curso na
// mesma transação. Escrita só ADMIN (a etapa 13 abre para o instrutor do curso).
@ApiTags('lessons')
@ApiBearerAuth('token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller()
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post('modules/:moduleId/lessons')
  @ApiOperation({ summary: 'Criar uma aula no módulo' })
  @ApiResponse({ status: 201, description: 'Aula criada.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Só administradores.' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado.' })
  @ApiResponse({ status: 409, description: 'Posição já ocupada no módulo.' })
  create(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.lessonsService.create(moduleId, createLessonDto);
  }

  @Patch('lessons/:id')
  @ApiOperation({ summary: 'Atualizar uma aula' })
  @ApiResponse({ status: 200, description: 'Aula atualizada.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Só administradores.' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada.' })
  @ApiResponse({ status: 409, description: 'Posição já ocupada no módulo.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Delete('lessons/:id')
  @ApiOperation({ summary: 'Remover uma aula' })
  @ApiResponse({ status: 200, description: 'Aula removida.' })
  @ApiResponse({ status: 400, description: 'ID não numérico.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Só administradores.' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lessonsService.remove(id);
  }
}
