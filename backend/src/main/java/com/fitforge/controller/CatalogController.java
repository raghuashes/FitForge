package com.fitforge.controller;

import com.fitforge.dto.Dtos.*;
import com.fitforge.entity.Experience;
import com.fitforge.entity.Location;
import com.fitforge.service.CatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class CatalogController {
    private final CatalogService catalog;

    @GetMapping
    public List<CatalogRes> list(@RequestParam(value = "location", required = false) Location location,
                                 @RequestParam(value = "category", required = false) String category,
                                 @RequestParam(value = "level", required = false) Experience level) {
        return catalog.list(location, category, level);
    }

    @GetMapping("/{id}")
    public CatalogRes get(@PathVariable("id") Long id) { return catalog.get(id); }

    @PostMapping("/{id}/complete")
    public WorkoutRes complete(@AuthenticationPrincipal Long uid, @PathVariable("id") Long id,
                               @Valid @RequestBody CompleteReq r) {
        return catalog.complete(uid, id, r);
    }
}
