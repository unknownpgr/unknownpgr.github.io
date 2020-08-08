"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var util_1 = __importDefault(require("util"));
var path_1 = __importDefault(require("path"));
var js_yaml_1 = __importDefault(require("js-yaml"));
var ncp_1 = __importDefault(require("ncp"));
var toc_1 = require("./toc");
var md2jsx_1 = require("./md2jsx");
var thumbnail_1 = require("./thumbnail");
var sitemap_1 = require("./sitemap");
/**
 * There is a difference between data for updating metadata in a blog and data for displaying a blog.
 * To update metadata, the following information is required.
 *
 * - The post's unique name (=directory name)
 * - The name of the markdown file
 *
 * In order to use it in a blog, the following information is required.
 *
 * - The post's unique name (=directory=URL)
 * - Path of generated jsx file (without extension)
 * - Path of the created toc file (without extension)
 * - Category
 * - The date the post was created
 */
// Promisified functions
var readDir = util_1.default.promisify(fs_1.default.readdir);
var listDir = function (dirPath) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, readDir(dirPath)];
        case 1: return [2 /*return*/, (_a.sent()).map(function (x) { return path_1.default.join(dirPath, x); })];
    }
}); }); };
var readFile = util_1.default.promisify(fs_1.default.readFile);
var writeFile = util_1.default.promisify(fs_1.default.writeFile);
var mkdir = util_1.default.promisify(fs_1.default.mkdir);
var asyncNcp = util_1.default.promisify(ncp_1.default);
// Find n-th appearence of pattern in string. index starts from 1.
function getNthIndexOf(str, pattern, n) {
    var l = str.length, i = -1;
    while (n-- && i++ < l) {
        i = str.indexOf(pattern, i);
        if (i < 0)
            break;
    }
    return i;
}
function asyncForEach(array, func) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, Promise.all(array.map(func))];
        });
    });
}
function failable(func) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, func()];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Split post into YAML formatter part and markdown part.
function splitPost(src) {
    var splitter = getNthIndexOf(src, "---", 2);
    var formatter = src.slice(0, splitter);
    var markdown = src.slice(splitter + 3);
    return { formatter: formatter, markdown: markdown };
}
// Parse YAML formatter string and return json
function parseFormatter(formatterStr, defaultDate) {
    var formatter = js_yaml_1.default.safeLoad(formatterStr);
    // Check required properties
    if (!formatter["title"])
        throw new Error("YAML formatter does not contain 'title' attribute.");
    if (!formatter["category"])
        throw new Error("YAML formatter does not contain 'category' attribute.");
    // Beautify date
    var date = new Date(formatter.date);
    if (isNaN(date)) {
        formatter["date"] = new Date(defaultDate);
    }
    else {
        formatter["date"] = new Date(date);
    }
    // Beautify category
    var category = formatter.category;
    category = category.replace(/( |\t|_|-)+/g, " ").toLowerCase();
    category = category.charAt(0).toUpperCase() + category.slice(1);
    formatter.category = category;
    return formatter;
}
/**
 * Generate text snippet
 */
function createSnippet(fullText) {
    var text = "";
    var split = fullText
        .replace(/(#|\r|\n|-|\|\t|`|\|| )+/g, " ")
        .trim()
        .split(" ");
    for (var i = 0; i < split.length && text.length < 100; i++) {
        text += split[i] + " ";
    }
    text = text.substr(0, 100);
    text += "...";
    return text;
}
// Get post data from post path
function updateSinglePost(postPath, setting) {
    return __awaiter(this, void 0, void 0, function () {
        var postFilePath, src, _a, formatterString, markdown, formatter, text, ret, _b, result, imgs, toc, _c, srcPath, dstPath, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    // Convert postPath to full path
                    postPath = path_1.default.resolve(postPath);
                    return [4 /*yield*/, listDir(postPath)];
                case 1:
                    postFilePath = (_e.sent()).filter(function (x) {
                        return x.endsWith(".md");
                    })[0];
                    if (!postFilePath)
                        throw new Error("There are no content file");
                    return [4 /*yield*/, readFile(postFilePath, "utf-8")];
                case 2:
                    src = _e.sent();
                    _a = splitPost(src), formatterString = _a.formatter, markdown = _a.markdown;
                    formatter = parseFormatter(formatterString, new Date());
                    return [4 /*yield*/, writeFile(postFilePath, "---\n" + js_yaml_1.default.dump(formatter) + "\n---" + markdown)];
                case 3:
                    _e.sent();
                    text = createSnippet(markdown);
                    ret = __assign({ 
                        // name==path
                        name: path_1.default.relative(path_1.default.join(setting.root, "posts"), postPath), text: text }, formatter);
                    _b = md2jsx_1.md2jsx(markdown), result = _b.result, imgs = _b.imgs;
                    toc = JSON.stringify(toc_1.getToc(result));
                    if (!(imgs.length > 0)) return [3 /*break*/, 5];
                    _c = ret;
                    return [4 /*yield*/, thumbnail_1.createThumbnail(setting, ret, imgs[0])];
                case 4:
                    _c.thumbnail = _e.sent();
                    _e.label = 5;
                case 5:
                    srcPath = path_1.default.join(setting.root, "posts", ret.name);
                    dstPath = path_1.default.join(setting.dst, "posts", ret.name);
                    _e.label = 6;
                case 6:
                    _e.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, mkdir(path_1.default.join(setting.dst, "posts", ret.name))];
                case 7:
                    _e.sent();
                    return [3 /*break*/, 9];
                case 8:
                    _d = _e.sent();
                    return [3 /*break*/, 9];
                case 9: return [4 /*yield*/, Promise.all([
                        writeFile(path_1.default.join(dstPath, setting.jsxFile), result),
                        writeFile(path_1.default.join(dstPath, setting.tocFile), toc),
                        asyncNcp(srcPath, dstPath),
                    ])];
                case 10:
                    _e.sent();
                    return [2 /*return*/, ret];
            }
        });
    });
}
function updatePosts(setting) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, pathes, posts, categories, postOrder;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, mkdir(path_1.default.join(setting.dst, "posts"))];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3: return [4 /*yield*/, listDir(path_1.default.join(setting.root, "posts"))];
                case 4:
                    pathes = (_b.sent()).filter(function (x) { return fs_1.default.statSync(x).isDirectory(); });
                    posts = {};
                    categories = {};
                    postOrder = [];
                    return [4 /*yield*/, asyncForEach(pathes, function (path) {
                            return __awaiter(this, void 0, void 0, function () {
                                var postData, name, category;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, updateSinglePost(path, setting)];
                                        case 1:
                                            postData = _a.sent();
                                            name = postData.name, category = postData.category;
                                            // Build posts dictionary
                                            posts[name] = postData;
                                            // Build post order list
                                            postOrder.push(postData.name);
                                            // Build category dictionary
                                            if (categories[category])
                                                categories[category].count++;
                                            else
                                                categories[category] = { count: 1 };
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        })];
                case 5:
                    _b.sent();
                    // Sort post names in postOrder list by date and add order property.
                    postOrder = postOrder.sort(function (a, b) { return posts[b].date.getTime() - posts[a].date.getTime(); });
                    postOrder.forEach(function (post, i) {
                        posts[post].order = i;
                    });
                    // Remove root from setting
                    setting.root = "";
                    return [2 /*return*/, {
                            posts: posts,
                            categories: categories,
                            setting: setting,
                            postOrder: postOrder,
                        }];
            }
        });
    });
}
// Generate pages for redirection.
function createRedirection(setting, meta) {
    return __awaiter(this, void 0, void 0, function () {
        var publicDir, posts, task, tasks, key;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    publicDir = setting.publicDir;
                    posts = meta.posts;
                    return [4 /*yield*/, failable(function () { return mkdir(path_1.default.join(publicDir, "posts")); })];
                case 1:
                    _a.sent();
                    task = function (key) { return __awaiter(_this, void 0, void 0, function () {
                        var name, pathname, url;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    name = posts[key].name;
                                    pathname = path_1.default.join(publicDir, "posts", name, "index.html");
                                    url = "/?page=" + encodeURIComponent("/posts/" + name);
                                    return [4 /*yield*/, failable(function () { return mkdir(path_1.default.join(publicDir, "posts", name)); })];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, writeFile(pathname, "<script>window.location.replace('" + url + "');</script>")];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    tasks = [];
                    for (key in meta.posts) {
                        tasks.push(task(key));
                    }
                    return [2 /*return*/, Promise.all(tasks)];
            }
        });
    });
}
function main(setting) {
    return __awaiter(this, void 0, void 0, function () {
        var dst, publicDir, meta, urls, sitemap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dst = setting.dst, publicDir = setting.publicDir;
                    console.log("Updating posts...");
                    return [4 /*yield*/, updatePosts(setting)];
                case 1:
                    meta = _a.sent();
                    return [4 /*yield*/, writeFile(path_1.default.join(dst, "meta.json"), JSON.stringify(meta))];
                case 2:
                    _a.sent();
                    console.log("Generating redirection pages...");
                    createRedirection(setting, meta);
                    console.log("Generating sitemap...");
                    urls = sitemap_1.getUrlsFromMeta("https://unknownpgr.github.io/", meta);
                    sitemap = sitemap_1.getSitemap(urls);
                    return [4 /*yield*/, writeFile(path_1.default.join(publicDir, "sitemap.xml"), sitemap)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// // Call main function with parameters
main({
    root: path_1.default.join(__dirname, ".."),
    dst: path_1.default.join(__dirname, "..", "src"),
    publicDir: path_1.default.join(__dirname, "..", "public"),
    jsxFile: "view.jsx",
    tocFile: "toc.json",
}).then(function () { return console.log("All tasks finished."); });
