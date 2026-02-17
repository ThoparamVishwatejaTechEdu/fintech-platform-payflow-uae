package com.vishwaTechEdu.client;
import com.vishwaTechEdu.dto.TransferRequest;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
@Component
public class WalletClient {

    private final WebClient walletWebClient;

//    public WalletClient(WebClient walletWebClient) {
//        this.walletWebClient = walletWebClient;
//    }
public WalletClient(@Qualifier("walletWebClient") WebClient walletWebClient) {
    this.walletWebClient = walletWebClient;
}


    public void transfer(Long senderWalletId,
                         Long receiverWalletId,
                         BigDecimal amount,
                         Long userId) {

        try {

            TransferRequest req = new TransferRequest();
            req.setReceiverWalletId(receiverWalletId);
            req.setAmount(amount);

            walletWebClient
                    .post()
                    .uri("/api/v1/wallet/transfer/{walletId}", senderWalletId)
                    .header("userId", String.valueOf(userId))
                    .bodyValue(req)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

            System.out.println("WALLET TRANSFER SUCCESS");

        } catch (Exception ex) {
            ex.printStackTrace();
            throw ex;
        }
    }


    public void validateOwnership(Long walletId, Long userId) {

        walletWebClient
                .get()
                .uri("/api/v1/wallet/validate/{walletId}/{userId}",
                        walletId, userId)
                .retrieve()
                .bodyToMono(Void.class)
                .block();
    }



}
