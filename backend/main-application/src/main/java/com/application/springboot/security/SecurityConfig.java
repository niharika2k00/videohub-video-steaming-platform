package com.application.springboot.security;

import com.application.springboot.exception.CustomAccessDeniedException;
import com.application.springboot.utility.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
  private final JwtAuthenticationFilter jwtAuthenticationFilter;
  private final CustomAccessDeniedException customAccessDeniedException;

  @Autowired
  public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, CustomAccessDeniedException customAccessDeniedException) {
    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    this.customAccessDeniedException = customAccessDeniedException;
  }

  @Value("${custom.endpoints.client.local}")
  private String clientLocalEndpoint;

  @Value("${custom.endpoints.server.staging}")
  private String serverStagingEndpoint;

  // Role hierarchy constants
  private static final class Roles {
    static final String[] READ_ONLY = {"ROLE_VIEWER"};
    static final String[] WRITE_ACCESS = {
        "ROLE_USER",
        "ROLE_DEVELOPER",
        "ROLE_EDITOR",
        "ROLE_MANAGER",
        "ROLE_OPERATOR"
    };
    static final String[] ADMIN_ACCESS = {
        "ROLE_ADMIN",
        "ROLE_SUPER_ADMIN"
    };

    // Combined role arrays
    static final String[] ALL_ROLES = combineRoles(READ_ONLY, WRITE_ACCESS, ADMIN_ACCESS);
    static final String[] WRITE_AND_ADMIN = combineRoles(WRITE_ACCESS, ADMIN_ACCESS);

    private static String[] combineRoles(String[]... roleArrays) {
      return Arrays.stream(roleArrays)
          .flatMap(Arrays::stream)
          .toArray(String[]::new);
    }
  }

  // Public endpoints that don't require authentication
  private static final String[] STATIC_RESOURCES = {"/assets/**", "/*.js", "/*.css", "/*.png", "/*.jpg", "/*.jpeg", "/*.gif", "/*.svg", "/*.ico"};

  // Frontend routes (React Router paths)
  private static final String[] FRONTEND_ROUTES = {"/signup", "/signin", "/about", "/contact", "/profile", "/dashboard", "/videos"};

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

    http.authorizeHttpRequests(auth -> auth
        .requestMatchers(HttpMethod.GET, "/", "/api", "/api/test").permitAll()
        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login", "/api/contact").permitAll()
        .requestMatchers(HttpMethod.POST, "/api/video/upload", "/api/users/logout").authenticated()

        .requestMatchers(HttpMethod.GET, "/api/users", "/api/users/**", "/api/roles", "/api/roles/**", "/api/videos", "/api/videos/**").hasAnyAuthority(Roles.ALL_ROLES)

        .requestMatchers(HttpMethod.PUT, "/api/users", "/api/roles").hasAnyAuthority(Roles.WRITE_AND_ADMIN) // update
        .requestMatchers(HttpMethod.POST, "/api/roles", "/api/users/{id}/roles").hasAnyAuthority(Roles.WRITE_AND_ADMIN)

        .requestMatchers(HttpMethod.DELETE, "/api/users/**", "/api/roles/**").hasAnyAuthority(Roles.ADMIN_ACCESS)
        .requestMatchers(HttpMethod.DELETE, "/api/video/**").hasAnyAuthority(Roles.WRITE_AND_ADMIN)

        // Allow access to static resources /*.jpg → only top-level files whereas
        // /**/*.jpg → all jpg files anywhere under the directory tree.
        // .requestMatchers("/dist/**", "/assets/**", "/**/*.js", "/**/*.css",
        // "/**/*.png", "/**/*.jpg", "/**/*.jpeg", "/**/*.gif", "/**/*.svg", "/**/*.ico", "/index.html").permitAll()
        .requestMatchers(HttpMethod.GET, STATIC_RESOURCES).permitAll()
        .requestMatchers(HttpMethod.GET, "/index.html").permitAll()

        // Frontend routes
        .requestMatchers(HttpMethod.GET, FRONTEND_ROUTES).permitAll()

        // Catch-all for other GET requests (React Router catch-all) - LAST
        .requestMatchers(HttpMethod.GET, "/**").permitAll()
        .anyRequest().authenticated()
    );

    // http.httpBasic((Customizer.withDefaults())); // enable HTTP basic authentication
    http.httpBasic(e -> e.disable()); // disable HTTP basic authentication
    http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class); // add custom filter in the security chain before the existing filter
    http.exceptionHandling(e -> e.accessDeniedHandler(customAccessDeniedException)); // handler for access denied exception
    http.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS)); // set session management to stateless

    // disable CSRF and CORS. In general not required for stateless REST APIs(POST, PUT, DELETE or PATCH) as don't create/maintain session rather authenticate with jwt token
    http.csrf(csrf -> csrf.disable());
    // http.cors(cors -> cors.disable());

    // Enable CORS using spring’s default configuration, looks for CorsConfigurationSource bean automatically (if it exists) else manually pass the method
    http.cors(Customizer.withDefaults());
    // http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

    // http.logout(e -> e.logoutRequestMatcher(new
    // AntPathRequestMatcher("/api/users/logout")).logoutSuccessUrl("/api/users/login"));

    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();

    // Allow multiple origins for development and production
    List<String> allowedOrigins = Arrays.asList(
        clientLocalEndpoint,
        serverStagingEndpoint);

    // config.setAllowedOrigins(allowedOrigins); // OR config.setAllowedOrigins(List.of(baseUrl));
    config.setAllowedOriginPatterns(List.of("*"));

    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true); // Required for cookies or Authorization headers

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
}
