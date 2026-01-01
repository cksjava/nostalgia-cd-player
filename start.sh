#/bin/bash
set -e

chmod +x setup-cd-transport.sh
./setup-cd-transport.sh

cat > /etc/nginx/sites-available/cd-transport <<"EOF"
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo rm -rf /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/cd-transport /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

chmod +x build-and-sync-frontend.sh
./build-and-sync-frontend.sh

sudo cp -rvf cd-transport /opt

cd /opt/cd-transport/backend
npm install
cd /home/chandrakant/nostalgia-cd-player

sudo apt update
sudo apt install -y avahi-daemon
sudo systemctl enable --now avahi-daemon

chmod a+x setup-backend-autostart.sh
./setup-backend-autostart.sh
