package com.application.springboot.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;

import java.util.HashMap;
import java.util.Map;

@EnableKafka
@Configuration
public class KafkaConsumerConfig {

  @Value("${spring.kafka.bootstrap-servers}")
  public String kafkaServerPort;

  @Bean
  public ConsumerFactory<String, String> consumerFactory() {
    // creates a Consumer using the consumer properties
    // https://kafka.apache.org/11/javadoc/org/apache/kafka/clients/consumer/ConsumerConfig.html
    Map<String, Object> config = new HashMap<>();

    // Offset and commit settings
    config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
    config.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, true);

    // Deserializers
    config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);

    // Message size limits
    config.put(ConsumerConfig.FETCH_MAX_BYTES_CONFIG, "209715200"); // 20 MB = 20000000 || 200 MB = 209715200
    config.put(ConsumerConfig.MAX_PARTITION_FETCH_BYTES_CONFIG, "209715200");

    // Timeout settings (20 secs)
    // Heartbeat interval: Must be < session_timeout / 3
    // Request timeout: Must be > session_timeout
    // Consumer sends heartbeat every X ms to show it's alive
    config.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 60_000); // 60 seconds
    config.put(ConsumerConfig.HEARTBEAT_INTERVAL_MS_CONFIG, 15_000); // 15 seconds (< 60/3)
    config.put(ConsumerConfig.REQUEST_TIMEOUT_MS_CONFIG, 90_000); // 90 seconds (> 60)
    config.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, "14400000"); // 4 hours - critical for long video processing

    config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaServerPort); // kafka broker address
    // config.put(ConsumerConfig.GROUP_ID_CONFIG, "group1");

    // Disable telemetry (fixes Raspberry Pi issues) and NullPointerException in Kafka client 3.8.1
    config.put("client.telemetry.enable", false);

    return new DefaultKafkaConsumerFactory<>(config);
  }

  @Bean
  public ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory() {
    ConcurrentKafkaListenerContainerFactory<String, String> factory = new ConcurrentKafkaListenerContainerFactory<>();
    factory.setConsumerFactory(consumerFactory());
    return factory;
  }
}
