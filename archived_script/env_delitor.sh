#!/bin/sh

rm ./.env
folders=$(ls -d */)

#delete / at the end of the folder name
folders=$(echo "$folders" | sed 's/\///g')

for folder in $folders
do
    rm "$folder"/"$folder".env
done
echo "All .env files deleted"
