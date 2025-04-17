# Use debian Node image as base
FROM node:bookworm-slim

# Install supervisor
RUN apt update && apt install -y supervisor && apt clean && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy files
COPY artifacts/svelte_build_output/ /app/ui/
COPY artifacts/axum_build_binary/axum-api /app/

# Change ownership of Working Directory to UID 1000
RUN chown -R 1000:1000 /app

# Copy Start Script
COPY ./ci/docker_entrypoint.sh /etc/app/init.sh
RUN chmod +x /etc/app/init.sh /app/axum-api

# Copy supervisord config
COPY ./ci/my_reverse_proxy/supervisord.conf /etc/supervisord.conf

ENV DATABASE_POOL_MAX_SIZE=5
ENV JWT_SECRET="mysecretjwt"

# Start supervisord
ENTRYPOINT ["/etc/app/init.sh"]