#!/bin/bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm use 22 > /dev/null 2>&1
cd /home/vintage/tmp-groit
exec node node_modules/.bin/next dev --port 3000
