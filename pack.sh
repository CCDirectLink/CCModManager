#!/bin/sh
set -e
BASE_NAME="$(jq '.id' ccmod.json | sed 's/^"//;s/"$//')"
NAME="${BASE_NAME}-$(jq '.version' ccmod.json | sed 's/^"//;s/"$//').ccmod"
rm -rf "$BASE_NAME"*
pnpm install
pnpm run build
mkdir -p pack
cp -rf icon LICENSE plugin.js ./pack
[ -d ./assets ] && cp -r assets ./pack
[ -d ./lang ] && cp -r lang ./pack

cd ./pack
for file in $(find . -iname '*.json') $(find . -iname '*.json.patch') $(find . -iname '*.json.patch.cond'); do
    jq '.' ../$file -c > $file
done
cp ../ccmod.json .
rm -rf icon/icon240.png
LIST="$(find . -name '*.kra') $(find . -name '*~')"
rm -rf $LIST
zip -r "../$NAME" .
cd ..
rm -rf pack
