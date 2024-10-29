import { Injectable } from '@nestjs/common';
import { CompanyModel, UserCompanyModel } from '@database/Models';

@Injectable()
export class CompanyRepository {
  getCompany(data: Partial<CompanyModel>) {
    return CompanyModel.query().findOne(data);
  }

  getUserCompany(userId: string, companyId: string) {
    return UserCompanyModel.query().findById([companyId, userId]);
  }

  getUserCompanies(userId: string) {
    return UserCompanyModel.query().where({ userId });
  }

  insertCompany(data: Partial<CompanyModel>) {
    return CompanyModel.query().insertAndFetch(data);
  }

  insertUserCompany(data: Partial<UserCompanyModel>) {
    return UserCompanyModel.query().insertAndFetch(data);
  }

  deleteCompany(companyId: string) {
    return CompanyModel.query().delete().where({ companyId });
  }
}
