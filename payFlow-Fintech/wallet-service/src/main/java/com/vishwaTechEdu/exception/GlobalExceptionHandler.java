package com.vishwaTechEdu.exception;

import org.springframework.web.bind.annotation.*;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(WalletException.class)
    public ResponseEntity<String> handleWalletException(WalletException ex) {

        if ("Wallet not found".equalsIgnoreCase(ex.getMessage())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ex.getMessage());
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ex.getMessage());
    }
}


//    // Catch unexpected errors
//    @ExceptionHandler(Exception.class)
//    public ResponseEntity<Map<String, String>> handleGeneric(Exception e) {
//
//        return ResponseEntity
//                .status(HttpStatus.INTERNAL_SERVER_ERROR)
//                .body(Map.of("error", "Internal server error"));
//    }

