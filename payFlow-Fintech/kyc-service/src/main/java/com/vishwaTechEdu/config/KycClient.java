    package com.vishwaTechEdu.config;

    import org.springframework.stereotype.Component;
    import org.springframework.web.client.RestTemplate;

    @Component
    public class KycClient {

        private final RestTemplate restTemplate = new RestTemplate();

        public boolean verify(Long userId) {

            String url =
                    "http://localhost:8080/api/v1/kyc/verify/" + userId;

            return restTemplate.getForObject(url, Boolean.class);
        }
    }
