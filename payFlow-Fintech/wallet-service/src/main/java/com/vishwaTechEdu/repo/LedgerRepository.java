package com.vishwaTechEdu.repo;

import com.vishwaTechEdu.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LedgerRepository extends JpaRepository<LedgerEntry,Long> {
    List<LedgerEntry> findByWalletId(Long walletId);
}

