import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Req,
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
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

// O que a JwtStrategy.validate anexa em req.user.
type AuthenticatedRequest = { user: { userId: number; email: string } };

// Todas as rotas de matrícula exigem login. Sem perfis de admin, qualquer
// usuário logado lista e cancela matrículas de outros (limitação conhecida).
@ApiTags('enrollments')
@ApiBearerAuth('token')
@UseGuards(AuthGuard('jwt'))
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Matricular o usuário logado em um curso' })
  @ApiResponse({ status: 201, description: 'Matrícula criada.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou curso inexistente.',
  })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 409, description: 'Já matriculado neste curso.' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createEnrollmentDto: CreateEnrollmentDto,
  ) {
    return this.enrollmentsService.create(
      req.user.userId,
      createEnrollmentDto.courseId,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Listar matrículas (opcional: filtrar por usuário e curso)',
  })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de matrículas.' })
  @ApiResponse({ status: 400, description: 'Filtro não numérico.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  findAll(
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
    @Query('courseId', new ParseIntPipe({ optional: true })) courseId?: number,
  ) {
    return this.enrollmentsService.findAll({ userId, courseId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma matrícula pelo ID' })
  @ApiResponse({ status: 200, description: 'Matrícula encontrada.' })
  @ApiResponse({ status: 400, description: 'ID não numérico.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar uma matrícula' })
  @ApiResponse({ status: 200, description: 'Matrícula cancelada.' })
  @ApiResponse({ status: 400, description: 'ID não numérico.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}
