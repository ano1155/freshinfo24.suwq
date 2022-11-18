// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const request = require('request').defaults({ encoding: null });
const { HOST } = require('../../../config');

export default function handler(req, res) {
  const path = req.query.imageUrl.join('/');
  request.get(HOST + path, function (err, r, body) {
    res.send(body);
  })
}
