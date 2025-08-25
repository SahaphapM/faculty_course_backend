import { SetMetadata } from '@nestjs/common';

export const CURRICULUM_ACCESS_KEY = 'curriculumAccess';

export interface CurriculumAccessConfig {
  paramName?: string; // The parameter name that contains the curriculum ID/code (default: 'id')
  paramType?: 'id' | 'code'; // Whether the parameter is an ID or code (default: 'id')
  allowAdminAccess?: boolean; // Whether admins can bypass the restriction (default: true)
  allowInstructorAccess?: boolean; // Whether instructors can bypass the restriction (default: false)
}

/**
 * Decorator to restrict curriculum access to only coordinators assigned to the curriculum.
 * Admins and other specified roles can bypass this restriction.
 * 
 * @param config Configuration for curriculum access control
 */
export const CurriculumAccess = (config: CurriculumAccessConfig = {}) =>
  SetMetadata(CURRICULUM_ACCESS_KEY, {
    paramName: 'id',
    paramType: 'id',
    allowAdminAccess: true,
    allowInstructorAccess: false,
    ...config,
  });
