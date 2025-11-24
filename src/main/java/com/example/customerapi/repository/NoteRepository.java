package com.example.customerapi.repository;

import com.example.customerapi.model.Note;
import com.example.customerapi.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByCustomer(Customer customer);
    List<Note> findByCustomerAndArchivedTrueOrderByTimestampDesc(Customer customer);
    List<Note> findByCustomerAndArchivedFalseOrderByTimestampDesc(Customer customer);

}
