package com.example.customerapi.controller;

import com.example.customerapi.model.Contact;
import com.example.customerapi.model.Customer;
import com.example.customerapi.repository.ContactRepository;
import com.example.customerapi.repository.CustomerRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:8080") // adjust if needed
public class ContactController {

    private final ContactRepository contactRepository;
    private final CustomerRepository customerRepository;

    public ContactController(ContactRepository contactRepository, CustomerRepository customerRepository) {
        this.contactRepository = contactRepository;
        this.customerRepository = customerRepository;
    }

    @GetMapping("/{customerId}/contacts")
    public List<Contact> getContactsByCustomer(@PathVariable Long customerId) {
        return contactRepository.findByCustomerId(customerId);
    }

    @PostMapping("/{customerId}/contacts")
public Contact addContact(
        @PathVariable Long customerId,
        @RequestBody Contact contact
) {
    Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new RuntimeException("Customer not found"));

    contact.setCustomer(customer);
    return contactRepository.save(contact);
}

    @PutMapping("/{customerId}/contacts/{id}")
public Contact updateContact(
    @PathVariable Long customerId, 
    @PathVariable Long id, 
    @RequestBody Contact updated
) {
    // Optional: check if contact actually belongs to customer
    Contact contact = contactRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Contact not found"));

    // Optional: verify customerId matches
    if (!contact.getCustomer().getId().equals(customerId)) {
        throw new RuntimeException("Contact does not belong to this customer");
    }

    contact.setName(updated.getName());
    contact.setEmail(updated.getEmail());
    contact.setPhone(updated.getPhone());
    contact.setPosition(updated.getPosition());

    return contactRepository.save(contact);
}

    @DeleteMapping("/{customerId}/contacts/{id}")
public void deleteContact(@PathVariable Long customerId, @PathVariable Long id) {
    Contact contact = contactRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Contact not found"));

    // Optional: verify the contact belongs to this customer
    if (!contact.getCustomer().getId().equals(customerId)) {
        throw new RuntimeException("Contact does not belong to this customer");
    }

    contactRepository.delete(contact);
}

}
