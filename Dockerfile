# Ghost with custom theme for Railway deployment
FROM ghost:6-alpine

# Copy custom theme to a staging location (will be moved at runtime)
COPY content/themes/avancer-simplement /tmp/avancer-simplement

# Create startup script that copies theme after Ghost initializes content dir
RUN echo '#!/bin/sh' > /usr/local/bin/start-ghost.sh && \
    echo 'mkdir -p /var/lib/ghost/content/themes' >> /usr/local/bin/start-ghost.sh && \
    echo 'cp -r /tmp/avancer-simplement /var/lib/ghost/content/themes/' >> /usr/local/bin/start-ghost.sh && \
    echo 'exec docker-entrypoint.sh node current/index.js' >> /usr/local/bin/start-ghost.sh && \
    chmod +x /usr/local/bin/start-ghost.sh

# Ghost runs on port 2368 by default
EXPOSE 2368

CMD ["/usr/local/bin/start-ghost.sh"]
