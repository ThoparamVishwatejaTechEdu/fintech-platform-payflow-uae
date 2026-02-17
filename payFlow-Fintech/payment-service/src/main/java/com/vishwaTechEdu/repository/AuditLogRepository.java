package com.vishwaTechEdu.repository;

import com.vishwaTechEdu.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}

