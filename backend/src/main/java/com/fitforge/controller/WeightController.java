package com.fitforge.controller;

import com.fitforge.dto.Dtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/weights")
@RequiredArgsConstructor
public class WeightController {
    private final com.fitforge.repository.WeightRepository repo;

    private WeightRes res(com.fitforge.entity.WeightEntry w) { return new WeightRes(w.getId(), w.getEntryDate(), w.getKg(), w.getBodyFat()); }

    @GetMapping
    public List<WeightRes> list(@AuthenticationPrincipal Long uid) {
        return repo.findByUserIdOrderByEntryDateAscIdAsc(uid).stream().map(this::res).toList();
    }

    @PostMapping
    public WeightRes add(@AuthenticationPrincipal Long uid, @Valid @RequestBody WeightReq r) {
        var w = new com.fitforge.entity.WeightEntry();
        w.setUserId(uid);
        w.setEntryDate(r.date());
        w.setKg(r.kg());
        w.setBodyFat(r.bodyFat());
        return res(repo.save(w));
    }

    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal Long uid, @PathVariable("id") Long id) {
        repo.delete(repo.findByIdAndUserId(id, uid).orElseThrow(() ->
                new com.fitforge.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "Entry not found")));
    }
}
