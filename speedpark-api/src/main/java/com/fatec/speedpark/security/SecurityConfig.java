package com.fatec.speedpark.security;

import java.security.SecureRandom;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

/**
 * API stateless: o login devolve um JWT (HS256) que o front manda em
 * "Authorization: Bearer". Senhas ficam so como hash BCrypt.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    SecretKey jwtKey(@Value("${speedpark.jwt.secret:}") String secret) {
        byte[] bytes;
        if (secret.length() >= 32) {
            bytes = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        } else {
            // ponytail: sem segredo fixo, os tokens morrem a cada reinicio; defina speedpark.jwt.secret (32+ chars)
            log.warn("speedpark.jwt.secret ausente ou curto (<32): usando chave aleatoria, os logins caem ao reiniciar.");
            bytes = new byte[32];
            new SecureRandom().nextBytes(bytes);
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey jwtKey) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtKey));
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey jwtKey) {
        return NimbusJwtDecoder.withSecretKey(jwtKey).macAlgorithm(MacAlgorithm.HS256).build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value("${speedpark.cors.origins:http://127.0.0.1:5500,http://localhost:5500}") List<String> origens) {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(origens);
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", cfg);
        return source;
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        JwtGrantedAuthoritiesConverter autoridades = new JwtGrantedAuthoritiesConverter();
        autoridades.setAuthoritiesClaimName("role");
        autoridades.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter conversor = new JwtAuthenticationConverter();
        conversor.setJwtGrantedAuthoritiesConverter(autoridades);

        http
                .csrf(AbstractHttpConfigurer::disable) // sem cookies de sessao: token no header
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/error").permitAll() // senao um erro 500 vira 403 para quem nao e admin
                        .requestMatchers("/api/auth/login", "/api/auth/registro", "/api/auth/redefinir-senha").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/provas/historico").permitAll() // ranking da pagina inicial
                        .requestMatchers("/api/auth/me", "/api/reservas", "/api/reservas/**",
                                "/api/dependentes", "/api/dependentes/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/karts", "/api/pistas").authenticated()
                        // pilotos: lista, cadastro e exclusao so admin; ver/editar o proprio perfil e checado no servico
                        .requestMatchers(HttpMethod.GET, "/api/pilotos/*").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/pilotos/*").authenticated()
                        .anyRequest().hasRole("ADMIN"))
                .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(conversor)));
        return http.build();
    }
}
