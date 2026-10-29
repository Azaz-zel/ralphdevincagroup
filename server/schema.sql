-- MySQL 8.0.16+ (CHECK constraints). Run once against an empty database:
--   mysql -uroot rdv_group < schema.sql && mysql -uroot rdv_group < seed.sql
-- Times are stored as UTC: the server sets time_zone = '+00:00' on every connection.

CREATE TABLE projects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  division VARCHAR(20) NOT NULL CHECK (division IN ('perfumery', 'technology')),
  position SMALLINT NOT NULL DEFAULT 1 CHECK (position BETWEEN 1 AND 999),
  summary VARCHAR(200) NOT NULL,
  index_summary VARCHAR(240) NULL,
  meta_label VARCHAR(80) NULL,
  facts JSON NOT NULL,
  situation TEXT NOT NULL,
  constraint_text TEXT NULL,
  result TEXT NOT NULL,
  decisions JSON NOT NULL,
  composition_top VARCHAR(120) NOT NULL,
  composition_heart VARCHAR(120) NOT NULL,
  composition_base VARCHAR(120) NOT NULL,
  images JSON NOT NULL,
  cover SMALLINT NOT NULL DEFAULT 0,
  seo_title VARCHAR(120) NULL,
  seo_description VARCHAR(300) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE inquiries (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  division VARCHAR(20) NOT NULL DEFAULT 'unsure' CHECK (division IN ('perfumery', 'technology', 'unsure')),
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  read_at TIMESTAMP NULL,
  replied_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX inquiries_created (created_at)
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Every row here may use the admin. Add one with: npm run admin:create -- <email> <password>
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
