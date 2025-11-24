package com.example.customerapi.controller;

import com.example.customerapi.model.Customer;
import com.example.customerapi.model.Stage;
import com.example.customerapi.repository.CustomerRepository;
import com.example.customerapi.repository.StageRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final StageRepository stageRepository;

    public CustomerController(CustomerRepository customerRepository, StageRepository stageRepository) {
        this.customerRepository = customerRepository;
        this.stageRepository = stageRepository;
    }

    // GET all customers with pagination and sorting
    @GetMapping("/paged")
    public Page<Customer> getCustomersPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String order) {

        Sort sort = "asc".equalsIgnoreCase(order) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return customerRepository.findAll(pageable);
    }
    @GetMapping("/filter")
public List<Customer> filterByStage(@RequestParam(required = false) Long stageId) {
    if (stageId != null) {
        return customerRepository.findByStage_Id(stageId);
    } else {
        return customerRepository.findAll();
    }
}
    // GET all customers
    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // GET customer by ID
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        return customerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST new customer
@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<Customer> createCustomer(@Valid @RequestBody Customer customer) {
    if (customer.getStage() != null && customer.getStage().getId() != null) {
        Stage stage = stageRepository.findById(customer.getStage().getId()).orElse(null);
        customer.setStage(stage);
    }
    Customer savedCustomer = customerRepository.save(customer);
    return ResponseEntity.ok(savedCustomer);
}

// PUT update customer
@PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<Customer> updateCustomer(
        @PathVariable Long id, @RequestBody Customer updated) {

    return customerRepository.findById(id).map(customer -> {
        customer.setMainContact(updated.getMainContact());
        customer.setCompanyName(updated.getCompanyName());
        customer.setEmail(updated.getEmail());
        customer.setPhoneNumber(updated.getPhoneNumber());
        customer.setNextStep(updated.getNextStep());
        customer.setNextActionDate(updated.getNextActionDate());
        customer.setComments(updated.getComments());
        customer.setStage(updated.getStage());

        Customer saved = customerRepository.save(customer);
        return ResponseEntity.ok(saved);
    }).orElseGet(() -> ResponseEntity.notFound().build());
}


    // DELETE customer
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        if (customerRepository.existsById(id)) {
            customerRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    

}

