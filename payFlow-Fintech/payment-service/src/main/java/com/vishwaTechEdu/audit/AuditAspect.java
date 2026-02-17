package com.vishwaTechEdu.audit;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.vishwaTechEdu.entity.AuditLog;
import com.vishwaTechEdu.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditAspect {

    @Autowired
    private AuditLogRepository repo;

    @Autowired
    private HttpServletRequest request;

    private final ObjectMapper mapper = new ObjectMapper();

    @Around("@annotation(audit)")
    public Object audit(ProceedingJoinPoint joinPoint, Auditable audit) throws Throwable {

        Object result = joinPoint.proceed();

        AuditLog log = new AuditLog();

        String userId = request.getHeader("userId");

        log.setUserId(Long.valueOf(userId));
        log.setService("payment-service");
        log.setAction(audit.action());
        log.setEntity(audit.entity());
        log.setPayload(mapper.writeValueAsString(joinPoint.getArgs()));

        repo.save(log);

        return result;
    }
}

