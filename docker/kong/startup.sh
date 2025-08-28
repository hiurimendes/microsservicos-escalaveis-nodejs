#!/bin/bash
set -e

echo "Kong Custom Entrypoint: Processing configuration template..."

if [ -f "/kong/config.template.yaml" ]; then
    echo "Kong Custom Entrypoint: Found custom configuration template at /kong/config.template.yaml"

    envsubst < /kong/config.template.yaml > /kong/config.yaml

    export KONG_DECLARATIVE_CONFIG=/kong/config.yaml
else
    echo "Kong Custom Entrypoint: No custom configuration template found, using default kong.conf"
fi

. /docker-entrypoint.sh