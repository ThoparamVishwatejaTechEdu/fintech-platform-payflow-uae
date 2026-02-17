package com.vishwaTechEdu.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentEventConsumer {

    @KafkaListener(
            topics = {"payment-events", "wallet-events", "kyc-events"}
    )
    public void consume(String message) {

        System.out.println("================================");
        System.out.println("📩 NOTIFICATION RECEIVED");
        System.out.println("Event : " + message);
        System.out.println("Simulating Email + SMS...");
        System.out.println("================================");
    }
}
