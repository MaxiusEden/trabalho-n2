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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // Escrita: exige login (qualquer usuário logado; não há perfis de admin).
  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Criar um curso com o conteúdo programático' })
  @ApiResponse({ status: 201, description: 'Curso criado.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou trilha inexistente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  // Leitura do catálogo: pública.
  @Get()
  @ApiOperation({ summary: 'Listar os cursos (opcional: filtrar por trilha)' })
  @ApiQuery({ name: 'trilhaId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de cursos.' })
  @ApiResponse({ status: 400, description: 'trilhaId não numérico.' })
  findAll(
    @Query('trilhaId', new ParseIntPipe({ optional: true })) trilhaId?: number,
  ) {
    return this.coursesService.findAll({ trilhaId });
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
  @UseGuards(AuthGuard('jwt'))
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
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um curso (com as aulas e matrículas)' })
  @ApiResponse({ status: 200, description: 'Curso removido.' })
  @ApiResponse({ status: 400, description: 'ID não numérico.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}
