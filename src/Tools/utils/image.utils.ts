import { Environment } from '../../constants';

export function getS3ImagePrefix() {
  const stage = process.env.NODE_ENV === Environment.PROD ? '' : 'dev-';
  return `https://${stage}images.artistorybackend.net/`;
}
