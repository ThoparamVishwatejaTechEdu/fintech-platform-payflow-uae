package com.vishwaTechEdu.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

//    @Bean
//    public WebClient walletWebClient() {
//        return WebClient.builder()
//                .baseUrl("http://localhost:8082")
//                .build();
//    }
//
//
//
//    @Bean
//    public WebClient kycWebClient() {
//        return WebClient.builder()
//                .baseUrl("http://localhost:8084")
//                .build();
//    }


    @Bean
    public WebClient walletWebClient(
            @Value("${wallet.service.url:http://localhost:8082}") String baseUrl) {

        return WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }


    @Bean
    public WebClient kycWebClient(
            @Value("${kyc.service.url:http://localhost:8084}") String baseUrl) {

        return WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }


}

