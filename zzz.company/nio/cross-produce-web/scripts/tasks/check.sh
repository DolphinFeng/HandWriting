set -e

echo ' === stats ==='
(npm run check 2>/dev/null | tee check.txt | grep '^src/' | sed 's/\.ts.*$//g' | awk  -F '/' '{print $2 "/" $3}' | sort | uniq -c  | sort -nr) | tee stats.txt


echo ' === all error ==='
cat check.txt

[ -s stats-care.txt ] && exit 1 || exit 0
