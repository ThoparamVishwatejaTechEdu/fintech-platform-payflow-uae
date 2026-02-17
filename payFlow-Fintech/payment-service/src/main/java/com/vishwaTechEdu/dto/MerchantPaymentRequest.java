package com.vishwaTechEdu.dto;

import java.math.BigDecimal;

public class MerchantPaymentRequest {
    public Long userWalletId;
    public Long merchantWalletId;
    public BigDecimal amount;

    public Long getUserWalletId() {
        return userWalletId;
    }

    public void setUserWalletId(Long userWalletId) {
        this.userWalletId = userWalletId;
    }

    public Long getMerchantWalletId() {
        return merchantWalletId;
    }

    public void setMerchantWalletId(Long merchantWalletId) {
        this.merchantWalletId = merchantWalletId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}

