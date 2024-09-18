// 如何使用正则验证 18 位身份号码（字节一面）

const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/;

function validateIdCard(idCard) {
    return idCardRegex.test(idCard);
}

// 测试代码
const testIds = [
    "11010519491231002X", // 有效身份证
    "11010519491231002",  // 无效身份证（少一位）
    "11010519491331002X", // 无效身份证（月份错误）
    "11010519491232002X", // 无效身份证（日期错误）
    "21010519491231002X"  // 有效身份证
];

testIds.forEach(id => {
    console.log(`身份证号 ${id} 验证结果: ${validateIdCard(id)}`);
});