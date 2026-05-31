package com.locafy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LocafyApplication {
    public static void main(String[] args) {
        SpringApplication.run(LocafyApplication.class, args);
    }
}
