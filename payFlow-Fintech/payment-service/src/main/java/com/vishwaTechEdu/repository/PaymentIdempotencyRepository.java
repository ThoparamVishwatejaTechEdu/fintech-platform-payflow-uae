package com.vishwaTechEdu.repository;
import com.vishwaTechEdu.entity.PaymentIdempotency;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentIdempotencyRepository
        extends JpaRepository<PaymentIdempotency, Long> {

    Optional<PaymentIdempotency> findByIdempotencyKey(String key);
}

