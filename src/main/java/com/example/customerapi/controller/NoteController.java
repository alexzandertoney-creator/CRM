package com.example.customerapi.controller;


import com.example.customerapi.model.Note;
import com.example.customerapi.model.Customer;
import com.example.customerapi.repository.NoteRepository;
import com.example.customerapi.repository.CustomerRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:8080") // change to your frontend URL
@RestController
@RequestMapping("/api")
public class NoteController {

    private final NoteRepository noteRepository;
    private final CustomerRepository customerRepository;

    public NoteController(NoteRepository noteRepository, CustomerRepository customerRepository) {
        this.noteRepository = noteRepository;
        this.customerRepository = customerRepository;
    }

    // ---------------- Get Notes for a Customer ----------------
    @GetMapping("/customers/{customerId}/notes")
    public List<Note> getActiveNotesByCustomer(@PathVariable Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return noteRepository.findByCustomerAndArchivedFalseOrderByTimestampDesc(customer);
    }

    // ---------------- Add Note ----------------
    @PostMapping("/customers/{customerId}/notes")
public Note addNote(@PathVariable Long customerId, @RequestBody Map<String, String> payload) {
    Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new RuntimeException("Customer not found"));

    String text = payload.get("text");
    if (text == null || text.trim().isEmpty()) {
        throw new IllegalArgumentException("Note text cannot be empty");
    }

    Note note = new Note(text.trim(), customer);
    return noteRepository.save(note);
}

    // ---------------- Note Operations ----------------
    @DeleteMapping("/notes/{noteId}")
    public Map<String, String> deleteNote(@PathVariable Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        noteRepository.delete(note);
        return Map.of("status", "success", "message", "Note deleted");
    }

    @PatchMapping("/notes/{noteId}")
    public Note updateNoteText(@PathVariable Long noteId, @RequestBody Map<String, String> payload) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        note.setText(payload.get("text"));
        return noteRepository.save(note);
    }

    @PatchMapping("/notes/{noteId}/archive")
    public Note archiveNote(@PathVariable Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        note.setArchived(true);
        return noteRepository.save(note);
    }

    @PatchMapping("/notes/{noteId}/unarchive")
    public Note unarchiveNote(@PathVariable Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        note.setArchived(false);
        return noteRepository.save(note);
    }

}
