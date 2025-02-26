import { IsNumber, IsOptional } from 'class-validator';
import { FilterParams } from './filter-params.dto';

export class FilterCourse extends FilterParams {
    @IsOptional()
    @IsNumber()
    branchId?: number
}
