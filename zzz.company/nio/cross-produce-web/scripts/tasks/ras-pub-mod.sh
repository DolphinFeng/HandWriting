set -ex

APP=$1
RENV=${2:-dev}
RES=$APP

# echo $APP $MOD $RENV
# exit

H=$(git rev-parse --short HEAD)
HASH=${HASH:-$H}
RAS_HOST=${RAS_HOST:-ras.nioint.com}

# S.1 install deps
[ "x${CI_COMMIT_REF_SLUG}y" == "xy" ] && echo "= in debug" || bash scripts/tasks/utils-npm-ci.sh

# S.2 generate meta
echo "ref:$CI_COMMIT_REF_SLUG" >res-note.txt
git log -1 --pretty="format:@%an, %aD%n%s %b" >>res-note.txt
# ./node_modules/.bin/ts-node -T -O '{"module":"commonjs"}' scripts/tasks/ras-pub-mod.ts $MOD $APP >res-config.txt

echo "
meta:

note: $(cat res-note.txt)
config: $(cat res-config.txt)
" >/dev/null


# S.3 clean build
rm -rf build build.zip

# S.4 run build
CI=false PUBLIC_URL=//$RAS_HOST/s/r/$RES/h-$HASH/ npm run build

# S.5 package build
zip -r build.zip build/
# rm -rf build/

# S.6 upload resource
curl --fail -sv \
  -H"x-aip-username: ${GITLAB_USER_LOGIN}" \
  -F"note=<res-note.txt" \
  -F"tag=$RENV" \
  -F'file=@build.zip' \
  -F'path=build' \
  -F"hash=$HASH" \
  http://$RAS_HOST/api/ras/resources/$RES/versions

echo done
