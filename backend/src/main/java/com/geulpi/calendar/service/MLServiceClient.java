package com.geulpi.calendar.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.List;

@Service
public class MLServiceClient {
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public MLServiceClient(@Value("${ml.server.url:http://ml-server:8000}") String mlServerUrl) {
        this.webClient = WebClient.builder()
            .baseUrl(mlServerUrl)
            .build();
        this.objectMapper = new ObjectMapper();
    }
    
    public Mono<ParsedEvent> parseNaturalLanguageEvent(String text, String userId) {
        Map<String, Object> request = Map.of(
            "text", text,
            "user_id", userId
        );
        
        return webClient.post()
            .uri("/ai/parse-event")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(JsonNode.class)
            .map(response -> {
                JsonNode suggestions = response.get("suggestions");
                if (suggestions != null && suggestions.isArray() && suggestions.size() > 0) {
                    JsonNode firstSuggestion = suggestions.get(0);
                    return new ParsedEvent(
                        firstSuggestion.get("title").asText(),
                        firstSuggestion.get("description").asText(""),
                        firstSuggestion.get("start_time").asText(),
                        firstSuggestion.get("end_time").asText(),
                        firstSuggestion.get("location").asText("")
                    );
                }
                throw new RuntimeException("No suggestions found");
            });
    }
    
    public Mono<JsonNode> optimizeSchedule(List<Map<String, Object>> events, Map<String, Object> preferences) {
        Map<String, Object> request = Map.of(
            "events", events,
            "preferences", preferences != null ? preferences : Map.of()
        );
        
        return webClient.post()
            .uri("/ai/optimize-schedule")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(JsonNode.class);
    }
    
    public Mono<String> generateMeetingSummary(Map<String, Object> meetingDetails) {
        return webClient.post()
            .uri("/ai/generate-summary")
            .bodyValue(meetingDetails)
            .retrieve()
            .bodyToMono(JsonNode.class)
            .map(response -> response.get("data").get("summary").asText());
    }
    
    public Mono<Boolean> checkMLServiceHealth() {
        return webClient.get()
            .uri("/ai/test")
            .retrieve()
            .bodyToMono(JsonNode.class)
            .map(response -> response.get("openai_configured").asBoolean(false))
            .onErrorReturn(false);
    }
    
    public static record ParsedEvent(
        String title,
        String description,
        String startTime,
        String endTime,
        String location
    ) {}
}