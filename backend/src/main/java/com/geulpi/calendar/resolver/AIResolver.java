package com.geulpi.calendar.resolver;

import com.geulpi.calendar.service.MLServiceClient;
import com.geulpi.calendar.service.MLServiceClient.ParsedEvent;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Mono;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Controller
public class AIResolver {
    
    private final MLServiceClient mlServiceClient;
    private final ObjectMapper objectMapper;
    
    public AIResolver(MLServiceClient mlServiceClient) {
        this.mlServiceClient = mlServiceClient;
        this.objectMapper = new ObjectMapper();
    }
    
    @MutationMapping
    public Mono<ParsedEvent> parseNaturalLanguageEvent(@Argument String text) {
        // For now, using a default user ID. In production, get from security context
        String userId = "default-user";
        return mlServiceClient.parseNaturalLanguageEvent(text, userId)
            .onErrorReturn(new ParsedEvent(
                "Sample Event",
                "ML Service is not available. This is a mock response.",
                "2025-08-01T14:00:00Z",
                "2025-08-01T15:00:00Z",
                "Conference Room"
            ));
    }
    
    @MutationMapping
    public Mono<ScheduleOptimization> optimizeSchedule(
            @Argument List<EventInput> events,
            @Argument PreferencesInput preferences) {
        
        // Convert input objects to maps for ML service
        List<Map<String, Object>> eventMaps = new ArrayList<>();
        for (EventInput event : events) {
            Map<String, Object> eventMap = new HashMap<>();
            eventMap.put("id", event.id());
            eventMap.put("title", event.title());
            eventMap.put("start_time", event.startTime());
            eventMap.put("end_time", event.endTime());
            eventMap.put("location", event.location());
            eventMaps.add(eventMap);
        }
        
        Map<String, Object> prefsMap = new HashMap<>();
        if (preferences != null) {
            if (preferences.workingHours() != null) {
                prefsMap.put("working_hours", Map.of(
                    "start", preferences.workingHours().start(),
                    "end", preferences.workingHours().end()
                ));
            }
            if (preferences.preferredMeetingDuration() != null) {
                prefsMap.put("preferred_meeting_duration", preferences.preferredMeetingDuration());
            }
        }
        
        return mlServiceClient.optimizeSchedule(eventMaps, prefsMap)
            .map(response -> {
                boolean success = response.get("success").asBoolean(false);
                String message = response.get("message").asText("");
                
                List<OptimizedEvent> optimizedEvents = new ArrayList<>();
                JsonNode data = response.get("data");
                if (data != null && data.has("optimized_schedule")) {
                    JsonNode schedule = data.get("optimized_schedule");
                    if (schedule.isArray()) {
                        schedule.forEach(event -> {
                            optimizedEvents.add(new OptimizedEvent(
                                event.has("original_id") ? event.get("original_id").asText() : null,
                                event.get("title").asText(),
                                event.get("start_time").asText(),
                                event.get("end_time").asText(),
                                event.has("suggestion") ? event.get("suggestion").asText() : null
                            ));
                        });
                    }
                }
                
                return new ScheduleOptimization(success, message, optimizedEvents);
            });
    }
    
    // Record classes for GraphQL types
    public record EventInput(
        String id,
        String title,
        String startTime,
        String endTime,
        String location
    ) {}
    
    public record PreferencesInput(
        WorkingHoursInput workingHours,
        Integer preferredMeetingDuration
    ) {}
    
    public record WorkingHoursInput(
        String start,
        String end
    ) {}
    
    public record ScheduleOptimization(
        boolean success,
        String message,
        List<OptimizedEvent> optimizedEvents
    ) {}
    
    public record OptimizedEvent(
        String originalId,
        String title,
        String startTime,
        String endTime,
        String suggestion
    ) {}
}