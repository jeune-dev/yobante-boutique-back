#!/bin/bash
# ─── backup-postgres.sh — Sauvegarde PostgreSQL + upload Google Drive ────────
# Usage : bash deploy/backup-postgres.sh
# Prérequis : rclone configuré (rclone config) avec un remote "gdrive"
set -euo pipefail

DB_NAME="${DB_NAME:-yobante_boutique}"
DB_USER="${DB_USER:-yobante}"
BACKUP_DIR="/tmp/yobante-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/boutique_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=3

mkdir -p "$BACKUP_DIR"

echo "▶ Dump PostgreSQL : $DB_NAME"
if command -v docker &>/dev/null && docker ps --format '{{.Names}}' | grep -q "yobante_postgres"; then
  docker exec yobante_postgres pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"
else
  pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"
fi

echo "▶ Upload vers Google Drive…"
if command -v rclone &>/dev/null; then
  rclone copy "$BACKUP_FILE" "gdrive:backups/yobante-boutique/"
  echo " ✔ Backup uploadé : $(basename "$BACKUP_FILE")"
else
  echo " ⚠ rclone non installé — backup conservé localement : $BACKUP_FILE"
fi

echo "▶ Suppression des backups locaux de plus de $RETENTION_DAYS jours…"
find "$BACKUP_DIR" -name "boutique_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete

echo " ✔ Backup terminé : $BACKUP_FILE"
