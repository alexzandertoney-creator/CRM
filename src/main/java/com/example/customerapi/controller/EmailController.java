package com.example.customerapi.controller;

import com.example.customerapi.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.customerapi.repository.ContactRepository;

import com.example.customerapi.model.Customer;
import com.example.customerapi.model.EmailTemplate;
import com.example.customerapi.model.SentEmail;
import com.example.customerapi.repository.CustomerRepository;
import com.example.customerapi.repository.EmailTemplateRepository;
import com.example.customerapi.repository.SentEmailRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*") // ✅ Consider restricting this in production
@Slf4j
public class EmailController {

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EmailTemplateRepository emailTemplateRepository;

    @Autowired
    private SentEmailRepository sentEmailRepository;

    /** ✅ Get all email templates */
    @GetMapping("/templates")
    public List<EmailTemplate> getTemplates() {
        return emailTemplateRepository.findAll();
    }

    /** ✅ Send email to one or more recipients for a specific customer */
    @PostMapping("/send/{customerId}")
    public String sendEmail(
            @PathVariable Long customerId,
            @Valid @RequestBody SendEmailRequest emailRequest
    ) {
        Optional<Customer> customerOpt = customerRepository.findById(customerId);
        if (customerOpt.isEmpty()) return "Customer not found";

        Customer customer = customerOpt.get();

        List<String> recipients = emailRequest.getRecipients();
        if (recipients == null || recipients.isEmpty()) return "No recipients provided";

        try {
            // 📨 Send one email to all recipients in the same message
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipients.toArray(new String[0]));
            message.setSubject(emailRequest.getSubject());
            message.setText(emailRequest.getBody());
            message.setFrom("your_email@example.com");
            //mailSender.send(message);

            // 💾 Save ONE SentEmail record (comma-separated recipients)
            String recipientList = recipients.stream()
                    .map(String::trim)
                    .collect(Collectors.joining(", "));

            SentEmail sent = new SentEmail();
            sent.setCustomerId(customerId);
            sent.setRecipients(recipientList);
            sent.setSubject(emailRequest.getSubject());
            sent.setBody(emailRequest.getBody());
            sent.setSentAt(LocalDateTime.now());
            sentEmailRepository.save(sent);

            return "Email sent successfully to: " + recipientList;

        } catch (MailException e) {
            log.error("Failed to send email: {}", e.getMessage());
            return "Failed to send email: " + e.getMessage();
        }
    }

    /** ✅ Get sent emails for a specific customer (latest first) */
    @GetMapping("/sent/{customerId}")
    public List<SentEmail> getSentEmails(@PathVariable Long customerId) {
        return sentEmailRepository.findByCustomerIdOrderBySentAtDesc(customerId);
    }

    /** ✅ Request body for sending email */
    public static class SendEmailRequest {

        @NotBlank(message = "Subject cannot be blank")
        private String subject;

        @NotBlank(message = "Body cannot be blank")
        private String body;

        private List<String> recipients;

        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }

        public String getBody() { return body; }
        public void setBody(String body) { this.body = body; }

        public List<String> getRecipients() { return recipients; }
        public void setRecipients(List<String> recipients) { this.recipients = recipients; }
    }


    // Delete a recipient (contact) permanently
    @DeleteMapping("/recipient/{id}")
    public ResponseEntity<?> deleteRecipient(@PathVariable Long id) {
        try {
            contactRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete recipient");
        }
    }
}

