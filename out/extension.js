"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const https = require("https");
var langsConfig = [['Java', 'java', 'Main.java'], ['Python', 'python', 'main.py'], ['C', 'c', 'HelloWorld.c'],
    ['C++', 'cpp', 'HelloWorld.cpp'], ['NodeJS', 'nodejs', 'index.js'], ['Javascript', 'javascript', 'HelloWorld.js'],
    ['Groovy', 'groovy', 'Main.groovy'], ['JShell', 'jshell', 'script.jsh'], ['Haskell', 'haskell', 'HelloWorld.hs'],
    ['Tcl', 'tcl', 'HelloWorld.tcl'], ['Lua', 'lua', 'HelloWorld.lua'], ['Ada', 'ada', 'HelloWorld.adb'],
    ['CommonLisp', 'commonlisp', 'HelloWorld.lsp'], ['D', 'd', 'HelloWorld.d'], ['Elixir', 'elixir', 'HelloWorld.ex'],
    ['Erlang', 'erlang', 'helloworld.erl'], ['F#', 'fsharp', 'HelloWorld.fs'], ['Fortran', 'fortran', 'HelloWorld.ftn'],
    ['Assembly', 'assembly', 'HelloWorld.asm'], ['Scala', 'scala', 'HelloWorld.scala'], ['Php', 'php', 'HelloWorld.php'],
    ['Python2', 'python2', 'HelloWorld.py'], ['C#', 'csharp', 'HelloWorld.cs'], ['Perl', 'perl', 'HelloWorld.pl'],
    ['Ruby', 'ruby', 'HelloWorld.rb'], ['Go', 'go', 'HelloWorld.go'], ['R', 'r', 'HelloWorld.r'], ['Racket', 'racket', 'HelloWorld.rkt'],
    ['OCaml', 'ocaml', 'HelloWorld.ml'], ['Visual Basic (VB.NET)', 'vb', 'HelloWorld.vb'], ['Bash', 'bash', 'HelloWorld.sh'],
    ['Clojure', 'clojure', 'HelloWorld.clj'], ['TypeScript', 'typescript', 'HelloWorld.ts'], ['Cobol', 'cobol', 'HelloWorld.cbl'],
    ['Kotlin', 'kotlin', 'HelloWorld.kt'], ['Pascal', 'pascal', 'HelloWorld.pas'], ['Prolog', 'prolog', 'HelloWorld.pl'],
    ['Rust', 'rust', 'HelloWorld.rs'], ['Swift', 'swift', 'HelloWorld.swift'], ['Octave', 'octave', 'HelloWorld.m'],
    ['MySQL', 'mysql', 'queries.sql'], ['PostgreSQL', 'postgresql', 'commands.sql'], ['MongoDB', 'mongodb', 'script.js'],
    ['SQLite', 'sqlite', 'queries.sql'], ['Redis', 'redis', 'commands.redis'], ['MariaDB', 'mariadb', 'commands.sql']];
function activate(context) {
    let cmd1Id = "onedoescompile.run";
    let cmd2Id = "onedoescompile.selectLang";
    var isLanguageSelected = false;
    var selectedLang = "";
    var outputChannel = vscode.window.createOutputChannel("OneDoesCompile");
    var statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBarItem.name = "OneDoesCompile";
    statusBarItem.text = "OneDoesCompile";
    statusBarItem.tooltip = "Select a language.";
    statusBarItem.command = cmd2Id;
    statusBarItem.show();
    var isOnline = false;
    var checkInternet = function () {
        require('dns').lookup('google.com', function (err) {
            if (err && err.code == "ENOTFOUND") {
                isOnline = false;
                if (isLanguageSelected) {
                    statusBarItem.tooltip = selectedLang + " selected.";
                }
                else {
                    statusBarItem.tooltip = "Select a language.";
                }
                statusBarItem.tooltip += " (Not connected)";
            }
            else {
                isOnline = true;
                if (isLanguageSelected) {
                    statusBarItem.tooltip = selectedLang + " selected.";
                }
                else {
                    statusBarItem.tooltip = "Select a language.";
                }
                statusBarItem.tooltip += " (Connected)";
            }
        });
    };
    checkInternet();
    let disposable1 = vscode.commands.registerCommand(cmd1Id, () => {
        checkInternet();
        if (!isLanguageSelected) {
            vscode.commands.executeCommand(cmd2Id, true);
        }
        else {
            let requestIdToken = https.request({ hostname: "onecompiler.com", path: "/api/getIdAndToken", method: "GET" }, async (responseIdToken) => {
                let bodyTokenStr = "";
                responseIdToken.on("data", d => {
                    bodyTokenStr += d;
                });
                responseIdToken.on("end", async () => {
                    let bodyToken = JSON.parse("{}");
                    try {
                        bodyToken = JSON.parse(bodyTokenStr);
                    }
                    catch (err) {
                        ;
                    }
                    let langIndex = langsConfig.map(element => element[0]).indexOf(selectedLang);
                    let codeContent = vscode.window.activeTextEditor?.document?.getText();
                    if (langIndex > -1 && codeContent) {
                        let options = {
                            hostname: 'onecompiler.com',
                            path: '/api/code/exec',
                            method: 'POST',
                            headers: {
                                "accept": "*/*",
                                "accept-language": "en-IN,en;q=0.9",
                                "authorization": "Bearer undefined",
                                "cache-control": "no-cache",
                                "content-type": "application/json",
                                "pragma": "no-cache",
                                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"101\", \"Google Chrome\";v=\"101\"",
                                "sec-ch-ua-mobile": "?0",
                                "sec-ch-ua-platform": "\"Windows\"",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin",
                                "Referer": "https://onecompiler.com/java/3y2rek3c8",
                                "Referrer-Policy": "strict-origin-when-cross-origin"
                            }
                        };
                        let data = {
                            "properties": {
                                "language": "",
                                "files": [
                                    {
                                        "name": "",
                                        "content": ""
                                    }
                                ],
                                "stdin": ""
                            },
                            "_id": bodyToken["id"],
                            "user": null,
                            "idToken": bodyToken["token"],
                            "visibility": "public"
                        };
                        data["properties"]["language"] = langsConfig[langIndex][1];
                        data["properties"]["files"][0]["name"] = langsConfig[langIndex][2];
                        data["properties"]["files"][0]["content"] = codeContent;
                        data["properties"]["stdin"] = await vscode.window.showInputBox() || "";
                        let requestExec = https.request(options, async (respExec) => {
                            let respBodyStr = "";
                            respExec.on("data", d => {
                                respBodyStr += d;
                            });
                            respExec.on("end", async () => {
                                let respBody = JSON.parse("{}");
                                try {
                                    respBody = JSON.parse(respBodyStr);
                                    outputChannel.appendLine((new Date()).toLocaleString());
                                    if (respBody["stdout"]) {
                                        outputChannel.appendLine(respBody["stdout"]);
                                    }
                                    if (respBody["stderr"]) {
                                        outputChannel.appendLine(respBody["stderr"]);
                                    }
                                    else if (respBody["exception"]) {
                                        outputChannel.appendLine(respBody["exception"]);
                                    }
                                    outputChannel.show(true);
                                }
                                catch (err) {
                                    ;
                                }
                            });
                        });
                        requestExec.write(JSON.stringify(data));
                        requestExec.end();
                    }
                });
            });
            requestIdToken.end();
        }
    });
    let disposable2 = vscode.commands.registerCommand(cmd2Id, (run) => {
        checkInternet();
        vscode.window.showQuickPick(langsConfig.map(element => element[0]), { title: "Languages", placeHolder: "Select Language" }).then(lang => {
            if (lang) {
                isLanguageSelected = true;
                selectedLang = lang || "";
                statusBarItem.text = "OneDoesCompile (" + selectedLang + ")";
                statusBarItem.tooltip = selectedLang + " selected.";
                if (isOnline)
                    statusBarItem.tooltip += " (Connected)";
                else
                    statusBarItem.tooltip += " (Not connected)";
                statusBarItem.show();
                if (run)
                    vscode.commands.executeCommand(cmd1Id);
            }
        });
    });
    context.subscriptions.push(disposable1);
    context.subscriptions.push(disposable2);
    context.subscriptions.push(statusBarItem);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map