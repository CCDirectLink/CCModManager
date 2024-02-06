#!/bin/sh
BASE_NAME="$(jq '.id' ccmod.json | sed 's/^"//;s/"$//')"
NAME="${BASE_NAME}-$(jq '.version' ccmod.json | sed 's/^"//;s/"$//').ccmod"
rm -rf "$BASE_NAME"*
echo not running in build mode
npm install
# npm run build
npm run start
zip -r "$NAME" ./ -x "*.ccmod" "*.zip" "node_modules/*" ".git*" "*.ts" "*.md" \
    "tsconfig.json" "*.sh" "package-lock.json" "pack/*" "bundle.zip" ".prettierrc.json" \
    "*.kra" "*.kra~" "*.png~" "src/*"
