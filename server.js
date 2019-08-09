
const fs = require('fs');
const fastify = require('fastify')({ logger: { level: 'error' } });
const moment = require('moment');
const Next = require('next');
const _ = require('lodash');
const pump = require('pump');
const uuid = require('uuid/v1');

fastify.register(require('fastify-multipart'));

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';

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

      fastify.get('/dashboard/*', (req, reply) => {
      return app.render(req.req, reply.res, '/dashboard', req.query).then(() => {
        reply.sent = true;
      })
      });

        fastify.get('/orders/*', (req, reply) => {
            return app.render(req.req, reply.res, '/orders', req.query).then(() => {
                reply.sent = true;
            })
        });

        fastify.get('/cars/*', (req, reply) => {
            return app.render(req.req, reply.res, '/cars', req.query).then(() => {
                reply.sent = true;
            })
        });

        fastify.get('/drivers/*', (req, reply) => {
            return app.render(req.req, reply.res, '/drivers', req.query).then(() => {
                reply.sent = true;
            })
        });

      fastify.get('/*', (req, reply) => {
      return app.handleRequest(req.req, reply.res).then(() => {
        reply.sent = true;
      })
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
