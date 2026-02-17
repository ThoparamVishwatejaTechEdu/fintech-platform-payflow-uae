package com.vishwaTechEdu.service;


import com.vishwaTechEdu.config.KycClient;
import com.vishwaTechEdu.entity.Kyc;
import com.vishwaTechEdu.entity.KycStatus;
import com.vishwaTechEdu.exception.KycException;
import com.vishwaTechEdu.repository.KycRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class KycService {

    @Autowired
    private KycRepository repo;

    @Autowired
    private KycClient kycClient; // or RestTemplate/WebClient




    public Kyc submit(Long userId, String type, String path) {

        if (repo.findByUserId(userId).isPresent()) {
            throw new KycException("KYC already submitted");
        }

        Kyc k = new Kyc();
        k.setUserId(userId);
        k.setDocumentType(type);
        k.setDocumentUrl(path);
        k.setStatus(KycStatus.PENDING);

        return repo.save(k);
    }



    public void approve(Long kycId) {

        Kyc k = repo.findById(kycId)
                .orElseThrow(() -> new KycException("KYC not found"));

        k.setStatus(KycStatus.APPROVED);
        repo.save(k);
    }


    public Kyc status(Long userId) {

        return repo.findByUserId(userId)
                .orElseThrow(() -> new KycException("No KYC found"));
    }

    public void reject(Long kycId) {

        Kyc k = repo.findById(kycId)
                .orElseThrow(() -> new KycException("KYC not found"));

        k.setStatus(KycStatus.REJECTED);

        repo.save(k);
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

