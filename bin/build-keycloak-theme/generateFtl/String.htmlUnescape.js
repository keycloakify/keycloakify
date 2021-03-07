
var es = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;

var unes = {
    '&amp;': '&',
    '&#38;': '&',
    '&lt;': '<',
    '&#60;': '<',
    '&gt;': '>',
    '&#62;': '>',
    '&apos;': "'",
    '&#39;': "'",
    '&quot;': '"',
    '&#34;': '"'
};
var cape = function (m) { return unes[m]; };

Object.defineProperty(
    String,
    "htmlUnescape",
    {
        "value": function (un) {
            return String.prototype.replace.call(un, es, cape);
        }
    }
);
