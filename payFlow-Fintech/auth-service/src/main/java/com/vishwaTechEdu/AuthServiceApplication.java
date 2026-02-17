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
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

    // 🔥 ADMIN AUTO CREATE
    @Bean
    CommandLineRunner init(UserRepository repo,
                           BCryptPasswordEncoder encoder) {

        return args -> {

            if (repo.findByEmail("admin@payflow.com").isEmpty()) {

                User admin = new User();
                admin.setEmail("admin@payflow.com");
                admin.setPassword(
                        encoder.encode("Admin@123")
                );
                admin.setRole(UserRole.ADMIN);
                admin.setStatus(UserStatus.ACTIVE);

                repo.save(admin);

                System.out.println("ADMIN CREATED");
            }
        };
    }
}
