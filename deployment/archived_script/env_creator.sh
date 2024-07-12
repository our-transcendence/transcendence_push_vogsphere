#! /bin/sh


#check if GH_TOKEN is set
if [ -z "${GH_TOKEN}" ]
then
    printf "\033[0;31mno Github token in env\n\033[0mPlease make sure to set your environement variable GH_TOKEN\nExiting...\n"
    exit 69
fi

#check if 42_API_KEY is set
if [ -z "${SECRET_42}" ]
then
    printf "\033[0;31mno 42 api key in env\n\033[0mPlease make sure to set your environement variable SECRET_42\nExiting...\n"
    exit 69
fi


#get all folders in the deployment directory
folders=$(ls -d */)

#create root .env file and fill it wiht the github token env variable

if [ ! -f ".env" ]
then
    echo "Creating .env file in root"
    touch .env
    echo "GITHUB_TOKEN=$GH_TOKEN" > .env
fi

#create a string to be put in all .env files

env_string="POSTGRES_PASSWORD=password\nPOSTGRES_USER=service_user\nPOSTGRES_DB=service_db\nGITHUB_TOKEN=$GH_TOKEN\nINTER_SERVICE_KEY=$GH_TOKEN"

#delete / at the end of the folder name
folders=$(echo "$folders" | sed 's/\///g')

#create in all folder a "folder.env" file
for folder in $folders
do
    if [ "$folder" = "ssl" ]
    then
        continue
    fi
    if [ -f "$folder/$folder.env" ]
    then
        continue
    fi
    echo "Creating .env file in $folder"
    touch "$folder/$folder.env"
    echo "$env_string" > "$folder"/"$folder".env
    if [ "$folder" = "game_provider" ]
    then
        printf "deploying in local or on server ? (l/s)"
        read -r answer
        if [ "$answer" = "l" ]
        then
            echo "PONG_HOSTS=http://127.0.0.1" >> game_provider/game_provider.env
        else
            printf "Please enter the IP of the pong service"
            read -r ip
            echo "PONG_HOSTS=${ip}" >> game_provider/game_provider.env
        fi
    fi
done

# add the 42 api key in the auth service
echo "API_42_SECRET=$SECRET_42" >> auth/auth.env

echo "All .env files created"
exit 0

