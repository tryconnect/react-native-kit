var fs = require("fs");
var path = require("path");
console.log('unlinking custom-icon');

var buildGradlePath = path.join("android", "app", "build.gradle");

if (!fs.existsSync(buildGradlePath)) {
    console.error(`Couldn't find build.gradle file. You might need to update it manually. Please refer to plugin installation section for Android at izifix-icon`);
    return;
}

// 2. Add the codepush.gradle build task definitions
var buildGradleContents = fs.readFileSync(buildGradlePath, "utf8");
var customGradleLink = `apply from: "../../package/custom-icon/fonts.gradle"`;
if (~buildGradleContents.indexOf(customGradleLink)) {
    
    buildGradleContents = buildGradleContents.replace(customGradleLink, "");
    fs.writeFileSync(buildGradlePath, buildGradleContents);
}