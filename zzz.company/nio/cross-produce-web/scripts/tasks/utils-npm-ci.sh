set -ex

if [ "$(md5sum /lap-ci-deps/package-lock.json | awk '{print $1}')x" == "$(md5sum package-lock.json | awk '{print $1}')x" ]; then
  mv /lap-ci-deps/node_modules ./;
else
  npm install --force;
fi
