package com.vishwaTechEdu;

import com.vishwaTechEdu.entity.User;
import com.vishwaTechEdu.entity.UserRole;
import com.vishwaTechEdu.entity.UserStatus;
import com.vishwaTechEdu.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class PayFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(PayFlowApplication.class, args);
    }

}
