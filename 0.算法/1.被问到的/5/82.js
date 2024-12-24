// CSS 颜色转换

// #0000FF => rgb(0, 0, 255)
// #A37 => rgb(170, 51, 119)
// #huahs => invalid

function hexToRgb(hex) {
    // Check if the hex code is valid
    const validHex = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
    if (!validHex.test(hex)) {
        return 'invalid';
    }

    // Normalize the hex code to 6 digits
    if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }

    // Convert hex to RGB
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgb(${r}, ${g}, ${b})`;
}

// Example usage:
console.log(hexToRgb('#0000FF')); // 'rgb(0, 0, 255)'
console.log(hexToRgb('#A37')); // 'rgb(170, 51, 119)'
console.log(hexToRgb('#huahs')); // 'invalid'