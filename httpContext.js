const queryString = require("query-string");
const Response = require('./response');

module.exports =
    class HttpContext {
        constructor(req, res) {
            this.req = req;
            this.res = res;
            this.secure = req.headers['x-forwarded-proto'] != undefined;
            this.host = (this.secure ? "https://" : "http://") + req.headers["host"];
            this.hostIp = req.headers['x-forwarded-for'] != undefined ? req.headers['x-forwarded-for'] : "127.0.0.1";
            this.response = new Response(this);
            this.payload = null;
        }
        getJSONPayload() {
            return new Promise(resolve => {
                let body = [];
                this.req.on('data', chunk => {
                    body.push(chunk);
                }).on('end', () => {
                    if (this.req.headers['content-type'] == "application/json")
                        this.payload = JSON.parse(body);
                    else
                        if (this.req.headers["content-type"] === "application/x-www-form-urlencoded")
                            this.payload = queryString.parse(body.toString());
                        else
                            this.payload = body.toString();
                    resolve(this.payload);
                });
            })
        }
        static async create(req, res) {
            let httpContext = new HttpContext(req, res);
            await httpContext.getJSONPayload();
            return httpContext;
        }
    }