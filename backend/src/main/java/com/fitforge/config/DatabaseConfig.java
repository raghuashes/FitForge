package com.fitforge.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.io.File;
import java.net.URI;

@Configuration
@Profile("prod")
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:}")
    private String dbUrl;

    @Value("${spring.datasource.username:}")
    private String dbUser;

    @Value("${spring.datasource.password:}")
    private String dbPass;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        boolean hasExternalDb = dbUrl != null && !dbUrl.isBlank()
                && !dbUrl.contains("localhost:5432")
                && !dbUrl.contains("127.0.0.1:5432");

        if (hasExternalDb) {
            log.info("Configuring external PostgreSQL database connection");
            String jdbcUrl = dbUrl;

            if (jdbcUrl.startsWith("postgres://") || jdbcUrl.startsWith("postgresql://")) {
                try {
                    URI uri = new URI(jdbcUrl);
                    String userInfo = uri.getUserInfo();
                    String host = uri.getHost();
                    int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                    String path = uri.getPath();
                    String query = uri.getQuery();

                    jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + (query != null ? "?" + query : "");

                    if (userInfo != null && userInfo.contains(":")) {
                        String[] parts = userInfo.split(":", 2);
                        if (dbUser == null || dbUser.isBlank()) config.setUsername(parts[0]);
                        if (dbPass == null || dbPass.isBlank()) config.setPassword(parts[1]);
                    }
                } catch (Exception e) {
                    if (!jdbcUrl.startsWith("jdbc:")) {
                        jdbcUrl = "jdbc:" + jdbcUrl;
                    }
                }
            }

            config.setJdbcUrl(jdbcUrl);
            if (config.getUsername() == null || config.getUsername().isBlank()) {
                config.setUsername(dbUser);
            }
            if (config.getPassword() == null || config.getPassword().isBlank()) {
                config.setPassword(dbPass);
            }
            config.setDriverClassName("org.postgresql.Driver");
        } else {
            log.info("No external PostgreSQL host reachable. Using embedded container database inside Docker");
            File dataDir = new File("/app/data");
            if (!dataDir.exists()) {
                dataDir.mkdirs();
            }
            String localDbPath = dataDir.canWrite() ? "/app/data/fitforge" : "./data/fitforge";
            config.setJdbcUrl("jdbc:h2:file:" + localDbPath + ";DB_CLOSE_DELAY=-1;AUTO_SERVER=TRUE;MODE=PostgreSQL");
            config.setUsername("sa");
            config.setPassword("");
            config.setDriverClassName("org.h2.Driver");
        }

        return new HikariDataSource(config);
    }
}
