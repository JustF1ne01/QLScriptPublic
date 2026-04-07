/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description: 康师傅
cron: 12 12 * * *
------------------------------------------
#Notice:   只适用于购买了luflytoken的  购买联系QQ860562056
变量wxcenter 填写自己部署的wxxcenter的域名，
变量wxid_ksf  在程序内登录的wxid   多账号&分割或者换行

⚠️【免责声明】
------------------------------------------
1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
*/

const $ = new Env("康师傅");
let ckName = `wxid_ksf`;
const strSplitor = "#";
const envSplitor = ["&", "\n"];
const notify = $.isNode() ? require("../sendNotify") : "";
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"
let wxcenter = process.env.wxcenter || ""
let appid = 'wx54f3e6a00f7973a7'
class Public {
    request(options) {
        return axios.request(options);
    }
}
class Task extends Public {
    constructor(env) {

        super();
        this.index = $.userIdx++
        let user = env.split(strSplitor);
        this.wxid = user[0];
        this.passwd = user[1];
    }

    async getcode() {
        let options = {
            url: `${wxcenter}/api/Wxapp/JSLogin`,
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            data: { "Wxid": "" + this.wxid, "Appid": "" + appid }
        }
        let { data: result } = await this.request(options);
        if (result.Success) {
            let code = result.Data.code
            $.log(`账号[${this.index}]【${this.name}】 获取code成功[${code}]`);
            await this.login(code)
        } else {
            console.log(result);
        }


    }
    async login(code) {
        let options = {
            url: `https://nclub.gdshcm.com/pro/whale-member/api/login/login`,
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            data: { "code": "" + code, "inviterId": "", "inviterType": 1, "inviterMatchUserId": "", "spUrl": null }
        }
        let { data: result } = await this.request(options);
        if (result.code == 0) {
            let token = result.data.token
            $.log(`账号[${this.index}]【${this.name}】 登录成功`);
            await this.signIn(token)
        } else {
            console.log(result);

        }

    }
    async signIn(token) {
        let options = {
            url: ` https://club.biqr.cn/api/signIn/integralSignIn`,
            headers: {
                'Content-Type': 'application/json',
                'token': "" + token
            },
            method: 'POST',
            data: {}
        }
        let { data: result } = await this.request(options);
        if (result.code == 0) {
            $.log(`账号[${this.index}]【${this.name}】 签到成功`);
        } else {
            console.log(result);

        }




    }
    async run() {
        if (!wxcenter) $.log(`请填写wxcenter`)
        await this.getcode()
    }
}


!(async () => {
    await getNotice()
    $.checkEnv(ckName);

    for (let user of $.userList) {
        //

        await new Task(user).run();

    }


})()
    .catch((e) => console.log(e))
    .finally(() => $.done());

async function getNotice() {
    let options = {
        url: `https://ghproxy.net/https://raw.githubusercontent.com/smallfawn/Note/refs/heads/main/Notice.json`,
        headers: {
            "User-Agent": defaultUserAgent,
        }
    }
    let { data: res } = await new Public().request(options);
    $.log(res)
    return res
}


// prettier-ignore
function Env(t, s) {
    return new (class {
        constructor(t, s) {
            this.userIdx = 1;
            this.userList = [];
            this.userCount = 0;
            this.name = t;
            this.notifyStr = [];
            this.logSeparator = "\n";
            this.startTime = new Date().getTime();
            Object.assign(this, s);
            this.log(`\ud83d\udd14${this.name},\u5f00\u59cb!`);
        }
        checkEnv(ckName) {
            let userCookie = (this.isNode() ? process.env[ckName] : "") || "";
            this.userList = userCookie.split(envSplitor.find((o) => userCookie.includes(o)) || "&").filter((n) => n);
            this.userCount = this.userList.length;
            this.log(`共找到${this.userCount}个账号`);
        }
        async sendMsg() {
            this.log("==============📣Center 通知📣==============")
            for (let i = 0; i < this.notifyStr.length; i++) {
                if (Object.prototype.toString.call(this.notifyStr[i]) === '[object Object]' ||
                    Object.prototype.toString.call(this.notifyStr[i]) === '[object Array]') {
                    this.notifyStr[i] = JSON.stringify(this.notifyStr[i]);
                }
            }

            let message = this.notifyStr.join(this.logSeparator);
            if (this.isNode()) {
                await notify.sendNotify(this.name, message);
            } else {
            }
        }
        isNode() {
            return "undefined" != typeof module && !!module.exports;
        }

        queryStr(options) {
            return Object.entries(options)
                .map(
                    ([key, value]) =>
                        `${key}=${typeof value === "object" ? JSON.stringify(value) : value
                        }`
                )
                .join("&");
        }
        getURLParams(url) {
            const params = {};
            const queryString = url.split("?")[1];
            if (queryString) {
                const paramPairs = queryString.split("&");
                paramPairs.forEach((pair) => {
                    const [key, value] = pair.split("=");
                    params[key] = value;
                });
            }
            return params;
        }
        isJSONString(str) {
            try {
                return JSON.parse(str) && typeof JSON.parse(str) === "object";
            } catch (e) {
                return false;
            }
        }
        isJson(obj) {
            var isjson =
                typeof obj == "object" &&
                Object.prototype.toString.call(obj).toLowerCase() ==
                "[object object]" &&
                !obj.length;
            return isjson;
        }

        randomNumber(length) {
            const characters = "0123456789";
            return Array.from(
                { length },
                () => characters[Math.floor(Math.random() * characters.length)]
            ).join("");
        }
        randomString(length) {
            const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
            return Array.from(
                { length },
                () => characters[Math.floor(Math.random() * characters.length)]
            ).join("");
        }
        uuid() {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
                /[xy]/g,
                function (c) {
                    var r = (Math.random() * 16) | 0,
                        v = c == "x" ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                }
            );
        }
        time(t) {
            let s = {
                "M+": new Date().getMonth() + 1,
                "d+": new Date().getDate(),
                "H+": new Date().getHours(),
                "m+": new Date().getMinutes(),
                "s+": new Date().getSeconds(),
                "q+": Math.floor((new Date().getMonth() + 3) / 3),
                S: new Date().getMilliseconds(),
            };
            /(y+)/.test(t) &&
                (t = t.replace(
                    RegExp.$1,
                    (new Date().getFullYear() + "").substr(4 - RegExp.$1.length)
                ));
            for (let e in s) {
                new RegExp("(" + e + ")").test(t) &&
                    (t = t.replace(
                        RegExp.$1,
                        1 == RegExp.$1.length
                            ? s[e]
                            : ("00" + s[e]).substr(("" + s[e]).length)
                    ));
            }
            return t;
        }

        log(content) {
            this.notifyStr.push(content)
            console.log(content)
        }
        wait(t) {
            return new Promise((s) => setTimeout(s, t));
        }
        async done(t = {}) {
            await this.sendMsg();
            const s = new Date().getTime(),
                e = (s - this.startTime) / 1e3;
            this.log(
                `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`
            );
            if (this.isNode()) {
                process.exit(1);
            }
        }
    })(t, s);
}