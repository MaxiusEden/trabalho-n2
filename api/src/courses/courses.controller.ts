import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../generated/prisma/enums';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // Escrita: só ADMIN (etapa 8). O perfil vem do token.
  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Criar um curso com o conteúdo programático' })
  @ApiResponse({ status: 201, description: 'Curso criado.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou trilha inexistente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Só administradores.' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  // Leitura do catálogo: pública.
  @Get()
  @ApiOperation({
    summary: 'Listar os cursos (opcional: filtrar por trilha e por categoria)',
  })
  @ApiQuery({ name: 'trilhaId', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de cursos.' })
  @ApiResponse({ status: 400, description: 'Filtro não numérico.' })
  findAll(
    @Query('trilhaId', new ParseIntPipe({ optional: true })) trilhaId?: number,
    @Query('categoryId', new ParseIntPipe({ optional: true }))
    categoryId?: number,
  ) {
    return this.coursesService.findAll({ trilhaId, categoryId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um curso pelo ID' })
  @ApiResponse({ status: 200, description: 'Curso encontrado.' })
  @ApiResponse({ status: 400, description: 'ID não numérico.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar um curso (lessons, se enviado, substitui as aulas)',
  })
  @ApiResponse({ status: 200, description: 'Curso atualizado.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos, ID não numérico ou trilha inexistente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Só administradores.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um curso (com as aulas e matrículas)' })
  @ApiResponse({ status: 200, description: 'Curso removido.' })
  @ApiResponse({ status: 400, description: 'ID não numérico.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Só administradores.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}
