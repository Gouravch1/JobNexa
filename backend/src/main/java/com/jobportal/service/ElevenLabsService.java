package com.jobportal.service;

import com.jobportal.config.ElevenLabsConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class ElevenLabsService {

    private final ElevenLabsConfig elevenLabsConfig;
    private final RestTemplate restTemplate;

    @Autowired
    public ElevenLabsService(ElevenLabsConfig elevenLabsConfig, RestTemplate restTemplate) {
        this.elevenLabsConfig = elevenLabsConfig;
        this.restTemplate = restTemplate;
    }

    /**
     * Text-to-Speech using ElevenLabs API.
     * POST /v1/text-to-speech/{voice_id}
     * Returns base64-encoded audio (mp3).
     */
    public String textToSpeech(String text) {
        try {
            String url = elevenLabsConfig.getBaseUrl() + "/v1/text-to-speech/" + elevenLabsConfig.getVoiceId();
            log.info("=== ELEVENLABS TTS === URL: {}, text[0..80]: '{}'", url,
                    text.substring(0, Math.min(80, text.length())));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("xi-api-key", elevenLabsConfig.getApiKey());
            headers.setAccept(List.of(MediaType.parseMediaType("audio/mpeg")));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("text", text);
            requestBody.put("model_id", elevenLabsConfig.getModelId());
            requestBody.put("voice_settings", Map.of(
                    "stability", 0.5,
                    "similarity_boost", 0.75));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<byte[]> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, byte[].class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                byte[] audioBytes = response.getBody();
                String audioBase64 = Base64.getEncoder().encodeToString(audioBytes);
                log.info("TTS SUCCESS! Audio bytes: {}, base64 length: {}", audioBytes.length, audioBase64.length());
                return audioBase64;
            }

            log.warn("TTS unexpected status: {}", response.getStatusCode());
            return null;
        } catch (Exception e) {
            log.error("TTS FAILED: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Speech-to-Text using ElevenLabs Scribe API.
     * POST /v1/speech-to-text
     * Accepts audio file as multipart form data.
     * Returns transcribed text.
     */
    public String speechToText(String base64Audio) {
        return speechToText(base64Audio, "webm");
    }

    public String speechToText(String base64Audio, String audioFormat) {
        try {
            if (elevenLabsConfig.getApiKey() == null || elevenLabsConfig.getApiKey().trim().isEmpty()) {
                log.warn("ElevenLabs API key not configured, skipping STT");
                return "";
            }

            String format = audioFormat != null ? audioFormat.toLowerCase() : "webm";
            String filename = "recording." + format;
            String contentType;
            switch (format) {
                case "wav":
                    contentType = "audio/wav";
                    break;
                case "mp3":
                    contentType = "audio/mpeg";
                    break;
                case "webm":
                    contentType = "audio/webm";
                    break;
                default:
                    contentType = "audio/webm";
                    break;
            }

            log.info("=== ELEVENLABS STT === audio base64 length: {}, format: {}", base64Audio.length(), format);

            byte[] audioBytes = Base64.getDecoder().decode(base64Audio);
            log.info("Decoded audio bytes: {}", audioBytes.length);

            String url = elevenLabsConfig.getBaseUrl() + "/v1/speech-to-text";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("xi-api-key", elevenLabsConfig.getApiKey());

            MultiValueMap<String, Object> formData = new LinkedMultiValueMap<>();

            ByteArrayResource audioResource = new ByteArrayResource(audioBytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };

            HttpHeaders fileHeaders = new HttpHeaders();
            fileHeaders.setContentType(MediaType.parseMediaType(contentType));
            HttpEntity<ByteArrayResource> filePart = new HttpEntity<>(audioResource, fileHeaders);
            formData.add("file", filePart);
            formData.add("model_id", "scribe_v1");
            formData.add("language_code", "eng");

            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(formData, headers);

            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();

                // Check for error in response
                if (body.containsKey("error")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> error = (Map<String, Object>) body.get("error");
                    String errorMsg = error != null ? error.toString() : "Unknown error";
                    log.error("ElevenLabs API error: {}", errorMsg);
                    return "";
                }

                // ElevenLabs returns: { "text": "transcribed text", ... }
                String transcript = (String) body.get("text");
                if (transcript != null && !transcript.trim().isEmpty()) {
                    log.info("ELEVENLABS STT SUCCESS! Transcript: '{}'", transcript);
                    return transcript.trim();
                }
                log.warn("ElevenLabs STT response has no transcript. Keys: {}", body.keySet());
            }

            log.warn("ElevenLabs STT unexpected response status: {}, body: {}", response.getStatusCode(),
                    response.getBody());
            return "";
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("ElevenLabs STT HTTP error - Status: {}, Response: {}", e.getStatusCode(),
                    e.getResponseBodyAsString());
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                log.error("ElevenLabs API key is invalid. Check your API key in application.yml");
            }
            return "";
        } catch (Exception e) {
            log.error("ELEVENLABS STT FAILED: {}", e.getMessage(), e);
            return "";
        }
    }
}
