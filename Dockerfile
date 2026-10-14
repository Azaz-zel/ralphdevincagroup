FROM php:8.3-apache

WORKDIR /var/www/html

# GD with JPEG and WebP re-encodes screenshots uploaded in the admin.
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libonig-dev libicu-dev curl \
    libjpeg62-turbo-dev libpng-dev libwebp-dev \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install pdo_mysql mbstring zip bcmath intl gd \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

# The admin accepts up to eight screenshots of 10 MB each in one save, and a
# 4000px image needs room in memory to be decoded and scaled.
RUN printf 'upload_max_filesize=12M\npost_max_size=100M\nmax_file_uploads=10\nmemory_limit=256M\n' \
    > /usr/local/etc/php/conf.d/uploads.ini

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY --from=node:22 /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22 /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader --no-dev

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN composer dump-autoload --optimize
RUN npm run build

# storage/app is the persistent volume in docker-compose.yml, so uploads
# survive a rebuild; public/storage is how the browser reaches them.
RUN mkdir -p storage/framework/cache storage/framework/sessions \
    storage/framework/views storage/logs storage/app/public/work bootstrap/cache \
    && ln -sfn /var/www/html/storage/app/public public/storage \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' \
    /etc/apache2/sites-available/000-default.conf
RUN sed -i 's|<Directory /var/www/html>|<Directory /var/www/html/public>|g' \
    /etc/apache2/apache2.conf

EXPOSE 80
CMD ["apache2-foreground"]
