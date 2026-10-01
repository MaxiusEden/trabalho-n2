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
import type { AuthenticatedRequest } from '../auth/auth-user';

// Todas as rotas de matrícula exigem login. O USER se matricula e vê ou cancela
// só as próprias; as de outros usuários, só o ADMIN (etapa 8).
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
    summary:
      'Listar matrículas: ADMIN vê todas (filtros opcionais); USER, só as próprias',
  })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de matrículas.' })
  @ApiResponse({ status: 400, description: 'Filtro não numérico.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({
    status: 403,
    description: 'USER pedindo matrículas de outro usuário.',
  })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
    @Query('courseId', new ParseIntPipe({ optional: true })) courseId?: number,
  ) {
    return this.enrollmentsService.findAll(req.user, { userId, courseId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma matrícula pelo ID (dono ou ADMIN)' })
  @ApiResponse({ status: 200, description: 'Matrícula encontrada.' })
  @ApiResponse({ status: 400, description: 'ID não numérico.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Matrícula de outro usuário.' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada.' })
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.enrollmentsService.findOne(id, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar uma matrícula (dono ou ADMIN)' })
  @ApiResponse({ status: 200, description: 'Matrícula cancelada.' })
  @ApiResponse({ status: 400, description: 'ID não numérico.' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
  @ApiResponse({ status: 403, description: 'Matrícula de outro usuário.' })
  @ApiResponse({ status: 404, description: 'Matrícula não encontrada.' })
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.enrollmentsService.remove(id, req.user);
  }
}
