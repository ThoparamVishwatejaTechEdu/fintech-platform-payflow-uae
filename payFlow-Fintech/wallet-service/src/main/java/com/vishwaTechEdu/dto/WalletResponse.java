package com.vishwaTechEdu.dto;

import java.math.BigDecimal;

public class WalletResponse {

    private Long walletId;
    private BigDecimal balance;

    public WalletResponse(Long walletId, BigDecimal balance) {
        this.walletId = walletId;
        this.balance = balance;
    }

    public Long getWalletId() {
        return walletId;
    }

    public BigDecimal getBalance() {
        return balance;
    }
}
