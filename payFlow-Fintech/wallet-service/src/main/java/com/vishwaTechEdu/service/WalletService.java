package com.vishwaTechEdu.service;

import com.vishwaTechEdu.dto.TransactionResponse;
import com.vishwaTechEdu.dto.TransferRequest;
import com.vishwaTechEdu.entity.*;
import com.vishwaTechEdu.exception.WalletException;
import com.vishwaTechEdu.repo.LedgerRepository;
import com.vishwaTechEdu.repo.TransactionRepository;
import com.vishwaTechEdu.repo.WalletRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
public class WalletService {

    private final WalletRepository walletRepo;
    private final LedgerRepository ledgerRepo;
    private final TransactionRepository txRepo;

    public WalletService(WalletRepository walletRepo,
                         LedgerRepository ledgerRepo,
                         TransactionRepository txRepo) {
        this.walletRepo = walletRepo;
        this.ledgerRepo = ledgerRepo;
        this.txRepo = txRepo;
    }

    /* ================= CREATE ================= */

    public Wallet create(Long userId) {
        if (walletRepo.findByUserId(userId).isPresent()) {
            throw new WalletException("Wallet already exists");
        }

        Wallet wallet = new Wallet();
        wallet.setUserId(userId);
        wallet.setCurrency("AED");
        return walletRepo.save(wallet);
    }

    /* ================= BALANCE ================= */

    // ✅ ONLY POSITIONAL PARAMETER
    @Cacheable(value = "wallet-balance", key = "#p0")
    public BigDecimal getBalanceSecure(Long walletId, Long userId) {

        Wallet wallet = walletRepo.findById(walletId)
                .orElseThrow(() -> new WalletException("Wallet not found"));

        if (!wallet.getUserId().equals(userId)) {
            throw new WalletException("Access denied");
        }

        return ledgerRepo.findByWalletId(walletId)
                .stream()
                .map(l ->
                        l.getType() == TransactionType.CREDIT
                                ? l.getAmount()
                                : l.getAmount().negate()
                )
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /* ================= ADD MONEY ================= */

    @CacheEvict(value = "wallet-balance", key = "#p0")
    public void addMoneySecure(Long walletId,
                               Long userId,
                               BigDecimal amount) {

        validateAmount(amount);

        Wallet wallet = walletRepo.findById(walletId)
                .orElseThrow(() -> new WalletException("Wallet not found"));

        if (!wallet.getUserId().equals(userId)) {
            throw new WalletException("Access denied");
        }

        ledgerRepo.save(createLedger(walletId, amount, TransactionType.CREDIT, "ADD_MONEY"));
        txRepo.save(createTx(walletId, amount, TransactionType.CREDIT, "ADD_MONEY"));
    }

    /* ================= TRANSFER ================= */

    @Transactional
    @CacheEvict(value = "wallet-balance", allEntries = true)
    public void transferSecure(Long senderWalletId,
                               Long userId,
                               TransferRequest req) {

        validateAmount(req.getAmount());

        Wallet sender = walletRepo.findById(senderWalletId)
                .orElseThrow(() -> new WalletException("Sender wallet not found"));

        if (!sender.getUserId().equals(userId)) {
            throw new WalletException("Access denied");
        }

        Wallet receiver = walletRepo.findById(req.getReceiverWalletId())
                .orElseThrow(() -> new WalletException("Receiver wallet not found"));

        BigDecimal balance = getBalanceSecure(senderWalletId, userId);
        if (balance.compareTo(req.getAmount()) < 0) {
            throw new WalletException("Insufficient balance");
        }

        ledgerRepo.save(createLedger(senderWalletId, req.getAmount(), TransactionType.DEBIT, "TRANSFER"));
        ledgerRepo.save(createLedger(receiver.getWalletId(), req.getAmount(), TransactionType.CREDIT, "TRANSFER"));

        txRepo.save(createTx(senderWalletId, req.getAmount(), TransactionType.DEBIT, "TRANSFER"));
        txRepo.save(createTx(receiver.getWalletId(), req.getAmount(), TransactionType.CREDIT, "TRANSFER"));
    }



    /* ================= HELPERS ================= */

    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new WalletException("Amount must be greater than zero");
        }
    }

    private LedgerEntry createLedger(Long walletId,
                                     BigDecimal amount,
                                     TransactionType type,
                                     String ref) {
        LedgerEntry e = new LedgerEntry();
        e.setWalletId(walletId);
        e.setAmount(amount);
        e.setType(type);
        e.setReference(ref);
        return e;
    }

    private WalletTransaction createTx(Long walletId,
                                       BigDecimal amount,
                                       TransactionType type,
                                       String ref) {
        WalletTransaction t = new WalletTransaction();
        t.setWalletId(walletId);
        t.setAmount(amount);
        t.setType(type);
        t.setReference(ref);
        return t;
    }



    public void validateOwnership(Long walletId, Long userId) {

        try {

            Wallet wallet = walletRepo.findById(walletId)
                    .orElseThrow(() -> new WalletException("Wallet not found"));

            System.out.println("Wallet: " + wallet);

            if (wallet.getUserId() == null) {
                throw new RuntimeException("DB userId is NULL");
            }

            if (!wallet.getUserId().equals(userId)) {
                throw new WalletException("Unauthorized wallet access");
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }


    public Wallet getByUserId(Long userId) {
        return walletRepo.findByUserId(userId)
                .orElseThrow(() -> new WalletException("Wallet not found"));
    }



    /* ================= HISTORY ================= */

//    public List<WalletTransaction> historySecure(Long walletId, Long userId) {
//
//        Wallet wallet = walletRepo.findById(walletId)
//                .orElseThrow(() -> new WalletException("Wallet not found"));
//
//        if (!wallet.getUserId().equals(userId)) {
//            throw new WalletException("Access denied");
//        }
//
//        return txRepo.findByWalletId(walletId);
//    }


    public List<TransactionResponse> historySecure(Long walletId, Long userId) {

        validateOwnership(walletId, userId);

        List<WalletTransaction> list =
                txRepo.findByWalletId(walletId);

        return list.stream().map(tx -> {

            TransactionResponse res = new TransactionResponse();

            res.setId(tx.getTxId());                 // FIX ID
            res.setType(tx.getType().name());
            res.setAmount(tx.getAmount());
            res.setStatus("COMPLETED");              // FIX STATUS
            res.setDescription(tx.getReference());
            res.setTimestamp(tx.getCreatedAt());     // FIX DATE

            return res;

        }).toList();
    }





}
