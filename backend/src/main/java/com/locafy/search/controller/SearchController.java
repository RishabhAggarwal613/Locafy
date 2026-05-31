package com.locafy.search.controller;

import com.locafy.search.dto.SearchDto;
import com.locafy.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<SearchDto.SearchResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "ALL") SearchDto.SearchType type,
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5") double radius,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Boolean openNow,
            @RequestParam(required = false) Boolean delivery,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(searchService.search(
                q, type, lat, lng, radius, category, minPrice, maxPrice,
                minRating, openNow, delivery, page, size));
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<List<SearchDto.AutocompleteItem>> autocomplete(
            @RequestParam String q,
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5") double radius) {
        return ResponseEntity.ok(searchService.autocomplete(q, lat, lng, radius));
    }
}
