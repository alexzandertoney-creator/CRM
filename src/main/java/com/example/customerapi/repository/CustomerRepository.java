package com.example.customerapi.repository;

import com.example.customerapi.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByMainContactContainingIgnoreCase(String mainContact);
        List<Customer> findByCompanyNameStartingWithIgnoreCaseAndMainContactEndingWithIgnoreCase(String companyPrefix, String contactEnding);
    List<Customer> findByEmailContainingIgnoreCase(String email);
    List<Customer> findByEmailEndingWith(String domain);
    List<Customer> findByMainContactStartingWith(String prefix);
    List<Customer> findByMainContactStartingWithIgnoreCaseAndEmailEndingWithIgnoreCase(String mainContactPrefix, String emailDomain);
    List<Customer> findByMainContactStartingWithIgnoreCase(String mainContactPrefix);
    List<Customer> findByEmailEndingWithIgnoreCase(String emailDomain);
    List<Customer> findByStage_Id(Long stageId);
}

