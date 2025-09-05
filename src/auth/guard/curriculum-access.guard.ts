import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from 'src/enums/role.enum';
import {
  CURRICULUM_ACCESS_KEY,
  CurriculumAccessConfig,
} from '../../decorators/curriculum-access.decorator';

@Injectable()
export class CurriculumAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip if in development mode with UNAUTH
    const isUnAuth =
      process.env.UNAUTH === 'true' || process.env.UNAUTH === '1';
    if (isUnAuth) {
      return true;
    }

    // Get the configuration from the decorator
    const config = this.reflector.getAllAndOverride<CurriculumAccessConfig>(
      CURRICULUM_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no configuration is set, allow access
    if (!config) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // User must be authenticated
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Admin access bypass
    if (config.allowAdminAccess && user.role === UserRole.Admin) {
      return true;
    }

    // Instructor access bypass
    if (config.allowInstructorAccess && user.role === UserRole.Instructor) {
      return true;
    }

    // For coordinators, check if they have access to the curriculum
    if (user.role === UserRole.Coordinator) {
      const curriculumIdentifier = request.params[config.paramName!];
      
      if (!curriculumIdentifier) {
        throw new NotFoundException('Curriculum identifier not found');
      }

      return await this.checkCoordinatorAccess(
        user.id,
        curriculumIdentifier,
        config.paramType!,
      );
    }

    // For other roles, deny access by default
    throw new ForbiddenException('Access denied to this curriculum');
  }

  private async checkCoordinatorAccess(
    userId: number,
    curriculumIdentifier: string | number,
    paramType: 'id' | 'code',
  ): Promise<boolean> {
    const whereClause =
      paramType === 'id'
        ? { id: Number(curriculumIdentifier) }
        : { code: String(curriculumIdentifier) };

    const curriculum = await this.prisma.curriculum.findFirst({
      where: {
        ...whereClause,
        coordinators: {
          some: {
            coordinator: {
              user: {
                id: userId,
              },
            },
          },
        },
      },
    });

    if (!curriculum) {
      // Use NotFoundException to prevent enumeration attacks
      // (same error whether curriculum doesn't exist or user doesn't have access)
      throw new NotFoundException(
        `Curriculum ${paramType === 'id' ? 'with ID' : 'with code'} ${curriculumIdentifier} not found`,
      );
    }

    return true;
  }
}
