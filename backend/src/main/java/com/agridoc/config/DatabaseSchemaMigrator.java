package com.agridoc.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DatabaseSchemaMigrator implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info("Checking database schema for 'reports' table...");
            boolean hasReports = false;
            boolean hasSeverity = false;
            boolean hasSeverityLevel = false;

            try (Connection conn = jdbcTemplate.getDataSource().getConnection()) {
                DatabaseMetaData meta = conn.getMetaData();
                String dbProductName = meta.getDatabaseProductName().toLowerCase();

                // Check tables
                try (ResultSet tables = meta.getTables(null, null, "%", new String[]{"TABLE"})) {
                    while (tables.next()) {
                        String tName = tables.getString("TABLE_NAME");
                        if ("reports".equalsIgnoreCase(tName)) {
                            hasReports = true;
                            break;
                        }
                    }
                }

                if (!hasReports) {
                    log.info("'reports' table not created yet; schema migration not needed.");
                    return;
                }

                // Check columns in reports table
                try (ResultSet cols = meta.getColumns(null, null, null, null)) {
                    while (cols.next()) {
                        String tName = cols.getString("TABLE_NAME");
                        String colName = cols.getString("COLUMN_NAME");
                        if ("reports".equalsIgnoreCase(tName)) {
                            if ("severity".equalsIgnoreCase(colName)) {
                                hasSeverity = true;
                            } else if ("severity_level".equalsIgnoreCase(colName)) {
                                hasSeverityLevel = true;
                            }
                        }
                    }
                }

                if (hasSeverity) {
                    log.warn("Obsolete column 'severity' detected in 'reports' table. Starting migration...");
                    if (hasSeverityLevel) {
                        jdbcTemplate.execute("UPDATE reports SET severity_level = severity WHERE severity_level IS NULL AND severity IS NOT NULL");
                        jdbcTemplate.execute("ALTER TABLE reports DROP COLUMN severity");
                        log.info("Successfully dropped obsolete 'severity' column.");
                    } else {
                        if (dbProductName.contains("mysql")) {
                            jdbcTemplate.execute("ALTER TABLE reports CHANGE COLUMN severity severity_level VARCHAR(20) NULL");
                        } else {
                            jdbcTemplate.execute("ALTER TABLE reports ALTER COLUMN severity RENAME TO severity_level");
                        }
                        log.info("Successfully renamed column 'severity' to 'severity_level'.");
                    }
                } else {
                    log.info("'reports' table schema is clean and matches entity definitions.");
                }
            }
        } catch (Exception e) {
            log.warn("Database schema migration check skipped or encountered non-critical error: {}", e.getMessage());
        }
    }
}
