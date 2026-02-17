package com.vishwaTechEdu.service;

import com.vishwaTechEdu.entity.PaymentIdempotency;
import com.vishwaTechEdu.entity.PaymentStatus;
import com.vishwaTechEdu.repository.PaymentIdempotencyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PaymentIdempotencyService {

    private final PaymentIdempotencyRepository repo;

    public PaymentIdempotencyService(PaymentIdempotencyRepository repo) {
        this.repo = repo;
    }

    // 🔍 Find existing key
    public PaymentIdempotency findByKey(String key) {
        return repo.findByIdempotencyKey(key).orElse(null);
    }

    // 🆕 Create new record
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public PaymentIdempotency create(String key, String requestHash) {

        PaymentIdempotency idem = new PaymentIdempotency();
        idem.setIdempotencyKey(key);
        idem.setRequestHash(requestHash);
        idem.setStatus(PaymentStatus.PROCESSING);
        idem.setCreatedAt(LocalDateTime.now());

        return repo.save(idem);
    }

    // 🔄 Update status
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateStatus(Long id, PaymentStatus status) {

        PaymentIdempotency idem = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Idempotency record not found"));

        idem.setStatus(status);
        repo.save(idem);
    }

    // 🧠 Optional: expire stuck records (30 sec safety)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markFailedIfExpired(PaymentIdempotency idem) {

        if (idem.getStatus() == PaymentStatus.PROCESSING &&
                idem.getCreatedAt()
                        .isBefore(LocalDateTime.now().minusSeconds(30))) {

            idem.setStatus(PaymentStatus.FAILED);
            repo.save(idem);
        }
    }
}
