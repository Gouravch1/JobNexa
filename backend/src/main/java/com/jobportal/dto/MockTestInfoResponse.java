package com.jobportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockTestInfoResponse {
    private String id;
    private String trackId;
    private String name;
    private String duration;
    private String focus;
    private boolean configurable;
    private int questionPoolSize;
}
