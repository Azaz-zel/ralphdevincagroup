FROM php:8.3-apache

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libonig-dev libicu-dev curl \
    && docker-php-ext-install pdo_mysql mbstring zip bcmath intl \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

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

RUN mkdir -p storage/framework/cache storage/framework/sessions \
    storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' \
    /etc/apache2/sites-available/000-default.conf
RUN sed -i 's|<Directory /var/www/html>|<Directory /var/www/html/public>|g' \
    /etc/apache2/apache2.conf

EXPOSE 80
CMD ["apache2-foreground"]
