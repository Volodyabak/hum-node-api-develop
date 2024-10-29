import { Injectable } from '@nestjs/common';
import { RepositoryService } from '../../repository/services/repository.service';
import { v4 } from 'uuid';
import { CreateCompanyDto } from '../dto/companies.dto';
import { UserCompanyRole } from '../inerfaces/companies.interface';
import { ErrorConst } from '../../../constants';
import { expr } from '@database/relations/relation-builder';
import { Relations } from '@database/relations/relations';
import { BallotModel, CompanyModel } from '@database/Models';
import { BrackhitModel } from '@database/Models/BrackhitModel';
import { PaginationQueryDto } from '../../../Tools/dto/main-api.dto';
import { joinPaginationParamsToQueryBuilder } from '../../../decorators/restful-query.decorator';
import { S3Service } from '../../aws/services/s3.service';
import { getS3ImagePrefix } from '../../../Tools/utils/image.utils';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly repositoryService: RepositoryService,
    private readonly s3Service: S3Service,
  ) {}

  async getUserCompany(userId: string, companyId: string) {
    const userCompany = await this.repositoryService.companyRepo
      .getUserCompany(userId, companyId)
      .withGraphFetched(expr([Relations.Company, [Relations.Campaigns]]));

    if (!userCompany) {
      throw new Error(ErrorConst.COMPANY_NOT_FOUND);
    }

    return userCompany.company;
  }

  async getUserCompanies(userId: string): Promise<CompanyModel[]> {
    const companies = await this.repositoryService.companyRepo
      .getUserCompanies(userId)
      .withGraphFetched(expr([Relations.Company, [Relations.Campaigns]]))
      .orderBy('createdAt', 'desc');

    return companies.map((el) => el.company);
  }

  async createCompany(userId: string, data: CreateCompanyDto): Promise<CompanyModel> {
    const existingCompany = await this.repositoryService.companyRepo.getCompany({
      name: data.name,
    });

    if (existingCompany) {
      throw new Error(ErrorConst.COMPANY_ALREADY_EXISTS);
    }

    const companyId = v4();

    const [company, userCompany] = await Promise.all([
      this.repositoryService.companyRepo.insertCompany({
        ...data,
        companyId,
      }),
      this.repositoryService.companyRepo.insertUserCompany({
        userId,
        companyId: companyId,
        userRole: UserCompanyRole.ADMIN,
      }),
    ]);

    return company;
  }

  async updateCompany(userId: string, companyId: string, data: CreateCompanyDto) {
    const userCompany = await this.repositoryService.companyRepo.getUserCompany(userId, companyId);

    if (!userCompany) {
      throw new Error(ErrorConst.USER_DOES_NOT_BELONG_TO_COMPANY);
    }

    const company = await this.repositoryService.companyRepo.getCompany({
      companyId,
    });

    return company.$query().patchAndFetch(data);
  }

  async deleteCompany(userId: string, companyId: string) {
    const userCompany = await this.repositoryService.companyRepo.getUserCompany(userId, companyId);

    if (!userCompany) {
      throw new Error(ErrorConst.COMPANY_NOT_FOUND);
    }

    await this.repositoryService.companyRepo.deleteCompany(companyId);
  }

  async getCompanyContent(
    userId: string,
    companyId: string,
    type: 'brackhits' | 'ballots',
    pagination: PaginationQueryDto,
  ) {
    const userCompany = await this.repositoryService.companyRepo
      .getUserCompany(userId, companyId)
      .withGraphFetched(
        expr([
          Relations.Company,
          [Relations.Campaigns, [Relations.CampaignBrackhits], [Relations.CampaignBallots]],
        ]),
      );

    if (!userCompany) {
      throw new Error(ErrorConst.COMPANY_NOT_FOUND);
    }

    const { campaigns, ...rest } = userCompany.company;

    const response = {
      data: {
        company: rest,
        [type]: [],
      },
      pagination: {
        total: 0,
        skip: pagination.skip,
        take: pagination.take,
      },
    };

    if (type === 'brackhits') {
      const query = BrackhitModel.query().where({ ownerId: userId }).orderBy('createdAt', 'desc');
      const total = query.clone().resultSize();

      joinPaginationParamsToQueryBuilder(query, { paginationParams: pagination });

      [response.pagination.total, response.data[type]] = await Promise.all([total, query]);
    } else if (type === 'ballots') {
      const query = BallotModel.query().where({ ownerId: userId }).orderBy('createdAt', 'desc');
      const total = query.clone().resultSize();

      joinPaginationParamsToQueryBuilder(query, { paginationParams: pagination });

      [response.pagination.total, response.data[type]] = await Promise.all([total, query]);
    }

    return response;
  }

  async getCompanyMedia(userId: string, companyId: string) {
    const userCompany = await this.repositoryService.companyRepo.getUserCompany(userId, companyId);

    if (!userCompany) {
      throw new Error(ErrorConst.USER_DOES_NOT_BELONG_TO_COMPANY);
    }

    const objects = await this.s3Service.listObjects({
      Prefix: `company-media/${companyId}/`,
    });

    return {
      data: objects.Contents.filter((item) => /\.(jpg|jpeg|png|gif)$/i.test(item.Key)).map(
        (item) => getS3ImagePrefix() + item.Key,
      ),
    };
  }
}
