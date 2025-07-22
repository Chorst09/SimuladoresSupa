const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

exports.handler = async (event, context) => {
    await app.prepare();

    return new Promise((resolve, reject) => {
        const server = createServer((req, res) => {
            const parsedUrl = parse(req.url, true);
            handle(req, res, parsedUrl);
        });

        server.listen(0, (err) => {
            if (err) throw err;

            const { port } = server.address();

            // Simulate the request
            const req = {
                method: event.httpMethod,
                url: event.path + (event.queryStringParameters ? '?' + new URLSearchParams(event.queryStringParameters).toString() : ''),
                headers: event.headers,
                body: event.body
            };

            handle(req, {
                statusCode: 200,
                setHeader: () => { },
                end: (body) => {
                    resolve({
                        statusCode: 200,
                        body: body,
                        headers: {
                            'Content-Type': 'text/html'
                        }
                    });
                }
            });
        });
    });
};