import { CopyObjectOutput, ManagedUpload } from 'aws-sdk/clients/s3';

export interface IS3Service {
  uploadFile(buffer: Buffer, key: string): Promise<ManagedUpload.SendData>;
  getSignedUrl(key: string): string;
  copyFile(oldKey: string, newKey: string): Promise<CopyObjectOutput>;
}
