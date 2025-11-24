package com.example.customerapi;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;

@SpringBootTest
class CustomerapiApplicationTests {

    // Mock JavaMailSender so Spring can start the context
    @MockBean
    private JavaMailSender javaMailSender;

    @Test
    void contextLoads() {
        // Smoke test to ensure the application context starts
    }

}
