package com.gusa.apex.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${pg.portone.api-url}")
    private String portoneApiUrl;

    @Value("${pg.toss.api-url}")
    private String tossApiUrl;

    @Value("${pg.kakao.api-url}")
    private String kakaoApiUrl;

    @Bean("portoneRestClient")
    public RestClient portoneRestClient() {
        return RestClient.builder()
                .baseUrl(portoneApiUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Bean("tossRestClient")
    public RestClient tossRestClient() {
        return RestClient.builder()
                .baseUrl(tossApiUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Bean("kakaoRestClient")
    public RestClient kakaoRestClient() {
        return RestClient.builder()
                .baseUrl(kakaoApiUrl)
                .defaultHeader("Content-Type", "application/x-www-form-urlencoded")
                .build();
    }
}
