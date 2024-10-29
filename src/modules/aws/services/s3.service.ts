import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import {
  CopyObjectOutput,
  Delete,
  GetObjectOutput,
  ListObjectsV2Request,
  ManagedUpload,
  PutObjectRequest,
} from 'aws-sdk/clients/s3';

import { s3Config } from '../configs/s3.config';
import { IS3Service } from '../interfaces/aws.interfaces';
import { CommonQueryDto } from 'src/common/dto/query/query.dto';
import { DirectoryContentsResponseDto } from '../dto/directory-contents.response.dto';
import { getS3ImagePrefix } from 'src/Tools/utils/image.utils';

@Injectable()
export class S3Service implements IS3Service {
  private _client = new S3(s3Config);

  async getDirectoryContents(
    directoryPath: string,
    query: CommonQueryDto,
  ): Promise<[DirectoryContentsResponseDto[], number]> {
    const params = {
      Prefix: directoryPath,
      MaxKeys: query.pagination.pageSize,
      ContinuationToken: query.pagination.skip ? String(query.pagination.skip) : undefined,
    };

    const result = await this.listObjects(params);

    const files = result.Contents.map((item) => ({
      key: item.Key,
      url: getS3ImagePrefix() + item.Key,
      lastModified: item.LastModified,
      size: item.Size,
    }));

    const total = result.KeyCount || 0;

    return [files, total];
  }

  async listObjects(params?: Partial<ListObjectsV2Request>) {
    return this._client
      .listObjectsV2({
        Bucket: s3Config.bucketName,
        ...params,
      })
      .promise();
  }

  async getObject(key: string): Promise<GetObjectOutput> {
    return this._client.getObject({ Bucket: s3Config.bucketName, Key: key }).promise();
  }

  async copyFile(oldKey: string, newKey: string): Promise<CopyObjectOutput> {
    return this._client
      .copyObject({
        Bucket: s3Config.bucketName,
        CopySource: `${s3Config.bucketName}/${oldKey}`,
        Key: newKey,
      })
      .promise();
  }

  getSignedUrl(key: string): string {
    if (!key) return undefined;

    return this._client.getSignedUrl('getObject', { Bucket: s3Config.bucketName, Key: key });
  }

  async uploadFile(
    buffer: Buffer,
    key: string,
    params?: Partial<PutObjectRequest>,
  ): Promise<ManagedUpload.SendData> {
    return this._client
      .upload({
        Bucket: s3Config.bucketName,
        Body: buffer,
        Key: key,
        ...params,
      })
      .promise();
  }

  async putObject(key: string, params: Partial<PutObjectRequest>) {
    return this._client
      .putObject({
        ...params,
        Key: key,
        Bucket: s3Config.bucketName,
      })
      .promise();
  }

  async deleteObject(key: string) {
    return this._client
      .deleteObject({
        Bucket: s3Config.bucketName,
        Key: key,
      })
      .promise();
  }

  async deleteObjects(deleteParams: Delete) {
    return this._client
      .deleteObjects({
        Bucket: s3Config.bucketName,
        Delete: deleteParams,
      })
      .promise();
  }

  async deleteFolder(key: string) {
    const list = await this.listObjects({ Prefix: key });
    const keys = list.Contents.map((item) => ({ Key: item.Key }));
    if (keys.length) {
      await this.deleteObjects({ Objects: keys });
    }
  }

  async moveTempFile(key: string) {
    const newKey = key.replace('temp/', '');
    await this.copyFile(key, newKey);
    await this.deleteObjects({ Objects: [{ Key: key }] });
    return newKey;
  }
}
