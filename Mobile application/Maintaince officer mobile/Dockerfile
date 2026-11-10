# Production Nginx Container for Maintaince Officer Mobile Web App
FROM nginx:alpine

RUN rm -rf /docker-entrypoint.d/*

COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]
