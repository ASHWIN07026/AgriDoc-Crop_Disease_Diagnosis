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
        if (isMySqlAvailable("localhost", 3306, 1200)) {
            log.info("MySQL service detected on localhost:3306. Connecting to MySQL database...");
            HikariDataSource ds = new HikariDataSource();
            ds.setJdbcUrl(mysqlUrl);
            ds.setUsername(mysqlUser);
            ds.setPassword(mysqlPass);
            ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
            ds.setConnectionTimeout(3000);
            return ds;
        } else {
            log.warn("MySQL service on localhost:3306 is not reachable. Seamlessly switching to embedded H2 database (MySQL compatibility mode)...");
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
}
