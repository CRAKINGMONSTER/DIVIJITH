package com.example.cryptotracker.dto;

public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private String role;

    public AuthResponse(){}
    public AuthResponse(String token, String username, String email, String role){
        this.token=token; this.username=username; this.email=email; this.role=role;
    }
    public String getToken(){return token;}
    public void setToken(String t){this.token=t;}
    public String getUsername(){return username;}
    public void setUsername(String u){this.username=u;}
    public String getEmail(){return email;}
    public void setEmail(String e){this.email=e;}
    public String getRole(){return role;}
    public void setRole(String r){this.role=r;}
}
