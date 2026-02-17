package com.vishwaTechEdu.dto;

import java.math.BigDecimal;

public class TransferRequest {

    private Long receiverWalletId;
    private BigDecimal amount;

    public TransferRequest() {
    }

    public Long getReceiverWalletId() {
        return receiverWalletId;
    }

    public void setReceiverWalletId(Long receiverWalletId) {
        this.receiverWalletId = receiverWalletId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
