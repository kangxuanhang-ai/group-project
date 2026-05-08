import { Injectable , OnModuleInit} from '@nestjs/common';
import * as minio from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {
    private readonly minioClient: minio.Client;
    constructor(private readonly configService: ConfigService) {
        this.minioClient = new minio.Client({
            endPoint: this.configService.get<string>('MINIO_ENDPOINT')!,
            port:Number(this.configService.get('MINIO_PORT')),
            useSSL: !!Number(this.configService.get<string>('MINIO_USE_SSL')),
            accessKey: this.configService.get<string>('MINIO_ACCESS_KEY')!,
            secretKey: this.configService.get<string>('MINIO_SECRET_KEY')!,
        })
    }
    async onModuleInit() {
        try {
            const bucket = this.configService.get<string>('MINIO_BUCKET')!
            const exists = await this.minioClient.bucketExists(bucket)
            if(!exists){
                await this.minioClient.makeBucket(bucket)
                await this.minioClient.setBucketPolicy(bucket,JSON.stringify({
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Sid" :"PublicReadObjects",
                            "Effect" :"Allow",
                            "Principal":"*",
                            "Action": [
                                "s3:GetObject"
                            ],
                            "Resource": [
                                "arn:aws:s3:::avatar/*"
                            ]
                        }
                    ]
                }))
            }
        } catch (error) {
            console.warn('MinIO not available, skipping bucket creation. Error:', error)
        }
    }
    getClient(){
        return this.minioClient
    }
    getBucket(){
        return this.configService.get<string>('MINIO_BUCKET')!
    }
}
