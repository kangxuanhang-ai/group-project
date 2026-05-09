import type {TrackerConfig} from '@en/common/tracker';
import {getFingerprint} from '@/uv';
import {reportEvent} from '@/event';
import {reportError} from '@/error';
import {reportPv} from '@/pv';
import {reportPerformance} from '@/performance';
import { reportFetch } from '@/report';


export class Tracker {
  private config : TrackerConfig;
  private visitorId: string | null = null;
  private initPromise: Promise<void> | null = null;
  constructor( config:TrackerConfig) {
    this.config = config;
    this.init();
  }
  protected async init(){
    if(this.initPromise) return this.initPromise;
    this.initPromise = (async ()=>{
      let config = this.config;
      this.visitorId = await getFingerprint(config);
      if(this.visitorId){
        reportEvent(this.visitorId, config);
        reportError(this.visitorId, config);
        reportPv(this.visitorId, config);
        reportPerformance(this.visitorId, config);
      }
    })()
    
    return this.initPromise;
  }

  public async setUserId(userId:string){
    await this.init();
    let url = this.config.baseUrl + this.config.uv.updateApi;
    reportFetch(url, {
      visitorId: this.visitorId!,
      userId,
    })
  }
}

// const tracker = new Tracker({
//   baseUrl: '/api/v1',
//   uv: {
//     api: '/tracker/uv',
//     updateApi: '/tracker/update-uv',
//   },
//   pv: {
//     api: '/tracker/pv',
//   },
//   event: {
//     api: '/tracker/event',
//   },
//   error: {
//     api: '/tracker/error',
//   },
//   performance: {
//     api: '/tracker/performance',
//   },
// });

// setTimeout(() => {
//   Promise.reject(new Error('test error'))
//   Promise.reject([])
//   Promise.reject('asd')
// }, 1000);