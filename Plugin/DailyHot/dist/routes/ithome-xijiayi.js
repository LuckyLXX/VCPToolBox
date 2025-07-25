"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRoute = void 0;
const cheerio_1 = require("cheerio");
const getData_js_1 = require("../utils/getData.js");
const getTime_js_1 = require("../utils/getTime.js");
const handleRoute = async (_, noCache) => {
    const listData = await getList(noCache);
    const routeData = {
        name: "ithome-xijiayi",
        title: "IT之家「喜加一」",
        type: "最新动态",
        description: "最新最全的「喜加一」游戏动态尽在这里！",
        link: "https://www.ithome.com/zt/xijiayi",
        total: listData.data?.length || 0,
        ...listData,
    };
    return routeData;
};
exports.handleRoute = handleRoute;
// 链接处理
const replaceLink = (url, getId = false) => {
    const match = url.match(/https:\/\/www\.ithome\.com\/0\/(\d+)\/(\d+)\.htm/);
    if (match && match[1] && match[2]) {
        return getId ? match[1] + match[2] : `https://m.ithome.com/html/${match[1]}${match[2]}.htm`;
    }
    return url;
};
const getList = async (noCache) => {
    const url = `https://www.ithome.com/zt/xijiayi`;
    const result = await (0, getData_js_1.get)({ url, noCache });
    const $ = (0, cheerio_1.load)(result.data);
    const listDom = $(".newslist li");
    const listData = listDom.toArray().map((item) => {
        const dom = $(item);
        const href = dom.find("a").attr("href");
        const time = dom.find("span.time").text().trim();
        const match = time.match(/'([^']+)'/);
        const dateTime = match ? match[1] : undefined;
        return {
            id: href ? Number(replaceLink(href, true)) : 100000,
            title: dom.find(".newsbody h2").text().trim(),
            desc: dom.find(".newsbody p").text().trim(),
            cover: dom.find("img").attr("data-original"),
            timestamp: (0, getTime_js_1.getTime)(dateTime || 0),
            hot: Number(dom.find(".comment").text().replace(/\D/g, "")),
            url: href || "",
            mobileUrl: href ? replaceLink(href) : "",
        };
    });
    return {
        ...result,
        data: listData,
    };
};
