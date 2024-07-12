#!/bin/bash

cd /website || exit

npm i
npm run build

nginx -g "daemon off;"
