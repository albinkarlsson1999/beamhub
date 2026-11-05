set -e

cd /opt/beamhub

git pull

npm install

sudo systemctl restart beamhub