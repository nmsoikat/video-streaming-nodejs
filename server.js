const express = require('express')
const fs = require('fs')

const app = express()

app.get('/video/', (req, res, next) => {
  const vId = req.query.v;

  // when we request through the <video src="http://localhsot:8000/video?v=video-01"></video>
  // we send the range in req.headers
  // It is the POSITION where we are in as a Bytes.
  const range = req.headers.range; //'bytes=0-'

  const videoPath = `./videos/${vId}`;

  //statSync return all information about file
  const videoSize = fs.statSync(videoPath).size;

  //how many data we want to sending per chunk
  const chunkSize = 1 * 1e+6 // 1mb

  //create chunk
  //ex: 'bytes=055-'  to 055
  const start = Number(range.replace(/\D/g, '')) // if not digit replace by empty string
  const end = Math.min((start + chunkSize), (videoSize - 1)) //return minimum //(start + chunkSize) always small until reach the video size

  const contentLength = end - start + 1;

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": 'bytes',
    "Content-Length": contentLength,
    "Content-Type": "video/mp4"
  }

  /*
  The HTTP 206 Partial Content success status response code indicates that the request has succeeded 
  and the body contains the requested ranges of data
  */

  // writeHead: property is an inbuilt property of the 'http' module which sends a Response Header to the request.
  res.writeHead(206, headers)

  //create stream and send to client
  const stream = fs.createReadStream(videoPath, {start, end})
  stream.pipe(res) //send to client
})

app.listen(8000, () => {
  console.log("server is running: 8000");
})