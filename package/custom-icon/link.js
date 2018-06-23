var fs = require("fs");
var path = require("path");
console.log('linking custom-icon');

var buildGradlePath = path.join("android", "app", "build.gradle");

if (!fs.existsSync(buildGradlePath)) {
    console.error(`Couldn't find build.gradle file. You might need to update it manually. Please refer to plugin installation section for Android at driver-icon`);
    return;
}

// 2. Add the codepush.gradle build task definitions
var buildGradleContents = fs.readFileSync(buildGradlePath, "utf8");
var reactGradleLink = buildGradleContents.match(/\napply from: ["'].*?react\.gradle["']/)[0];
var customGradleLink = `apply from: "../../package/custom-icon/fonts.gradle"`;
if (~buildGradleContents.indexOf(customGradleLink)) {
    console.log(`"fonts.gradle" is already linked in the build definition`);
} else {
    buildGradleContents = buildGradleContents.replace(reactGradleLink,
        `${reactGradleLink}\n${customGradleLink}`);
    fs.writeFileSync(buildGradlePath, buildGradleContents);
}