-- ============================================================
-- Fii Analyser — Script de criação do banco (MySQL)
-- Execute manualmente no phpMyAdmin, DBeaver ou MySQL Workbench.
-- ============================================================

CREATE DATABASE IF NOT EXISTS fii_analyser
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fii_analyser;

-- Tabela principal: histórico de análises salvas
CREATE TABLE IF NOT EXISTS analises (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticker VARCHAR(12) NOT NULL,
  tipo ENUM('papel', 'tijolo') NOT NULL,
  status ENUM('approved', 'rejected', 'warning') NOT NULL,
  aprovados TINYINT UNSIGNED NOT NULL,
  total TINYINT UNSIGNED NOT NULL,
  dados JSON NOT NULL COMMENT 'Dados preenchidos no formulário',
  resultado JSON NOT NULL COMMENT 'Critérios avaliados e placar',
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_analises_ticker (ticker),
  INDEX idx_analises_criado_em (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
