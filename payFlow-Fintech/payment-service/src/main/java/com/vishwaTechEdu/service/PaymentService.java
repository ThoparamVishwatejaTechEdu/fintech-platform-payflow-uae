package com.vishwaTechEdu.service;

import com.vishwaTechEdu.client.WalletClient;
import com.vishwaTechEdu.config.KycClient;
import com.vishwaTechEdu.dto.MerchantPaymentRequest;
import com.vishwaTechEdu.dto.PaymentRequest;
import com.vishwaTechEdu.entity.*;
import com.vishwaTechEdu.exception.PaymentException;
import com.vishwaTechEdu.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class PaymentService {

    @Autowired
    private KycClient kycClient; // or RestTemplate/WebClient


    private final WalletClient walletClient;
    private final PaymentRepository paymentRepo;
    private final KafkaTemplate<String, String> kafka;
    private final PaymentIdempotencyService idemService;

    public PaymentService(WalletClient walletClient,
                          PaymentRepository paymentRepo,
                          KafkaTemplate<String, String> kafka,
                          PaymentIdempotencyService idemService) {
        this.walletClient = walletClient;
        this.paymentRepo = paymentRepo;
        this.kafka = kafka;
        this.idemService = idemService;
    }

    /* =========================================================
                       P2P PAYMENT
    ========================================================= */

    @Transactional
    public String p2pPayment(Long userId,
                             PaymentRequest req,
                             String idempotencyKey) {

        // ⭐ BLOCK PAYMENT IF KYC NOT APPROVED
        verifyKyc(userId);

        String requestHash = buildRequestHash(req);

        PaymentIdempotency existing =
                idemService.findByKey(idempotencyKey);

        if (existing != null) {

            if (!existing.getRequestHash().equals(requestHash)) {
                throw new PaymentException(
                        "Idempotency key reused with different request");
            }

            if (existing.getStatus() == PaymentStatus.SUCCESS) {
                return "Duplicate request ignored";
            }

            if (existing.getStatus() == PaymentStatus.PROCESSING) {
                throw new PaymentException("Payment already in progress");
            }
        }

        PaymentIdempotency idem =
                idemService.create(idempotencyKey, requestHash);

        try {

            // ⭐ STEP 1 — CREATE PROCESSING RECORD
            Payment payment = savePaymentRecord(
                    req.getSenderWalletId(),
                    req.getReceiverWalletId(),
                    req.getAmount(),
                    PaymentType.P2P
            );

            // ⭐ STEP 2 — TRANSFER MONEY
            walletClient.transfer(
                    req.getSenderWalletId(),
                    req.getReceiverWalletId(),
                    req.getAmount(),
                    userId
            );

            // ⭐ STEP 3 — MARK SUCCESS
            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepo.save(payment);

            idemService.updateStatus(
                    idem.getId(),
                    PaymentStatus.SUCCESS
            );

            kafka.send("payment-events", "P2P_PAYMENT");

            return "Payment successful";

        } catch (Exception ex) {

            idemService.updateStatus(
                    idem.getId(),
                    PaymentStatus.FAILED
            );

            throw ex;
        }
    }

    /* =========================================================
                       MERCHANT PAYMENT
    ========================================================= */

    @Transactional
    public String merchantPayment(Long userId,
                                  String role,
                                  MerchantPaymentRequest req,
                                  String idempotencyKey) {

        // ⭐ BLOCK PAYMENT IF KYC NOT APPROVED
        verifyKyc(userId);

        if (!"USER".equals(role)) {
            throw new PaymentException(
                    "Only USER can initiate merchant payment");
        }

        String requestHash =
                req.getUserWalletId() + ":" +
                        req.getMerchantWalletId() + ":" +
                        req.getAmount();

        PaymentIdempotency existing =
                idemService.findByKey(idempotencyKey);

        if (existing != null) {

            if (!existing.getRequestHash().equals(requestHash)) {
                throw new PaymentException(
                        "Idempotency key reused with different request");
            }

            if (existing.getStatus() == PaymentStatus.SUCCESS) {
                return "Duplicate request ignored";
            }

            if (existing.getStatus() == PaymentStatus.PROCESSING) {
                throw new PaymentException("Payment already in progress");
            }
        }

        PaymentIdempotency idem =
                idemService.create(idempotencyKey, requestHash);

        try {

            // ⭐ CREATE PROCESSING PAYMENT
            Payment payment = savePaymentRecord(
                    req.getUserWalletId(),
                    req.getMerchantWalletId(),
                    req.getAmount(),
                    PaymentType.MERCHANT
            );

            walletClient.validateOwnership(
                    req.getUserWalletId(),
                    userId
            );

            walletClient.transfer(
                    req.getUserWalletId(),
                    req.getMerchantWalletId(),
                    req.getAmount(),
                    userId
            );

            // ⭐ MARK SUCCESS
            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepo.save(payment);

            idemService.updateStatus(
                    idem.getId(),
                    PaymentStatus.SUCCESS
            );

            kafka.send("payment-events", "MERCHANT_PAYMENT");

            return "Merchant payment successful";

        } catch (Exception ex) {

            idemService.updateStatus(
                    idem.getId(),
                    PaymentStatus.FAILED
            );

            throw ex;
        }
    }

    /* =========================================================
                       SETTLEMENT
    ========================================================= */

    public BigDecimal merchantSettlement(String role, Long walletId) {

        if (!"ADMIN".equals(role)) {
            throw new PaymentException("Only ADMIN can view settlement");
        }

        return paymentRepo.merchantTotal(
                walletId,
                PaymentType.MERCHANT,
                PaymentStatus.SUCCESS
        );
    }

    /* =========================================================
                       HELPERS
    ========================================================= */

    private String buildRequestHash(PaymentRequest req) {
        return req.getSenderWalletId() + ":" +
                req.getReceiverWalletId() + ":" +
                req.getAmount();
    }

    // ⭐ RETURN PAYMENT NOW
    private Payment savePaymentRecord(Long sender,
                                      Long receiver,
                                      BigDecimal amount,
                                      PaymentType type) {

        Payment payment = new Payment();
        payment.setSenderWalletId(sender);
        payment.setReceiverWalletId(receiver);
        payment.setAmount(amount);
        payment.setType(type);

        // IMPORTANT
        payment.setStatus(PaymentStatus.PROCESSING);

        return paymentRepo.save(payment);
    }


    private void verifyKyc(Long userId) {

        boolean verified = kycClient.verify(userId);

        if (!verified) {
            throw new RuntimeException(
                    "KYC not approved. Payment not allowed."
            );
        }
    }

}
