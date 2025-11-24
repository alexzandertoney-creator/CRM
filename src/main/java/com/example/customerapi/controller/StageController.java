package com.example.customerapi.controller;

import com.example.customerapi.model.Stage;
import com.example.customerapi.repository.StageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/stages")
@CrossOrigin(origins = "*")
public class StageController {

    @Autowired
    private StageRepository stageRepository;

    // GET all stages
    @GetMapping
    public List<Stage> getAllStages() {
        return stageRepository.findAll();
    }

    // POST create stage
    @PostMapping
    public ResponseEntity<?> addStage(@RequestBody Stage stage) {
        Optional<Stage> existing = stageRepository.findByName(stage.getName());
        if (existing.isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body("Stage with that name already exists.");
        }
        Stage saved = stageRepository.save(stage);
        return ResponseEntity.ok(saved);
    }

    // DELETE a stage
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStage(@PathVariable Long id) {
        if (!stageRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        stageRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
