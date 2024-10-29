import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../services/s3.service';
import { getS3ImagePrefix } from '../../../Tools/utils/image.utils';
import { FileKeyQuery, UploadFileBody, UploadFileResponse } from '../dto/s3.dto';
import { CommonQueryDto } from 'src/common/dto/query/query.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiRes } from 'src/common/dto/api';
import { DirectoryContentsResponseDto } from '../dto/directory-contents.response.dto';
import { CompaniesService } from 'src/modules/companies/services/companies.service';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';

@Controller('aws/s3')
export class S3Controller {
  constructor(
    private readonly s3Service: S3Service,
    private readonly companyService: CompaniesService,
  ) {}

  @Get('directory')
  @ApiOperation({ summary: 'Get directory contents from S3' })
  @ApiResponse({
    status: 200,
    description: 'Returns the list of files',
  })
  async getDirectoryContents(
    @Query('path') path: string,
    @Query() query: CommonQueryDto,
    @ResCtx() ctx: ResponseContext,
    @Query('companyId') companyId?: string,
  ): Promise<ApiRes<DirectoryContentsResponseDto[]>> {
    await this.companyService.getUserCompany(ctx.userId, companyId);

    let directoryPath = `company-media/${companyId}`;
    if (path) {
      directoryPath += `/${path}`;
    }

    const [files, total] = await this.s3Service.getDirectoryContents(directoryPath, query);

    return {
      data: files,
      meta: {
        pagination: {
          page: query.pagination.page,
          pageSize: query.pagination.pageSize,
          pageCount: Math.ceil(+total / query.pagination.pageSize),
          total,
        },
      },
    };
  }

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadFileBody,
  ): Promise<UploadFileResponse> {
    const result = await this.s3Service.uploadFile(
      file.buffer,
      `${body.key}/${file.originalname}`,
      {
        ContentType: file.mimetype,
      },
    );

    return {
      url: getS3ImagePrefix() + result.Key,
      key: result.Key,
      name: file.originalname,
    };
  }

  @Delete('file')
  async deleteFile(@Query() query: FileKeyQuery) {
    return this.s3Service.deleteFolder(query.key);
  }
}
