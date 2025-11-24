package com.example.customerapi.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerDocumentController {

    private static final String UPLOAD_DIR = "uploads";

    @PostMapping("/{id}/documents")
    public ResponseEntity<String> uploadDocument(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            Path customerDir = Paths.get(UPLOAD_DIR, String.valueOf(id));
            if (!Files.exists(customerDir)) {
                Files.createDirectories(customerDir);
            }

            Path filePath = customerDir.resolve(file.getOriginalFilename());
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return ResponseEntity.ok("File uploaded successfully!");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("File upload failed.");
        }
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<Map<String, Object>>> listDocuments(@PathVariable Long id) {
        Path customerDir = Paths.get(UPLOAD_DIR, String.valueOf(id));
        if (!Files.exists(customerDir)) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        try {
            List<Map<String, Object>> files = Files.list(customerDir)
                    .filter(Files::isRegularFile)
                    .map(path -> {
                        Map<String, Object> fileData = new HashMap<>();
                        fileData.put("id", path.getFileName().toString());
                        fileData.put("name", path.getFileName().toString());
                        return fileData;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(files);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/documents/{filename}/download")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable Long id,
            @PathVariable String filename) {
        Path filePath = Paths.get(UPLOAD_DIR, String.valueOf(id), filename);

        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        try {
            byte[] fileBytes = Files.readAllBytes(filePath);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

            return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    // DELETE a document
@DeleteMapping("/{id}/documents/{filename}")
public ResponseEntity<String> deleteDocument(
        @PathVariable Long id,
        @PathVariable String filename) {
    Path filePath = Paths.get(UPLOAD_DIR, String.valueOf(id), filename);

    try {
        if (Files.exists(filePath)) {
            Files.delete(filePath);
            return ResponseEntity.ok("File deleted successfully.");
        } else {
            return ResponseEntity.notFound().build();
        }
    } catch (IOException e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting file.");
    }
}

// PUT rename a document
@PutMapping("/{id}/documents/{filename}/rename")
public ResponseEntity<String> renameDocument(
        @PathVariable Long id,
        @PathVariable String filename,
        @RequestParam String newName) {

    Path oldPath = Paths.get(UPLOAD_DIR, String.valueOf(id), filename);
    Path newPath = Paths.get(UPLOAD_DIR, String.valueOf(id), newName);

    try {
        if (!Files.exists(oldPath)) {
            return ResponseEntity.notFound().build();
        }
        Files.move(oldPath, newPath, StandardCopyOption.REPLACE_EXISTING);
        return ResponseEntity.ok("File renamed successfully.");
    } catch (IOException e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error renaming file.");
    }
}
}
