package com.vishwaTechEdu.controller;

import com.vishwaTechEdu.dto.KycRequest;
import com.vishwaTechEdu.entity.Kyc;
import com.vishwaTechEdu.entity.KycStatus;
import com.vishwaTechEdu.repository.KycRepository;
import com.vishwaTechEdu.service.KycService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/v1/kyc")
public class KycController {

    @Autowired
    private KycService service;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    private KycRepository repo;


    // Submit KYC

    @PostMapping("/submit")
    public Kyc submit(@RequestHeader("userId") Long userId,
                      @RequestParam("file") MultipartFile file,
                      @RequestParam("documentType") String documentType) throws Exception {

        File dir = new File(uploadDir);

        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            System.out.println("UPLOAD DIR CREATED: " + created);
        }

        String filename =
                System.currentTimeMillis() +
                        "_" +
                        file.getOriginalFilename();

        File destination = new File(dir, filename);

        file.transferTo(destination);

        String publicUrl = "/api/v1/kyc/file/" + filename;

        return service.submit(userId, documentType, publicUrl);
    }


    // Approve KYC
    @PutMapping("/approve/{kycId}")
    public void approve(@PathVariable("kycId") Long kycId,
                        @RequestHeader("role") String role) {

        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Only ADMIN allowed");
        }

        service.approve(kycId);
    }


    // KYC Status
    @GetMapping("/status")
    public Kyc status(@RequestHeader("userId") Long userId) {
        return service.status(userId);
    }

    @GetMapping("/verify/{userId}")
    public boolean verify(@PathVariable("userId") Long userId) {

        Kyc k = service.status(userId);
        return k.getStatus() == KycStatus.APPROVED;
    }


    @GetMapping("/file/{filename}")
    public ResponseEntity<Resource> viewFile(@PathVariable String filename) throws IOException {

        Path path = Paths.get(uploadDir).resolve(filename);

        if (!Files.exists(path)) {
            throw new RuntimeException("File not found: " + filename);
        }

        Resource resource = new UrlResource(path.toUri());

        String contentType = Files.probeContentType(path);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }


    @PutMapping("/reject/{kycId}")
    public void reject(@PathVariable Long kycId,
                       @RequestHeader("role") String role) {

        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Only ADMIN allowed");
        }

        service.reject(kycId);
    }

    @GetMapping("/pending")
    public List<Kyc> pending() {
        return repo.findByStatus(KycStatus.PENDING);
    }




}

