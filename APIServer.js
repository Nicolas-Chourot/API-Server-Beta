var clc = require("cli-color");
const HttpContext = require('./httpContext');

module.exports =
    class APIServer {
        constructor(port = process.env.PORT || 5000) {
            this.port = port;
            this.initMiddlewaresPipeline();
            this.httpContext = null;
            this.httpServer = require('http').createServer(async (req, res) => { this.handleHttpResquest(req, res) });
        }
        initMiddlewaresPipeline() {
            const staticResourceServer = require('./staticRessourcesServer');
            const MiddlewaresPipeline = require('./middlewaresPipeline');
            this.middlewaresPipeline = new MiddlewaresPipeline();

            // common middlewares
            this.middlewaresPipeline.add(staticResourceServer.sendRequestedRessource);

            // API middlewares
            const router = require('./router');
            this.middlewaresPipeline.add(router.API_EndPoint);
        }
        showRequestInfo() {
            this.markRequestProcessStartTime();
            let time = require('date-and-time').format(new Date(), 'YYYY MMMM DD - HH:mm:ss');
            console.log(clc.green('<-------------------------', time, '-------------------------'));
            console.log(clc.bold(clc.green(`Request --> [${this.httpContext.req.method}::${this.httpContext.req.url}]`)));
            console.log("User agent ", this.httpContext.req.headers["user-agent"]);
            console.log("Host ", this.httpContext.hostIp.substring(0, 15), "::", this.httpContext.host);
            if (this.httpContext.payload)
                console.log("Request payload ", JSON.stringify(this.httpContext.payload).substring(0, 127) + "...");
        }
        showResponseInfo() {
            this.showRequestProcessTime();
            this.showMemoryUsage();
        }
        markRequestProcessStartTime() {
            this.requestProcessStartTime = process.hrtime();
        }
        showRequestProcessTime() {
            let requestProcessEndTime = process.hrtime(this.requestProcessStartTime);
            console.log(clc.cyanBright("Response time: ", Math.round((requestProcessEndTime[0] * 1000 + requestProcessEndTime[1] / 1000000) / 1000 * 10000) / 10000, "seconds"));
        }
        showMemoryUsage() {
            // for more info https://www.valentinog.com/blog/node-usage/
            const used = process.memoryUsage();
            console.log(clc.magenta("Memory usage: ", "RSet size:", Math.round(used.rss / 1024 / 1024 * 100) / 100, "Mb |",
                "Heap size:", Math.round(used.heapTotal / 1024 / 1024 * 100) / 100, "Mb |",
                "Used size:", Math.round(used.heapUsed / 1024 / 1024 * 100) / 100, "Mb"));
        }
        async handleHttpResquest(req, res) {
            this.httpContext = await HttpContext.create(req, res);
            this.showRequestInfo();
            if (!(await this.middlewaresPipeline.handleHttpRequest(this.httpContext)))
                this.httpContext.response.notFound();
            this.showResponseInfo();
        }
        startupMessage() {
            console.log(clc.green("**********************************"));
            console.log(clc.green("* API SERVER - version beta      *"));
            console.log(clc.green("**********************************"));
            console.log(clc.green("* Author: Nicolas Chourot        *"));
            console.log(clc.green("* Lionel-Groulx College          *"));
            console.log(clc.green("* Release date: august 30 2022   *"));
            console.log(clc.green("**********************************"));
            console.log(clc.bgGreen(clc.white(`HTTP Server running on port ${this.port}...`)));
            this.showMemoryUsage();
        }
        start() {
            this.httpServer.listen(this.port, () => { this.startupMessage() });
        }
    }