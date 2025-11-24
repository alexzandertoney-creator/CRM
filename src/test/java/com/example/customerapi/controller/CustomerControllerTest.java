package com.example.customerapi.controller;

import com.example.customerapi.model.Customer;
import com.example.customerapi.repository.CustomerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerRepository repository;

    // Mock JavaMailSender so tests don’t need a real SMTP server
    @MockBean
    private JavaMailSender javaMailSender;

    @Test
    void shouldReturn200WhenGettingCustomers() throws Exception {
        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk());
    }


    @Test
    void shouldDeleteCustomer() throws Exception {
        Customer c = new Customer();
        c.setMainContact("Temp Delete");
        c.setCompanyName("Delete Co");
        c.setEmail("temp@delete.com");
        c.setPhoneNumber("0987654321");
        Customer saved = repository.save(c);

        mockMvc.perform(delete("/api/customers/" + saved.getId()))
                .andExpect(status().isNoContent());
    }


    @Test
    void shouldReturnNotFoundWhenUpdatingNonExistentCustomer() throws Exception {
        String updatedCustomerJson = """
                {
                    "mainContact": "Ghost User",
                    "companyName": "Ghost Co",
                    "email": "ghost@example.com",
                    "phoneNumber": "0000000000",
                    "contacts": [],
                    "notes": []
                }
                """;

        mockMvc.perform(put("/api/customers/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedCustomerJson))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnNotFoundWhenDeletingNonExistentCustomer() throws Exception {
        mockMvc.perform(delete("/api/customers/999"))
                .andExpect(status().isNotFound());
    }
}
