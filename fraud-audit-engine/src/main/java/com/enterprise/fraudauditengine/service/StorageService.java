package com.enterprise.fraudauditengine.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.InputStream;

@Service
public class StorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public StorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public void uploadDataset(String fileName, InputStream inputStream, long contentLength) {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType("text/csv")
                .build();
        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(inputStream, contentLength));
    }

    public InputStream downloadDataset(String fileName) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build();
        return s3Client.getObject(getObjectRequest);
    }

    public void deleteDataset(String fileName) {
        DeleteObjectRequest deleteReq = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build();
        s3Client.deleteObject(deleteReq);
    }
}