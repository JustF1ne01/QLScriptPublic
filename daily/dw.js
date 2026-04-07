/*
------------------------------------------
@Author: sm
@Date: 2024.06.07 19:15
@Description:  得物APP 0元抽
cron: 30 8 * * *
------------------------------------------
#Notice:   
得物0元抽
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
const CryptoJS = require("crypto-js");
const { Env } = require("./tools/env")
const $ = new Env("得物0元抽");
let ckName = `dwck`;
const strSplitor = "#";
process.env[ckName] = "a"
const axios = require("axios");
const defaultUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.31(0x18001e31) NetType/WIFI Language/zh_CN miniProgram"


class Task {
	constructor(env) {
		this.index = $.userIdx++
		this.user = env.split(strSplitor);
		this.token = this.user[0];

	}

	async run() {

		await this.zeroLotteryList()
	}

	async zeroLotteryList() {
		let data = { "source": "wotab" }
		try {
			let result = await this.taskRequest_task("post", `https://app.dewu.com/api/v1/h5/oss-platform/hacking-zero-lottery/v1/activity/query-today?sign=${this.calculateSign(data)}`, data)
			console.log(result);

			if (result.code == 200) {
				for (let i of result.data.activityList) {
					let taskStatus = false
					if (i.status == 0) {
						if ("taskVo" in i) {
							await this.DoTask(i.taskVo)

						} else {
							await this.zeroLotteryEgnageIn(i.id)
						}
					}
				}
			} else {
				$.log(`❌账号[${this.index}] 获取0元购列表失败[${result.msg}]🎉`)
				//console.log(result);
			}
		} catch (e) {
			console.log(e);
		}
	}


	async DoTask(body) {
		try {
			let taskStatusResult = {};
			let commitBody = {};
			let preStatus = false
			if (body.taskType == 50) {
				taskStatusResult = await this.taskRequest_task("get", `https://app.dewu.com/hacking-task/v1/task/status?taskId=${body.taskId}&taskType=50&sign=94fd23c93d62ae0f75108f94c093b198`)
				if (taskStatusResult.code == 200) {
					if (taskStatusResult.data.status == 1) {
						//$.log(`账号[${this.index}] 开始任务成功🎉`)
						commitBody = { "taskId": body.taskId, "taskType": String(body.taskType), "btd": 0, spuId: 0 }
						preStatus = true
					}
				}
			}
			if (body.taskType == 1) {
				if ("classify" in body) {
					if (body.classify == 2) {
						taskStatusResult = await this.taskRequest_task("post", `https://app.dewu.com/hacking-task/v1/task/pre_commit?sign=b7382f4d908e04356f9646688afe096c`, { taskId: body.taskId, taskType: body.taskType, btn: 0 })
						//console.log(taskStatusResult);
						if (taskStatusResult.code == 200) {
							if (taskStatusResult.data.isOk == true) {
								//$.log(`账号[${this.index}] 开始任务成功🎉`)
								$.log(`延迟${body.countdownTime + 1}秒浏览${body.taskName}`)
								await $.wait((body.countdownTime + 1) * 1000)
								commitBody = { "taskId": body.taskId, "taskType": String(body.taskType), "activityType": null, "activityId": null, "taskSetId": null, "venueCode": null, "venueUnitStyle": null, "taskScene": null, "btd": 0 }
								preStatus = true
							}
						} else {
							$.log(`❌账号[${this.index}] 开始任务失败[${taskStatusResult.msg}]`);
						}
					}
				} else {
					/*taskStatusResult = await this.taskRequest_task("post", `https://app.dewu.com/hacking-task/v1/task/pre_commit?sign=b7382f4d908e04356f9646688afe096c`, { taskId: body.taskId, taskType: body.taskType, btn: 0 })
					if (taskStatusResult.code == 200) {
						if (taskStatusResult.data.isOk == true) {
							//$.log(`账号[${this.index}] 开始任务成功🎉`)
							await $.wait(16000)
							commitBody = { "taskId": body.taskId, "taskType": body.taskType, "activityType": null, "activityId": null, "taskSetId": null, "venueCode": null, "venueUnitStyle": null, "taskScene": null, "btd": 0 }
							preStatus = true
						}
					} else {
						$.log(`❌账号[${this.index}] 开始任务失败[${taskStatusResult.msg}]`);
					}*/
				}


			}
			if (body.taskType == 123 || body.taskType == 124) {
				commitBody = { "taskType": String(body.taskType) }
				preStatus = true
			}
			//console.log(taskStatusResult)
			if (preStatus == true) {
				let commitResult = await this.taskRequest_task("post", `https://app.dewu.com/hacking-task/v1/task/commit?sign=826988b593cd8cd75162b6d3b7dade15`, commitBody)
				//console.log(commitResult)
				if (commitResult.code == 200) {
					if (commitResult.data.status == 2) {
						$.log(`账号[${this.index}] [${body.taskName}]任务成功🎉`)
						return true
					} else {
						$.log(`账号[${this.index}] [${body.taskName}]任务失败🎉`)
					}
				} else {
					$.log(`账号[${this.index}] [${body.taskName}]任务失败🎉`)
				}
			} else {
				return false
			}
		} catch (e) {
			console.log(e);
		}

	}
	generateIds() {
		var Uo = Array(32);
		var oe = "0000000000000000";

		function Ho(e) {
			for (var t = 0; t < 2 * e; t++)
				Uo[t] = Math.floor(16 * Math.random()) + 48,
					Uo[t] >= 58 && (Uo[t] += 39);
			return String.fromCharCode.apply(null, Uo.slice(0, 2 * e));
		}

		var Mo = "00000000000000000000000000000000"; // Assuming Mo is defined somewhere else in your code

		var generateSpanId = function () {
			return function (e) {
				var t = e(8);
				if (t === oe)
					return Mo;
				return t;
			}(Ho);
		};

		var generateTraceId = function () {
			return function (e) {
				var t = Math.floor(Date.now() / 1e3).toString(16),
					n = e(8),
					r = e(3);
				return "f5" + r + t + n;
			}(Ho);
		};

		return "00-" + generateTraceId() + "-" + generateSpanId() + "-01"
	};
	async taskRequest_task(method, url, data = "") {


		let headers = {
			"Host": "app.dewu.com",
			"Connection": "keep-alive",
			//"Content-Length": "62",
			//"ua": "duapp/5.37.0(android;10)",
			//"Origin": "https://cdn-m.dewu.com",
			//"appid": "h5",
			"SK": this.sk,
			"x-auth-token": "Bearer " + this.ck,

			"traceparent": this.generateIds(),
			"Content-Type": "application/json",

			/*"X-Requested-With": "com.shizhuang.duapp",
			"Sec-Fetch-Site": "same-site",
			"Sec-Fetch-Mode": "cors",
			"Referer": "https://cdn-m.dewu.com/h5-growth/game-task?gameTaskFlag=true&taskId=Nr52k&taskType=50&countdownIcon=%7B%22countdownIcon%22%3A%22https%3A%2F%2Fcdn.poizon.com%2Fnode-common%2F28c7b3d4060e086551dcc84eca7bfbeb.png%22%2C%22hideCountdownIcon%22%3A%22https%3A%2F%2Fcdn.poizon.com%2Fnode-common%2Fa8b472c7622a53454d82745345cefa71.png%22%2C%22coordinate%22%3A%2212%2C600%22%7D&scrollbarColor=%2301C1C2&fontColor=%23FFFFFF&btd=83500&goodsCollect=goodsDetail&popId=0",
			"Accept-Encoding": "gzip, deflate",
			"Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",*/
			"Cookie": `duToken=${this.duToken};`
		}
		const reqeuestOptions = {
			url: url,
			method: method,
			headers: headers
		}
		data == "" ? "" : Object.assign(reqeuestOptions, { data: JSON.stringify(data) })
		//console.log(reqeuestOptions)
		try {
			let { data: result } = await axios.request(reqeuestOptions)
			return result
		} catch (error) {
			// $.log(`接口请求失败 `)
			return { code: 0, msg: "接口请求失败" }
		}
		//

	}
	createEncryptedBody(data) {
		const key2 = "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANMGZPlLobHYWoZyMvHD0a6emIjEmtf5Z6Q++VIBRulxsUfYvcczjB0fMVvAnd1douKmOX4G690q9NZ6Q7z/TV8CAwEAAQ==";
		const publicKeyPem = '-----BEGIN PUBLIC KEY-----\n' +
			key2 +
			'-----END PUBLIC KEY-----';

		global["window"] = {}
		const jsencrypt = require("jsencrypt")
		const crypt = new jsencrypt()
		crypt.setKey(publicKeyPem)
		const n = this.randomStr(48, 16);
		const encrypted = crypt.encrypt(n)
		const enBody = CryptoJS.enc.Utf8.parse(data);
		const enResult = CryptoJS.AES.encrypt(enBody, CryptoJS.enc.Utf8.parse(n.substr(10, 16)), {
			iv: CryptoJS.enc.Utf8.parse(n.substr(20, 16)),
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7,
		});
		//console.log(encrypted);
		//console.log(hexToBase64(encrypted));
		const newBody = {
			data: encrypted + "​" + enResult.ciphertext.toString().toUpperCase(),
		};
		newBody.sign = this.calculateSign(newBody);
		return { enData: newBody, n };
		function hexToBase64(hexString) {
			const buffer = Buffer.from(hexString, 'hex');
			const base64String = buffer.toString('base64');
			return base64String;
		}
	}
	randomStr(length, charset) { var tmp1, tmp2, data = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""), result = []; if (((charset = charset || data["length"]), length)) for (tmp1 = 0; tmp1 < length; tmp1++)result[tmp1] = data[0 | (Math.random() * charset)]; else for (result[8] = result[13] = result[18] = result[23] = "-", result[14] = "4", tmp1 = 0; tmp1 < 36; tmp1++)result[tmp1] || ((tmp2 = 0 | (16 * Math["random"]())), (result[tmp1] = data[19 === tmp1 ? (3 & tmp2) | 8 : tmp2])); return result["join"]("") }
	decryptResponseBody(result, n) {
		try {
			const de1 = CryptoJS.enc.Hex.parse(result),
				de2 = CryptoJS.enc.Base64.stringify(de1);
			const decrypted = CryptoJS.AES.decrypt(de2, CryptoJS.enc.Utf8.parse(n.substr(10, 16)), {
				iv: CryptoJS.enc.Utf8.parse(n.substr(20, 16)),
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7,
			}).toString(CryptoJS.enc.Utf8);
			return decrypted;
		} catch (error) {
			n = "987654321012345678901234567890123456789012345678"
			const de1 = CryptoJS.enc.Hex.parse(result),
				de2 = CryptoJS.enc.Base64.stringify(de1);
			const decrypted = CryptoJS.AES.decrypt(de2, CryptoJS.enc.Utf8.parse(n.substr(10, 16)), {
				iv: CryptoJS.enc.Utf8.parse(n.substr(20, 16)),
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7,
			}).toString(CryptoJS.enc.Utf8);
			return decrypted;
		}

	}
	//修复自 修改处理后 空值删除得情况 改为不删除
	calculateSign(requestBody) { const sortedKeys = Object.keys(requestBody).sort(); let signContent = sortedKeys.reduce((acc, key) => { const value = requestBody[key]; if (value === null) { return acc } if (typeof value === 'object' && !Array.isArray(value)) { return acc.concat(key).concat(JSON.stringify(value)) } if (Array.isArray(value)) { if (value.length > 0) { let typeOfFirstItem = typeof value[0]; if (typeOfFirstItem === 'object') { let arrayStr = ''; value.forEach((item, index) => { arrayStr += JSON.stringify(item) + (index !== value.length - 1 ? ',' : '') }); return acc.concat(key).concat(arrayStr) } } return acc.concat(key).concat(value.toString()) } return acc.concat(key).concat(value.toString()) }, ''); const secretKey = "048a9c4943398714b356a696503d2d36"; const hashedContent = CryptoJS.MD5(signContent.concat(secretKey)).toString(); return hashedContent }




}

!(async () => {
	await getNotice()
	$.checkEnv(ckName);

	for (let user of $.userList) {
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
	let { data: res } = await axios.request(options);
	$.log(res)
	return res
}
