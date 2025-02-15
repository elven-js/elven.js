import handler from 'serve-handler';
import https from 'https';
import fs from 'fs';
import path from 'path';

const options = {
  key: fs.readFileSync(path.join(process.cwd(), 'certs/key.pem')),
  cert: fs.readFileSync(path.join(process.cwd(), 'certs/cert.pem')),
};

const server = https.createServer(options, (request, response) => {
  return handler(request, response, {
    public: 'demo-app',
    headers: [
      {
        source: '**/*',
        headers: [{ key: 'Cache-Control', value: 'no-cache' }],
      },
    ],
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(
    `Dev server running at https://localhost:${process.env.PORT || 3000}`
  );
});
