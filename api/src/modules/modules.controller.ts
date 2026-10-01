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
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

// Rotas próprias para os módulos (decisão de 30/09/2026). A leitura vem no
// GET /courses/:id. Escrita só ADMIN (a etapa 13 abre para o instrutor do curso).
@ApiTags('modules')
@ApiBearerAuth('token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller()
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post('courses/:courseId/modules')
  @ApiOperation({ summary: 'Criar um módulo no curso' })
  @ApiResponse({ status: 201, description: 'Módulo criado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Só administradores.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  @ApiResponse({ status: 409, description: 'Posição já ocupada no curso.' })
  create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() createModuleDto: CreateModuleDto,
  ) {
    return this.modulesService.create(courseId, createModuleDto);
  }

  @Patch('modules/:id')
  @ApiOperation({ summary: 'Atualizar um módulo (título e ordem)' })
  @ApiResponse({ status: 200, description: 'Módulo atualizado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Só administradores.' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado.' })
  @ApiResponse({ status: 409, description: 'Posição já ocupada no curso.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.modulesService.update(id, updateModuleDto);
  }

  @Delete('modules/:id')
  @ApiOperation({
    summary: 'Remover um módulo (as aulas dele saem junto; os totais caem)',
  })
  @ApiResponse({ status: 200, description: 'Módulo removido.' })
  @ApiResponse({ status: 400, description: 'ID não numérico.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Só administradores.' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.modulesService.remove(id);
  }
}
