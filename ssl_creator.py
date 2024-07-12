import os
import subprocess
import shutil
import glob

try:
	subprocess.run("openssl", shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
except subprocess.CalledProcessError:
	print("OpenSSL not found, please install it first")
	exit(1)


if os.path.isdir('ssl'):
	if not len(os.listdir('ssl')) == 0:
		print("ssl folder not empty, ignoring ssl certificate creation")
		exit(0)

os.mkdir('./ssl')
subprocess.run(["openssl", "req", "-x509", "-newkey", "rsa:4096", "-keyout", "./ssl/key.pem", "-out", "./ssl/cert.pem", "-sha256", "-days", "3650", "-nodes", "-subj", "/C=XX/ST=France/L=Lyon/O=42/OU=42Lyon/CN=42"], check=True)

#get all folder following the pattern */requirements/nginx
nginx_folders = glob.glob('*/requirements/nginx')

#Copy ssl folder in every */requirements/nginx
for folder in nginx_folders:
		shutil.copytree('ssl', folder + '/ssl', dirs_exist_ok=True)


shutil.copytree('ssl', 'front-end/ssl', dirs_exist_ok=True)

shutil.copytree('ssl', 'game_launcher/requirements/game_launcher/ssl', dirs_exist_ok=True)
shutil.copytree('ssl', 'gunfight_launcher/requirements/game_launcher/ssl', dirs_exist_ok=True)
