const gulp = require("gulp");
const typescript = require("typescript");
const typescriptCompiler = require("gulp-typescript");
const merge = require("merge2");
const del = require("del");
const runSeq = require("run-sequence").use(gulp);

gulp.task("clean",() => {
    return del(["dist/**"]);
});

gulp.task("typescript", function () {
    const typescriptProject = typescriptCompiler.createProject("tsconfig.json", {
        typescript: typescript,
        declaration: true
    });

    const tsResult = typescriptProject
        .src()
        .pipe(typescriptProject())

    return merge([ // Merge the two output streams, so this task is finished when the IO of both operations is done. 
        tsResult.dts.pipe(gulp.dest("./dist")),
        tsResult.js.pipe(gulp.dest("./dist"))
    ]);
});

gulp.task("default", (done) => runSeq("clean", "typescript", done));
