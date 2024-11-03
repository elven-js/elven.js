import handler from 'serve-handler';
import http from 'http';

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: 'apps/demo-app',
    headers: [
      {
        source: '**/*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache',
          },
        ],
      },
    ],
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(
    `Dev server running at http://localhost:${process.env.PORT || 3000}`
  );
});
