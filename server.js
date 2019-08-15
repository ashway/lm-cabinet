
const fs = require('fs');
const fastify = require('fastify')({ logger: { level: 'error' } });
const moment = require('moment');
const Next = require('next');
const _ = require('lodash');
const pump = require('pump');
const uuid = require('uuid/v1');
const axiosInstance  = require('./axiosInstance');

fastify.register(require('fastify-multipart'));
fastify.register(require('fastify-cookie'));

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const apiHost = 'https://api.lux-motor.ru';

fastify.register(require('fastify-cors'), {
  origin: '*',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
});

fastify.register((fastify, opts, next) => {
  const app = Next({ dev });
  app
    .prepare()
    .then(() => {
      if (dev) {
        fastify.get('/_next/*', (req, reply) => {
          return app.handleRequest(req.req, reply.res).then(() => {
            reply.sent = true
          })
        })
      }

      fastify.get('/', async(req, reply) => {
          let authToken = req.cookies.authToken;
          let needRedirect = false;
          if(authToken) {
              let axios = axiosInstance(authToken);
              try {
                  let res = await axios.get(`${apiHost}/auth/validate`);
                  if(res.data.status && res.data.status=='valid') needRedirect = true;
              } catch(err) {}
          }
          if(needRedirect) {
              reply.redirect('/catalog');
          } else {
              return app.handleRequest(req.req, reply.res).then(() => {
                  reply.sent = true;
              })
          }
      });

      fastify.get('/*', async (req, reply) => {
          let authToken = req.cookies.authToken;
          let needAuth = false;
          if(!authToken) needAuth = true;
          let axios = axiosInstance(authToken);
          try {
              let res = await axios.get(`${apiHost}/auth/validate`);
              if(res.data.status && res.data.status!='valid') needAuth = true;
          } catch(err) {
              needAuth = true;
          }
          if(needAuth) {
              reply.redirect('/');
          } else {
              return app.handleRequest(req.req, reply.res).then(() => {
                  reply.sent = true;
              })
          }
      });

      fastify.setNotFoundHandler((request, reply) => {
          return app.render404(request.req, reply.res).then(() => {
            reply.sent = true;
          })
      });

      next()
    })
    .catch(err => next(err))
})

fastify.listen(port, err => {
  if (err) throw err
  console.log(`> Ready on http://localhost:${port}`)
})
