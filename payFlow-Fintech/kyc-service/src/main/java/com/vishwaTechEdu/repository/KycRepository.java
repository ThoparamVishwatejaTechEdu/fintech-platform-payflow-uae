package com.vishwaTechEdu.repository;

import com.vishwaTechEdu.entity.Kyc;
import com.vishwaTechEdu.entity.KycStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface KycRepository extends JpaRepository<Kyc, Long> {
    Optional<Kyc> findByUserId(Long userId);

    List<Kyc> findByStatus(KycStatus status);

}

