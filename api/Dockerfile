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

RUN chmod -R 775 storage bootstrap/cache

EXPOSE 10000

CMD ["sh", "-c", "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]
