FROM searxng/searxng:latest

# Copier les fichiers de configuration locaux dans l'image
COPY limiter.toml /etc/searxng/limiter.toml
COPY settings.yml /etc/searxng/settings.yml
COPY uwsgi.ini /etc/searxng/uwsgi.ini

# S'assurer que les permissions sont correctes (optionnel, mais bonne pratique)
RUN chown -R searxng:searxng /etc/searxng

# Le point d'entrée/cmd par défaut de l'image de base sera utilisé 