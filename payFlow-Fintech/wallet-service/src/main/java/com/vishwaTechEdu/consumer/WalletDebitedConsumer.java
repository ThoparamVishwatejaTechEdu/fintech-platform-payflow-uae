//package com.vishwaTechEdu.consumer;
//
//import org.springframework.kafka.annotation.KafkaListener;
//
//public class WalletDebitedConsumer {
//
//    @KafkaListener(topics = "wallet-debited")
//    public void credit(String msg) {
//
//        String[] parts = msg.split(",");
//        Long receiver = Long.parseLong(parts[1]);
//        Double amount = Double.parseDouble(parts[2]);
//
//        var wallet = repo.findById(receiver).orElseThrow();
//
//        wallet.setBalance(wallet.getBalance() + amount);
//        repo.save(wallet);
//
//        kafka.send("wallet-credited", msg);
//    }
//}
