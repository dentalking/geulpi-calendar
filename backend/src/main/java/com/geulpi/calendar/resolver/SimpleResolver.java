package com.geulpi.calendar.resolver;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Controller
public class SimpleResolver {
    
    private final List<Calendar> calendars = new ArrayList<>();
    private final User currentUser = new User("1", "test@geulpi.com", "Test User");
    
    @QueryMapping
    public String health() {
        return "UP";
    }
    
    @QueryMapping
    public User me() {
        return currentUser;
    }
    
    @QueryMapping
    public List<Calendar> calendars() {
        return calendars;
    }
    
    @MutationMapping
    public Calendar createCalendar(@Argument CreateCalendarInput input) {
        Calendar calendar = new Calendar(
            String.valueOf(calendars.size() + 1),
            input.getName(),
            input.getDescription(),
            currentUser,
            OffsetDateTime.now(ZoneOffset.UTC)
        );
        calendars.add(calendar);
        return calendar;
    }
    
    public static class User {
        private final String id;
        private final String email;
        private final String name;
        
        public User(String id, String email, String name) {
            this.id = id;
            this.email = email;
            this.name = name;
        }
        
        public String getId() { return id; }
        public String getEmail() { return email; }
        public String getName() { return name; }
    }
    
    public static class Calendar {
        private final String id;
        private final String name;
        private final String description;
        private final User owner;
        private final OffsetDateTime createdAt;
        
        public Calendar(String id, String name, String description, User owner, OffsetDateTime createdAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.owner = owner;
            this.createdAt = createdAt;
        }
        
        public String getId() { return id; }
        public String getName() { return name; }
        public String getDescription() { return description; }
        public User getOwner() { return owner; }
        public OffsetDateTime getCreatedAt() { return createdAt; }
    }
    
    public static class CreateCalendarInput {
        private String name;
        private String description;
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}