package com.vishwaTechEdu.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "wallet",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "userId")
        }
)
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long walletId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 3)
    private String currency; // AED, USD, etc.

    public Long getWalletId() {
        return walletId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getCurrency() {
        return currency;
    }

    public void setWalletId(Long walletId) {
        this.walletId = walletId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
