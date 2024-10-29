import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CompaniesService } from '../services/companies.service';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { CompaniesContentParams, CompanyIdDto, CreateCompanyDto } from '../dto/companies.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompaniesResponse } from '../dto/companies.output.dto';
import { CompanyModel } from '@database/Models';
import { PaginationQueryDto } from '../../../Tools/dto/main-api.dto';

@Controller('companies')
@ApiTags('Companies')
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companyService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'Returns user companies' })
  @ApiResponse({ type: CompaniesResponse })
  async getCompanies(@ResCtx() resCtx: ResponseContext) {
    return this.companyService.getUserCompanies(resCtx.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Creates company' })
  @ApiResponse({ type: CompanyModel })
  async createCompany(@Body() body: CreateCompanyDto, @ResCtx() resCtx: ResponseContext) {
    return this.companyService.createCompany(resCtx.userId, body);
  }

  @Get('/:companyId')
  @ApiOperation({ summary: 'Returns specified company' })
  @ApiResponse({ type: CompanyModel })
  async getCompany(@Param() param: CompanyIdDto, @ResCtx() resCtx: ResponseContext) {
    return this.companyService.getUserCompany(resCtx.userId, param.companyId);
  }

  @Get('/:companyId/media')
  @ApiOperation({ summary: 'Returns company ballots' })
  async getCompaniesMedia(@Param() param: CompanyIdDto, @ResCtx() resCtx: ResponseContext) {
    return this.companyService.getCompanyMedia(resCtx.userId, param.companyId);
  }

  @Get('/:companyId/:content')
  @ApiOperation({ summary: 'Returns company ballots' })
  async getCompaniesContent(
    @Param() param: CompaniesContentParams,
    @ResCtx() resCtx: ResponseContext,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.companyService.getCompanyContent(
      resCtx.userId,
      param.companyId,
      param.content,
      paginationQuery,
    );
  }

  @Put('/:companyId')
  @ApiOperation({ summary: 'Updates company' })
  @ApiResponse({ type: CompanyModel })
  async updateCompany(
    @Param() param: CompanyIdDto,
    @Body() body: CreateCompanyDto,
    @ResCtx() resCtx: ResponseContext,
  ) {
    return this.companyService.updateCompany(resCtx.userId, param.companyId, body);
  }

  @Delete('/:companyId')
  @ApiOperation({ summary: 'Deletes company' })
  async deleteCompany(@Param() param: CompanyIdDto, @ResCtx() resCtx: ResponseContext) {
    return this.companyService.deleteCompany(resCtx.userId, param.companyId);
  }
}
