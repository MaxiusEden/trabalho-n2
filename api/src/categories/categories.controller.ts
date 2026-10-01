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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Escrita: só ADMIN (LAB03; decisão de 30/09/2026).
  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Criar uma categoria' })
  @ApiResponse({ status: 201, description: 'Categoria criada.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Só administradores.' })
  @ApiResponse({ status: 409, description: 'Nome de categoria já existe.' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  // Leitura: pública, como o resto do catálogo.
  @Get()
  @ApiOperation({ summary: 'Listar as categorias' })
  @ApiResponse({ status: 200, description: 'Lista de categorias.' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar uma categoria pelo ID, com os cursos e as trilhas dela',
  })
  @ApiResponse({ status: 200, description: 'Categoria encontrada.' })
  @ApiResponse({ status: 400, description: 'ID não numérico.' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma categoria' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou ID não numérico.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Só administradores.' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  @ApiResponse({ status: 409, description: 'Nome de categoria já existe.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({
    summary:
      'Remover uma categoria (cursos e trilhas ficam sem categoria, não são apagados)',
  })
  @ApiResponse({ status: 200, description: 'Categoria removida.' })
  @ApiResponse({ status: 400, description: 'ID não numérico.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Só administradores.' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
