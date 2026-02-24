package com.application.springboot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

  private final EmailSenderService emailSenderService;

  @Autowired
  public KafkaConsumerService(EmailSenderService emailSenderService) {
    this.emailSenderService = emailSenderService;
  }

  // this topic has 4 partitions (KAFKA_NUM_PARTITIONS in docker-compose.yml)
  @KafkaListener(topics = "email-notification", groupId = "group1", concurrency = "2")
  public void listenToTopic(String payload) throws Exception {
    System.out.println("Consumed message from topic email-notification ✨✨");
    emailSenderService.sendEmail(payload);
  }
}
