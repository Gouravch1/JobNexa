package com.jobportal.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class ElevenLabsConfig {

    @Value("${elevenlabs.api.key}")
    private String apiKey;

    @Value("${elevenlabs.api.base-url:https://api.elevenlabs.io}")
    private String baseUrl;

    @Value("${elevenlabs.api.voice-id:JBFqnCBsd6RMkjVDRZzb}")
    private String voiceId;

    @Value("${elevenlabs.api.model-id:eleven_multilingual_v2}")
    private String modelId;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getVoiceId() {
        return voiceId;
    }

    public String getModelId() {
        return modelId;
    }
}
