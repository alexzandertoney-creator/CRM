package com.example.customerapi.repository;

import com.example.customerapi.model.SentEmail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.example.customerapi.model.SentEmail;
import com.example.customerapi.repository.SentEmailRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

public interface SentEmailRepository extends JpaRepository<SentEmail, Long> {
    List<SentEmail> findByCustomerIdOrderBySentAtDesc(Long customerId);
}
