package com.vishwaTechEdu.dto;

public class CreateWalletRequest {

    private Long userId;

    public CreateWalletRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
