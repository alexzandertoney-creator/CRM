package com.example.customerapi.controller;

import com.example.customerapi.model.EmailTemplate;
import com.example.customerapi.repository.EmailTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*") // allow frontend requests
@RestController
@RequestMapping("/api/email-templates")
public class EmailTemplateController {

    @Autowired
    private EmailTemplateRepository repo;

    @GetMapping
    public List<EmailTemplate> getAllTemplates() {
        return repo.findAll();
    }
        @PutMapping("/{id}")
    public EmailTemplate update(@PathVariable Long id, @RequestBody EmailTemplate updated) {
        updated.setId(id);
        return repo.save(updated);
    }
    @PostMapping
    public EmailTemplate createTemplate(@RequestBody EmailTemplate template) {
        return repo.save(template);
    }

    @DeleteMapping("/{id}")
    public void deleteTemplate(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
