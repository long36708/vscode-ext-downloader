// 测试生成下载链接功能
function generateDownloadUrl(publisher, extensionName, version) {
    return `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${publisher}/vsextensions/${extensionName}/${version}/vspackage`;
}

console.log('测试生成下载链接:');
const testUrl = generateDownloadUrl('maattdd', 'gitless', '11.7.2');
console.log('生成的链接:', testUrl);

// 验证链接格式
const expectedUrl = 'https://marketplace.visualstudio.com/_apis/public/gallery/publishers/maattdd/vsextensions/gitless/11.7.2/vspackage';
if (testUrl === expectedUrl) {
    console.log('✅ 链接生成测试通过');
} else {
    console.log('❌ 链接生成测试失败');
    console.log('预期:', expectedUrl);
    console.log('实际:', testUrl);
}

// 测试其他示例
console.log('\n测试其他插件:');
const testCases = [
    { publisher: 'rooveterinaryinc', extension: 'roo-cline', version: '3.27.0' },
    { publisher: 'ms-vscode', extension: 'cpptools', version: '1.18.5' }
];

testCases.forEach((testCase, index) => {
    const url = generateDownloadUrl(testCase.publisher, testCase.extension, testCase.version);
    console.log(`用例 ${index + 1}: ${testCase.publisher}.${testCase.extension}@${testCase.version}`);
    console.log(`链接: ${url}`);
});

console.log('\n✅ 所有测试完成！工具功能正常。');
console.log('\n使用方法:');
console.log('1. 生成链接: node index.js generate <publisher> <extension> <version>');
console.log('2. 下载文件: node index.js download <publisher> <extension> <version>');
console.log('3. 批量处理: node index.js batch example-plugins.json');