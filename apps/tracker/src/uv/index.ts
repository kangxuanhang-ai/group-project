import type {UvDto, TrackerConfig} from '@en/common/tracker';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import {UAParser} from 'ua-parser-js';
import {reportFetch} from '@/report';


export const getBrowserInfo = async () => {
  const ua = new UAParser();
  return{
    browser: ua.getBrowser().name,
    os: ua.getOS().name,
    device: ua.getDevice().type || 'desktop',
  }
  
};

export const getFingerprint = async (config:TrackerConfig) => {
  const browserInfo = await getBrowserInfo()
  const fp=await FingerprintJS.load();
  const result = await fp.get();
  const body: UvDto = {
    anonymousId: result.visitorId,
    browser: browserInfo.browser || '',
    os: browserInfo.os || '',
    device: browserInfo.device || '',
  }
  // console.log(body);
  let url = config.baseUrl + config.uv.api;
  const res = await reportFetch(url, body);
  return res.data;
};