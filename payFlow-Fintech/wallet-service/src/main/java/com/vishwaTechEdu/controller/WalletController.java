package com.vishwaTechEdu.controller;

import com.vishwaTechEdu.dto.AddMoneyRequest;
import com.vishwaTechEdu.dto.TransactionResponse;
import com.vishwaTechEdu.dto.TransferRequest;
import com.vishwaTechEdu.dto.WalletResponse;
import com.vishwaTechEdu.entity.Wallet;
import com.vishwaTechEdu.entity.WalletTransaction;
import com.vishwaTechEdu.service.WalletService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/v1/wallet")
public class WalletController {

    private final WalletService service;

    public WalletController(WalletService service) {
        this.service = service;
    }

    // 🔐 Create wallet
    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public Wallet create(@RequestHeader("userId") Long userId) {
        return service.create(userId);
    }

    // 🔐 SECURE BALANCE (THIS WAS THE BUG)
    @GetMapping("/balance/{walletId}")
    public WalletResponse balance(@RequestHeader("userId") Long userId,
                                  @PathVariable("walletId") Long walletId) {
        return new WalletResponse(
                walletId,
                service.getBalanceSecure(walletId, userId)
        );
    }

    // 🔐 Add money
    @PostMapping("/add-money/{walletId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addMoney(@RequestHeader("userId") Long userId,
                         @PathVariable("walletId") Long walletId,
                         @RequestBody AddMoneyRequest req) {
        service.addMoneySecure(walletId, userId, req.getAmount());
    }

    // 🔐 Transfer
    @PostMapping("/transfer/{walletId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void transfer(@RequestHeader("userId") Long userId,
                         @PathVariable("walletId") Long walletId,
                         @RequestBody TransferRequest req) {
        service.transferSecure(walletId, userId, req);
    }

    // 🔐 History
//    @GetMapping("/transactions/{walletId}")
//    public List<WalletTransaction> history(@RequestHeader("userId") Long userId,
//                                           @PathVariable("walletId") Long walletId) {
//        return service.historySecure(walletId, userId);
//    }


    @GetMapping("/transactions/{walletId}")
    public List<TransactionResponse> history(
            @RequestHeader("userId") Long userId,
            @PathVariable("walletId") Long walletId) {

        return service.historySecure(walletId, userId);
    }


    @GetMapping("/validate/{walletId}/{userId}")
    public void validate(@PathVariable("walletId") Long walletId,
                         @PathVariable("userId") Long userId) {

        service.validateOwnership(walletId, userId);
    }

    @GetMapping("/my-wallet")
    public Wallet getMyWallet(@RequestHeader("userId") Long userId) {
        return service.getByUserId(userId);
    }



}
