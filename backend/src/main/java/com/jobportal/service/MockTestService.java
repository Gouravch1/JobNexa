package com.jobportal.service;

import com.jobportal.dto.MockTestInfoResponse;
import com.jobportal.dto.MockTestStartResponse;
import com.jobportal.dto.MockTestTrackResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class MockTestService {

    private static final int QUESTION_POOL_SIZE = 200;
    private static final int RANDOM_TEST_QUESTION_COUNT = 5;

    private final Map<String, MockTestTrackResponse> tracks = new LinkedHashMap<>();
    private final Map<String, MockTestDefinition> tests = new LinkedHashMap<>();
    private final Map<String, List<String>> questionBanks = new HashMap<>();

    @PostConstruct
    public void init() {
        seedTracks();
        seedTests();
        seedQuestionBanks();
    }

    public List<MockTestTrackResponse> getTracks() {
        return new ArrayList<>(tracks.values());
    }

    public List<MockTestInfoResponse> getAllTests() {
        return tests.values().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<MockTestInfoResponse> getTestsByTrack(String trackId) {
        String normalized = normalize(trackId);
        return tests.values().stream()
                .filter(t -> t.trackId().equals(normalized))
                .map(this::toResponse)
                .toList();
    }

    public MockTestStartResponse startRandomMockTest(String testId) {
        String normalized = normalize(testId);
        MockTestDefinition test = tests.get(normalized);
        if (test == null) {
            throw new RuntimeException("Mock test not found for id: " + testId);
        }

        List<String> bank = questionBanks.get(normalized);
        if (bank == null || bank.size() < RANDOM_TEST_QUESTION_COUNT) {
            throw new RuntimeException("Question bank is not ready for test id: " + testId);
        }

        List<String> randomized = new ArrayList<>(bank);
        Collections.shuffle(randomized, ThreadLocalRandom.current());

        List<String> selected = randomized.subList(0, RANDOM_TEST_QUESTION_COUNT);

        return MockTestStartResponse.builder()
                .testId(test.id())
                .testName(test.name())
                .totalQuestions(RANDOM_TEST_QUESTION_COUNT)
                .questionPoolSize(bank.size())
                .questions(selected)
                .build();
    }

    private MockTestInfoResponse toResponse(MockTestDefinition definition) {
        return MockTestInfoResponse.builder()
                .id(definition.id())
                .trackId(definition.trackId())
                .name(definition.name())
                .duration(definition.duration())
                .focus(definition.focus())
                .configurable(definition.configurable())
                .questionPoolSize(QUESTION_POOL_SIZE)
                .build();
    }

    private void seedTracks() {
        tracks.put("frontend", MockTestTrackResponse.builder()
                .id("frontend")
                .label("Frontend")
                .description("Framework-specific mock tests for UI engineers.")
                .build());
        tracks.put("backend", MockTestTrackResponse.builder()
                .id("backend")
                .label("Backend")
                .description("API, concurrency and architecture focused mock tests.")
                .build());
        tracks.put("database", MockTestTrackResponse.builder()
                .id("database")
                .label("Database")
                .description("SQL, indexing, normalization and query tuning.")
                .build());
        tracks.put("dsa", MockTestTrackResponse.builder()
                .id("dsa")
                .label("DSA")
                .description("Data structures, algorithms and complexity analysis.")
                .build());
        tracks.put("fullstack", MockTestTrackResponse.builder()
                .id("fullstack")
                .label("Full-Stack")
                .description("End-to-end mock tests across the stack.")
                .build());
    }

    private void seedTests() {
        addTest("fe-react-senior", "frontend", "React", "45 min",
                "Hooks, performance, architecture, testing", false);
        addTest("fe-angular-mid", "frontend", "Angular", "45 min",
                "Components, RxJS, forms, routing", false);
        addTest("fe-vue-core", "frontend", "Vue", "40 min",
                "Reactivity, composition API, state management", false);

        addTest("be-node-api", "backend", "Node.js / Express APIs", "45 min",
                "REST, auth, middlewares, testing", false);
        addTest("be-java-spring", "backend", "Java Spring Boot", "60 min",
                "JPA, security, scalability, microservices", false);
        addTest("be-python-django", "backend", "Python Django / DRF", "45 min",
                "ORM, views, serializers, APIs", false);

        addTest("db-sql-pro", "database", "Relational Databases & SQL", "45 min",
                "Joins, indexing, normalization, transactions", false);
        addTest("db-nosql", "database", "NoSQL & Distributed Stores", "40 min",
                "Document & key-value stores, modeling", false);

        addTest("dsa-core", "dsa", "Core DSA Foundations", "45 min",
                "Arrays, strings, basic recursion, complexity", false);
        addTest("dsa-advanced", "dsa", "Advanced DSA & Patterns", "60 min",
                "Graphs, DP, greedy, system constraints", false);

        addTest("fs-custom", "fullstack", "Custom Full-Stack Scenario", "60 min",
                "Configure frontend, backend and database focus areas.", true);
    }

    private void addTest(String id, String trackId, String name, String duration, String focus, boolean configurable) {
        tests.put(id, new MockTestDefinition(id, trackId, name, duration, focus, configurable));
    }

    private void seedQuestionBanks() {
        for (MockTestDefinition test : tests.values()) {
            questionBanks.put(test.id(), generateQuestionBank(test));
        }
    }

    private List<String> generateQuestionBank(MockTestDefinition test) {
        List<String> bank = new ArrayList<>(QUESTION_POOL_SIZE);
        List<String> patterns = List.of(
                "Explain %s for a production-ready %s system.",
                "How would you debug a difficult issue related to %s in %s?",
                "What trade-offs do you consider when designing %s in %s?",
                "Design a real-world interview answer around %s in %s.",
                "How do you test and validate %s in %s projects?",
                "What common mistakes happen in %s while building %s?"
        );

        for (int i = 1; i <= QUESTION_POOL_SIZE; i++) {
            String pattern = patterns.get(i % patterns.size());
            String topic = deriveTopic(test, i);
            String question = String.format(pattern, topic, test.name());
            bank.add("Q" + i + ". " + question);
        }

        return bank;
    }

    private String deriveTopic(MockTestDefinition test, int index) {
        return switch (test.trackId()) {
            case "frontend" -> frontendTopic(index);
            case "backend" -> backendTopic(index);
            case "database" -> databaseTopic(index);
            case "dsa" -> dsaTopic(index);
            case "fullstack" -> fullstackTopic(index);
            default -> "core engineering practices";
        };
    }

    private String frontendTopic(int i) {
        List<String> topics = List.of(
                "state management", "component architecture", "render performance",
                "client-side routing", "form validation", "accessibility",
                "error boundaries", "code splitting", "testing strategy", "SSR/CSR behavior"
        );
        return topics.get(i % topics.size());
    }

    private String backendTopic(int i) {
        List<String> topics = List.of(
                "API design", "authentication and authorization", "idempotency",
                "database transaction handling", "rate limiting", "async processing",
                "caching strategy", "service observability", "error handling", "horizontal scalability"
        );
        return topics.get(i % topics.size());
    }

    private String databaseTopic(int i) {
        List<String> topics = List.of(
                "query optimization", "index selection", "normalization vs denormalization",
                "transaction isolation", "locking and deadlocks", "sharding",
                "replication strategy", "data consistency", "schema evolution", "backup and recovery"
        );
        return topics.get(i % topics.size());
    }

    private String dsaTopic(int i) {
        List<String> topics = List.of(
                "time-space complexity analysis", "two-pointer pattern", "sliding window",
                "binary search variants", "tree traversals", "graph traversal",
                "dynamic programming", "greedy strategy", "backtracking", "heap-based optimization"
        );
        return topics.get(i % topics.size());
    }

    private String fullstackTopic(int i) {
        List<String> topics = List.of(
                "API integration flow", "frontend-backend contract design", "auth/session lifecycle",
                "end-to-end error handling", "full-stack testing", "deployment pipeline",
                "production monitoring", "performance bottleneck analysis", "security hardening", "scaling strategy"
        );
        return topics.get(i % topics.size());
    }

    private String normalize(String value) {
        if (value == null) return "";
        return value.trim().toLowerCase();
    }

    private record MockTestDefinition(
            String id,
            String trackId,
            String name,
            String duration,
            String focus,
            boolean configurable
    ) {
    }
}
