FROM php:8.4-cli-alpine

WORKDIR /var/www/html

RUN apk add --no-cache \
        curl-dev \
        git \
        libpq-dev \
        libxml2-dev \
        oniguruma-dev \
        unzip \
    && docker-php-ext-install curl pdo pdo_pgsql mbstring xml opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-scripts --prefer-dist --no-dev --optimize-autoloader

COPY . .

RUN mkdir -p storage/app/public storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 10000

ENTRYPOINT ["docker-entrypoint.sh"]
