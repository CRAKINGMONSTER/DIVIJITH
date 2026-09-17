package com.example.cryptotracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/proxy")
public class CoinProxyController {

    private final RestTemplate rest = new RestTemplate();

    @GetMapping("/coins/markets")
    public ResponseEntity<?> markets(String vs_currency, Integer per_page){
        // simple proxy to avoid CORS issues if needed
        String url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency="+vs_currency+"&per_page="+per_page;
        return ResponseEntity.ok(rest.getForObject(url, Object.class));
    }

    @GetMapping("/coins/{id}")
    public ResponseEntity<?> coin(@PathVariable String id){
        String url = "https://api.coingecko.com/api/v3/coins/"+id;
        return ResponseEntity.ok(rest.getForObject(url, Object.class));
    }
}
