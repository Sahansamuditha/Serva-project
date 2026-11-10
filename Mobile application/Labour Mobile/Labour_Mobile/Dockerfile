# Production Nginx Container for Universal Labourer & Mobile Portal
FROM nginx:alpine

RUN rm -rf /docker-entrypoint.d/*

COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
