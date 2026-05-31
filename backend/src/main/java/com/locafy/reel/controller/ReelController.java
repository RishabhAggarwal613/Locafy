package com.locafy.reel.controller;

import com.locafy.reel.dto.ReelDto;
import com.locafy.reel.service.ReelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/reels")
@RequiredArgsConstructor
public class ReelController {

    private final ReelService reelService;

    @GetMapping
    public ResponseEntity<ReelDto.FeedResponse> getFeed(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal String customerId) {
        return ResponseEntity.ok(reelService.getFeed(lat, lng, cursor, size, customerId));
    }

    @GetMapping("/saved")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReelDto.PageResponse> getSaved(
            @AuthenticationPrincipal String customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(reelService.listSavedReels(customerId, page, size));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ReelDto.PageResponse> getMine(
            @AuthenticationPrincipal String vendorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(reelService.listVendorReels(vendorId, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReelDto.ReelResponse> getReel(
            @PathVariable String id,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(reelService.getReel(id, userId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ReelDto.ReelResponse> createReel(
            @AuthenticationPrincipal String vendorId,
            @RequestPart("video") MultipartFile video,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String productId,
            @RequestParam(defaultValue = "true") boolean publish) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reelService.createReel(vendorId, video, title, description, productId, publish));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ReelDto.ReelResponse> updateReel(
            @AuthenticationPrincipal String vendorId,
            @PathVariable String id,
            @Valid @RequestBody ReelDto.UpdateReelRequest request) {
        return ResponseEntity.ok(reelService.updateReel(vendorId, id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, String>> deleteReel(
            @AuthenticationPrincipal String vendorId,
            @PathVariable String id) {
        reelService.deleteReel(vendorId, id);
        return ResponseEntity.ok(Map.of("message", "Reel deleted"));
    }

    @PostMapping("/{id}/like")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReelDto.ToggleResponse> toggleLike(
            @AuthenticationPrincipal String customerId,
            @PathVariable String id) {
        return ResponseEntity.ok(reelService.toggleLike(customerId, id));
    }

    @PostMapping("/{id}/save")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReelDto.ToggleResponse> toggleSave(
            @AuthenticationPrincipal String customerId,
            @PathVariable String id) {
        return ResponseEntity.ok(reelService.toggleSave(customerId, id));
    }

    @PostMapping("/cloudinary-notify")
    public ResponseEntity<Void> cloudinaryNotify(@RequestBody ReelDto.CloudinaryNotifyRequest dto) {
        if ("eager".equals(dto.getNotification_type())
                && "complete".equals(dto.getStatus())
                && dto.getEager() != null
                && !dto.getEager().isEmpty()) {
            String hlsUrl = dto.getEager().get(0).getSecure_url();
            reelService.markReadyFromWebhook(dto.getPublic_id(), hlsUrl, null);
        }
        return ResponseEntity.ok().build();
    }
}
