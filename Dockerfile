# Node stage
FROM node:18 AS node
WORKDIR /app
COPY . .
RUN apt-get update \
    && apt-get install -y \
        maven \
    && rm -rf /var/lib/apt/lists/*
RUN yarn install --frozen-lockfile && yarn build-keycloak-theme

# Keycloak build stage
FROM quay.io/keycloak/keycloak:25.0 as keycloak_build
WORKDIR /opt/keycloak
COPY --from=node /app/dist_keycloak/keycloak-theme-for-kc-25-and-above.jar /opt/keycloak/providers/
RUN /opt/keycloak/bin/kc.sh build

# Final image
FROM quay.io/keycloak/keycloak:25.0
COPY --from=keycloak_build /opt/keycloak/ /opt/keycloak/