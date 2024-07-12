import os
import subprocess

def run_command(command):
    result = subprocess.run(command, capture_output=True, text=True)
    output = result.stdout.strip()
    return output


HOST = os.getenv("HOST", run_command("hostname"))
try:
    GH = os.environ["GITHUB_TOKEN"]
    ft = os.environ["SECRET_42"]
    ft_uid = os.environ["UID_42"]
    pong_host = os.environ["PONG_HOSTS"]
    gf_host = os.environ["GF_HOSTS"]
except KeyError as e:
    print(f"KeyError: {e}")
    exit (1)

subfolders = [f for f in os.walk('.')][0][1]  # Extracts the second element of the tuple (dirnames)

env_string=f"POSTGRES_PASSWORD=password\nPOSTGRES_USER=service_user\nPOSTGRES_DB=service_db\nGITHUB_TOKEN={GH}\nINTER_SERVICE_KEY={GH}\nHOST={HOST}\n"

for folder in subfolders:
    if folder == '.git' or folder =="ssl" or folder == 'archived_script':
        continue
    print(f'creating {folder}/{folder}.env file')
    with open(f'{folder}/{folder}.env', "w") as f:
        f.write(env_string)
        if folder == "game_provider":
            f.write(f"PONG_HOSTS='{pong_host}'")
            f.write(f"GF_HOSTS='{gf_host}'")

with open("auth/auth.env", "a") as f:
    f.write(f"\nAPI_42_SECRET={ft}")
    f.write(f"\nAPI_42_UID={ft_uid}")

print("all .env created")
