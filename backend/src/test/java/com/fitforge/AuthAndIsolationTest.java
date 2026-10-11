package com.fitforge;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthAndIsolationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    private String register(String email) throws Exception {
        String body = om.writeValueAsString(Map.of("name", "Tester", "email", email, "password", "secret123"));
        MvcResult r = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn();
        return om.readTree(r.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    void registerThenLoginWorks() throws Exception {
        String email = UUID.randomUUID() + "@test.com";
        register(email);
        String login = om.writeValueAsString(Map.of("email", email, "password", "secret123"));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(login))
                .andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty());
        String bad = om.writeValueAsString(Map.of("email", email, "password", "wrong-pass"));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(bad))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointsRequireToken() throws Exception {
        mvc.perform(get("/api/profile")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/health")).andExpect(status().isOk());
    }

    @Test
    void userCannotAccessAnotherUsersData() throws Exception {
        String a = register(UUID.randomUUID() + "@test.com");
        String b = register(UUID.randomUUID() + "@test.com");
        String meal = om.writeValueAsString(Map.of("date", "2030-01-15", "mealType", "LUNCH", "foodName", "Rice",
                "calories", 500, "protein", 10, "carbs", 80, "fat", 5));
        MvcResult r = mvc.perform(post("/api/meals").header("Authorization", "Bearer " + a)
                .contentType(MediaType.APPLICATION_JSON).content(meal)).andExpect(status().isOk()).andReturn();
        long id = om.readTree(r.getResponse().getContentAsString()).get("id").asLong();

        mvc.perform(get("/api/meals").param("date", "2030-01-15").header("Authorization", "Bearer " + b))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(delete("/api/meals/" + id).header("Authorization", "Bearer " + b))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/meals").param("date", "2030-01-15").header("Authorization", "Bearer " + a))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
    }
}
