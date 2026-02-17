//package com.vishwaTechEdu.consumer;
//
//
//import com.vishwaTechEdu.repo.WalletRepository;
//import org.springframework.kafka.annotation.KafkaListener;
//import org.springframework.stereotype.Component;
//
//@Component
//public class PaymentCreatedConsumer {
//
//    private final WalletRepository repo;
//
//    public PaymentCreatedConsumer(WalletRepository repo) {
//        this.repo = repo;
//    }
//
//    @KafkaListener(topics = "payment-created")
//    public void debit(String msg) {
//
//        String[] parts = msg.split(",");
//        Long sender = Long.parseLong(parts[0]);
//        Long receiver = Long.parseLong(parts[1]);
//        Double amount = Double.parseDouble(parts[2]);
//
//        var wallet = repo.findById(sender).orElseThrow();
//
//        if (wallet.getBalance() < amount) {
//            // credit failed
//            return;
//        }
//
//        wallet.setBalance(wallet.getBalance() - amount);
//        repo.save(wallet);
//
//        // emit WALLET_DEBITED
//
//    }
//
//
//
//
//}
//
