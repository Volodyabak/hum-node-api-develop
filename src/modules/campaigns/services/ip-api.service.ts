import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { IpApiResponse } from '../interfaces/ip-api.interfaces';

@Injectable()
export class IpApiService {
  private baseApiUrl = 'http://ip-api.com/json';

  async getIpInfo(ip: string): Promise<IpApiResponse> {
    const { data } = await axios.get<IpApiResponse>(`${this.baseApiUrl}/${ip}`);
    return data;
  }
}
