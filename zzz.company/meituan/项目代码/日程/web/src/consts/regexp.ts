/*
 * @Description: 文件描述
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-11 21:13:25
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-11-22 17:56:14
 * @FilePath: /scheduleweb/src/consts/regexp.ts
 */

export const TOP_LEVEL_DOMAIN = 'design|museum|travel|aero|arpa|asia|coop|info|jobs|mobi|name|biz|cat|com|edu|gov|int|mil|net|org|pro|tel|xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sk|sl|sm|sn|so|sr|ss|st|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw|dp|product|app|dev|team|today|fun';

export const REG_URL_STR = `${'(?:(https?|ftp|mtdaxiang):\\/\\/)?' // 匹配协议，  $1
    + '(?:(@)?' // 作为向前查找的hack，   $2
    + '(\\d{1,3}(?:\\.\\d{1,3}){3})|' // 匹配ip，  $3
    + '((?:[-a-z_0-9]{1,256}\\.){1,256}(?:'}${TOP_LEVEL_DOMAIN})\\b)` // 匹配域，  $4
    + ')'
    + '(:\\d{1,5})?' // 匹配端口,  $5
    + '(\\/[-a-z_0-9@:%+.~&/=()!\',*$]*)?' // 匹配路径 $6
    + '(\\?[-a-z_0-9@:%+.~&/=()!\',;{}*?$]*)?' // 匹配查询参数   $7
    + '(\\#[-a-z_0-9@:%+.~&/=()!\',;{}*?#^$]*)?'; // 匹配锚点，   $8

export const REG_URL = new RegExp(REG_URL_STR, 'gi');

export const REG_SPEIL_URL = `\\[[^\\|]+\\|${REG_URL_STR}\\]`;

export const REG_SPEIL = new RegExp(REG_SPEIL_URL, 'gi');
