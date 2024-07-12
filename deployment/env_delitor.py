import os

subfolders = [f for f in os.walk('.')][0][1]  # Extracts the second element of the tuple (dirnames)

for folder in subfolders:
    if folder == '.git' or folder =="ssl" or folder == 'archived_script':
        continue
    try:
        os.remove(f'{folder}/{folder}.env')
    except FileNotFoundError:
        pass

print("all .env deleted")
