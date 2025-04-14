#!/bin/sh
# Entrypoint script for Container

# Change ownership of Working Directory to UID 1000
# Needed as .data is mount point of volume and can have different UID
echo "Changing ownership of /app/.data to UID 1000..." >&2
chown -R 1000:1000 /app/.data

# Start supervisord
echo "Starting supervisord..." >&2
exec /usr/bin/supervisord -c /etc/supervisord.conf