// ─────────────────────────────────────────────────────────────
// utils/csv.js — Générateur CSV simple
// ─────────────────────────────────────────────────────────────

function _escape(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Génère un CSV à partir d'une liste d'objets et d'une définition de colonnes.
 * @param {Array<object>} rows
 * @param {Array<{key: string, label: string}>} columns
 * @returns {string}
 */
function toCsv(rows, columns) {
  const header = columns.map((c) => _escape(c.label)).join(';');
  const lines = rows.map((row) => columns.map((c) => _escape(row[c.key])).join(';'));
  return ['﻿' + header, ...lines].join('\n'); // BOM pour compatibilité Excel
}

module.exports = { toCsv };
