import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
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
import { TrilhasService } from './trilhas.service';
import { CreateTrilhaDto } from './dto/create-trilha.dto';
import { UpdateTrilhaDto } from './dto/update-trilha.dto';

@ApiTags('trilhas')
@Controller('trilhas')
export class TrilhasController {
  constructor(private readonly trilhasService: TrilhasService) {}

  // Escrita: só ADMIN (etapa 8). O perfil vem do token.
  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Criar uma trilha' })
  @ApiResponse({ status: 201, description: 'Trilha criada.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Só administradores.' })
  create(@Body() createTrilhaDto: CreateTrilhaDto) {
    return this.trilhasService.create(createTrilhaDto);
  }

  // Leitura do catálogo: pública.
  @Get()
  @ApiOperation({ summary: 'Listar as trilhas' })
  @ApiResponse({ status: 200, description: 'Lista de trilhas.' })
  findAll() {
    return this.trilhasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma trilha pelo ID, com os cursos' })
  @ApiResponse({ status: 200, description: 'Trilha encontrada.' })
  @ApiResponse({ status: 400, description: 'ID não numérico.' })
  @ApiResponse({ status: 404, description: 'Trilha não encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trilhasService.findOne(id);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma trilha' })
  @ApiResponse({ status: 200, description: 'Trilha atualizada.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou ID não numérico.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Só administradores.' })
  @ApiResponse({ status: 404, description: 'Trilha não encontrada.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrilhaDto: UpdateTrilhaDto,
  ) {
    return this.trilhasService.update(id, updateTrilhaDto);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({
    summary:
      'Remover uma trilha (os cursos ficam sem trilha, não são apagados)',
  })
  @ApiResponse({ status: 200, description: 'Trilha removida.' })
  @ApiResponse({ status: 400, description: 'ID não numérico.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Só administradores.' })
  @ApiResponse({ status: 404, description: 'Trilha não encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.trilhasService.remove(id);
  }
}
