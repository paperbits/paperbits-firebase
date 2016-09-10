var gulp = require("gulp");
var bower = require("main-bower-files");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var filter = require("gulp-filter");
var typescript = require("typescript");
var typescriptCompiler = require("gulp-typescript");

function handleErrors(error) {
    console.log("ERROR:");
    console.log(error.toString());
    this.emit("end");
}

gulp.task("default", function () {
    var tsProject = typescriptCompiler.createProject("tsconfig.json", {
        sortOutput: true,
        typescript: typescript
    });

    var tsResult = tsProject
        .src()
        .pipe(typescriptCompiler(tsProject));

    return tsResult.js
        .pipe(concat("paperbits-firebase.min.js"))
        .pipe(uglify({ mangle: false }))
        .pipe(gulp.dest("public"));
});
