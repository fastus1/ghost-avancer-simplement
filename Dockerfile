# Ghost with custom theme for Railway deployment
FROM ghost:6-alpine

# Copy custom theme to a staging location (will be synced at runtime)
COPY content/themes/avancer-simplement /tmp/avancer-simplement

# Create startup script that syncs theme on EVERY container start
RUN cat > /usr/local/bin/start-ghost.sh << 'SCRIPT'
#!/bin/sh
set -e

echo "=== Syncing avancer-simplement theme ==="

# Wait for volume to be mounted
sleep 2

# Ensure themes directory exists
mkdir -p /var/lib/ghost/content/themes

# Remove old version and copy fresh theme (force update on every deploy)
rm -rf /var/lib/ghost/content/themes/avancer-simplement
cp -r /tmp/avancer-simplement /var/lib/ghost/content/themes/avancer-simplement

echo "=== Theme synced: $(ls /var/lib/ghost/content/themes/) ==="

# Start Ghost
exec docker-entrypoint.sh node current/index.js
SCRIPT
RUN chmod +x /usr/local/bin/start-ghost.sh

EXPOSE 2368

CMD ["/usr/local/bin/start-ghost.sh"]
