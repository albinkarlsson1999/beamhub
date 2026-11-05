set -e

echo "[1/7] Updating system packages..."
sudo apt update && 
sudo apt upgrade -y

echo "[2/7] Installing system dependencies..."
sudo apt install -y
    git
    curl
    wget
    mpv
    python3
    python3-pip

echo "[3/7] Installing yt-dlp..."
sudo pip3 install --break-system-packages -U yt-dlp

echo "[4/7] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

echo "[5/7] Installing BeamHub..."
sudo mkdir -p /opt/beamhub

if [ ! -d /opt/beamhub/.git ]; then
    sudo git clone https://github.com/albinkarlsson1999/beamhub.git /opt/beamhub
else
    cd /opt/beamhub
    sudo git pull
fi

echo "[6/7] Installing npm dependencies..."
cd /opt/beamhub
sudo npm install

echo "[7/7] Installation complete."
echo ""
echo "Node: $(node -v)"
echo "npm: $(npm -v)"
echo "yt-dlp: $(yt-dlp --version)"
echo ""
echo "BeamHub installed in:"
echo "/opt/beamhub"