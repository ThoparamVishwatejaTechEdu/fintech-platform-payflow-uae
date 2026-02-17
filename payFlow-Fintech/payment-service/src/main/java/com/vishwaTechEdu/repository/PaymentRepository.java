package com.vishwaTechEdu.repository;

import com.vishwaTechEdu.entity.Payment;
import com.vishwaTechEdu.entity.PaymentStatus;
import com.vishwaTechEdu.entity.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("""
        select coalesce(sum(p.amount), 0)
        from Payment p
        where p.receiverWalletId = :walletId
          and p.type = :type
          and p.status = :status
    """)
    BigDecimal merchantTotal(
            @Param("walletId") Long walletId,
            @Param("type") PaymentType type,
            @Param("status") PaymentStatus status
    );
}
