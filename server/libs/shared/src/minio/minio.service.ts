import { Injectable, OnModuleInit } from '@nestjs/common';
import * as minio from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {
    private minioClient: minio.Client | null = null;
    private isAvailable = false;

    constructor(private readonly configService: ConfigService) {
        try {
            this.minioClient = new minio.Client({
                endPoint: this.configService.get<string>('MINIO_ENDPOINT') || '127.0.0.1',
                port: Number(this.configService.get('MINIO_PORT')) || 9000,
                useSSL: !!Number(this.configService.get<string>('MINIO_USE_SSL')),
                accessKey: this.configService.get<string>('MINIO_ACCESS_KEY') || 'minioadmin',
                secretKey: this.configService.get<string>('MINIO_SECRET_KEY') || 'minioadmin',
            });
        } catch (error) {
            console.warn('MinIO client initialization failed:', error);
            this.minioClient = null;
        }
    }

    async onModuleInit() {
        if (!this.minioClient) {
            console.warn('MinIO client not initialized, skipping bucket creation');
            return;
        }
        try {
            const bucket = this.configService.get<string>('MINIO_BUCKET') || 'avatar';
            const exists = await this.minioClient.bucketExists(bucket);
            if (!exists) {
                await this.minioClient.makeBucket(bucket);
                await this.minioClient.setBucketPolicy(bucket, JSON.stringify({
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Sid": "PublicReadObjects",
                            "Effect": "Allow",
                            "Principal": "*",
                            "Action": [
                                "s3:GetObject"
                            ],
                            "Resource": [
                                "arn:aws:s3:::avatar/*"
                            ]
                        }
                    ]
                }));
            }
            this.isAvailable = true;
        } catch (error) {
            console.warn('MinIO not available, skipping bucket creation. Error:', error);
            this.isAvailable = false;
        }
    }

    getClient(): minio.Client | null {
        return this.minioClient;
    }

    getBucket(): string {
        return this.configService.get<string>('MINIO_BUCKET') || 'avatar';
    }

    getIsAvailable(): boolean {
        return this.isAvailable;
    }
}
