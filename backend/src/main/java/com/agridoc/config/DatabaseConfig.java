package com.agridoc.config;

import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.io.File;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.URI;

@Configuration
@Slf4j
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String mysqlUrl;

    @Value("${spring.datasource.username}")
    private String mysqlUser;

    @Value("${spring.datasource.password}")
    private String mysqlPass;

    @Bean
    @Primary
    public DataSource dataSource() {
        // If an external DB_URL is explicitly provided (non-localhost), always use it directly.
        String dbUrlEnv = System.getenv("DB_URL");
        if (dbUrlEnv != null && !dbUrlEnv.isBlank()) {
            log.info("External DB_URL environment variable detected. Connecting to configured database...");
            HikariDataSource ds = new HikariDataSource();
            ds.setJdbcUrl(mysqlUrl);
            ds.setUsername(mysqlUser);
            ds.setPassword(mysqlPass);
            ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
            ds.setConnectionTimeout(5000);
            return ds;
        }

        // Extract host and port from the configured JDBC URL for local MySQL detection
        String mysqlHost = extractHost(mysqlUrl, "localhost");
        int mysqlPort = extractPort(mysqlUrl, 3306);

        if (isMySqlAvailable(mysqlHost, mysqlPort, 1200)) {
            log.info("MySQL service detected on {}:{}. Connecting to MySQL database...", mysqlHost, mysqlPort);
            HikariDataSource ds = new HikariDataSource();
            ds.setJdbcUrl(mysqlUrl);
            ds.setUsername(mysqlUser);
            ds.setPassword(mysqlPass);
            ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
            ds.setConnectionTimeout(3000);
            return ds;
        } else {
            log.warn("MySQL service on {}:{} is not reachable. Seamlessly switching to embedded H2 database (MySQL compatibility mode)...", mysqlHost, mysqlPort);
            log.warn("NOTE: H2 file-based data is stored in ./data/agridoc. On Render free tier, this is ephemeral and will reset on restart.");
            File dataDir = new File("./data");
            if (!dataDir.exists()) {
                dataDir.mkdirs();
            }
            HikariDataSource ds = new HikariDataSource();
            ds.setJdbcUrl("jdbc:h2:file:./data/agridoc;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1");
            ds.setUsername("sa");
            ds.setPassword("");
            ds.setDriverClassName("org.h2.Driver");
            ds.setConnectionTimeout(5000);
            return ds;
        }
    }

    private boolean isMySqlAvailable(String host, int port, int timeoutMs) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), timeoutMs);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extracts the hostname from a JDBC URL.
     * e.g. jdbc:mysql://localhost:3306/agridoc -> localhost
     */
    private String extractHost(String jdbcUrl, String defaultHost) {
        try {
            // Remove jdbc: prefix for URI parsing
            String uriStr = jdbcUrl.replace("jdbc:", "");
            URI uri = new URI(uriStr);
            String host = uri.getHost();
            return (host != null && !host.isBlank()) ? host : defaultHost;
        } catch (Exception e) {
            return defaultHost;
        }
    }

    /**
     * Extracts the port from a JDBC URL.
     * e.g. jdbc:mysql://localhost:3306/agridoc -> 3306
     */
    private int extractPort(String jdbcUrl, int defaultPort) {
        try {
            String uriStr = jdbcUrl.replace("jdbc:", "");
            URI uri = new URI(uriStr);
            int port = uri.getPort();
            return port > 0 ? port : defaultPort;
        } catch (Exception e) {
            return defaultPort;
        }
    }
}
