package com.application.springboot.service;

import com.application.sharedlibrary.config.AwsClientBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.util.List;

@Service("S3StorageSyncService")
public class S3StorageSyncService implements CloudStorageSyncService {

  @Value("${aws.credentials.profile}")
  String awsProfile;

  @Value("${aws.credentials.region}")
  String awsRegion;

  @Value("${aws.s3.bucket-name}")
  String bucketName;

  private final AwsClientBuilder connection;

  @Autowired
  public S3StorageSyncService(AwsClientBuilder connection) {
    this.connection = connection;
  }

  @Override
  public void createBucket(String bucketName) {
    S3Client s3Client = connection.get(S3Client.class);
    List<Bucket> buckets = s3Client.listBuckets().buckets();
    System.out.println("Total " + buckets.size() + " AWS S3 buckets present");
    // ListBucketsResponse response = s3Client.listBuckets();
    // List<Bucket> buckets = response.buckets();
    // for (Bucket bucket : buckets) {
    // System.out.println("Bucket name: " + bucket.name());
    // System.out.println("Creation date: " + bucket.creationDate());
    // }

    boolean isBucketPresent = checkBucketExists(s3Client);
    if (isBucketPresent) {
      System.out.println("Bucket '" + bucketName + "' already exists.");
    } else {
      CreateBucketRequest createBucketRequest = CreateBucketRequest.builder().bucket(bucketName).build();
      s3Client.createBucket(createBucketRequest);
      System.out.println("Bucket '" + bucketName + "' created successfully.");
    }
  }

  private boolean checkBucketExists(S3Client s3Client) throws S3Exception {
    try {
      s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
      return true;
    } catch (NoSuchBucketException e) {
      return false;
    }
  }

  // https://videohub.raspberryip.com/s01/video/1/12/master.m3u8 should redirect to https://<bucket>.s3.us-east-1.amazonaws.com/videos/1/12/master.m3u8
  // local path (docker): /app/videos/1/14
  // remote path: s3://<bucket_name>/videos/1/14
  @Override
  public void syncDirectoryFromLocal(String localPath, String remotePath) throws Exception {
    try {
      System.out.println("Local path: " + localPath);
      System.out.println("Remote path: " + remotePath);
      System.out.println("AWS Region: " + awsRegion + " and AWS Profile: " + awsProfile);

      // Note: If get error here check the aws credential in ~/.aws/credential and ~/.aws/config
      ProcessBuilder processBuilder = new ProcessBuilder(
          "aws", "s3", "sync",
          localPath,
          remotePath,
          "--region", awsRegion
        //  "--profile", awsProfile
          );

      // processBuilder.inheritIO(); // Optional: To print output to console
      Process process = processBuilder.start();
      int exitCode = process.waitFor();

      if (exitCode != 0)
        throw new RuntimeException("❌ AWS S3 Sync failed with code: " + exitCode);

      System.out.println("✅ Sync completed from " + localPath + " → " + remotePath);
    } catch (Exception e) {
      System.out.println("❌ AWS S3 Sync failed with code: " + e.getMessage());
      throw e;
    }
  }
}
