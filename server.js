require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
var shortId = require('shortid')
var validUrl = require('valid-url');
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}))

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


const mongoose = require('mongoose');
const { Schema } = mongoose;

let URL;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new Schema({
 original_url: String,
 short_url: String
});

URL = mongoose.model('URL', urlSchema);

app.post('/api/shorturl', async function (req, res) {
  console.log("req body : ", req.body)
  const url = req.body.url;
  const urlCode = shortId.generate();
  console.log("url : ",url," urlCode : ",urlCode);
  if (!validUrl.isWebUri(url)) {
    res.json({
      error: 'invalid url'
    });
  } else {
    try {
      let findOne = await URL.findOne({
        original_url: url
      })
      if (findOne) {
        res.json({
          original_url: findOne.original_url,
          short_url: findOne.short_url
        })
      } else {
        findOne = new URL({
          original_url: url,
          short_url: urlCode
        })
        await findOne.save()
        res.json({
          original_url: findOne.original_url,
          short_url: findOne.short_url
        })
      }
    }catch (err) {
      res.status(500).json('Server error')
    }
  }
});

app.get('/api/shorturl/:short_url',async function(req, res){
  try{
    const urlParams = await URL.findOne({
      short_url: req.params.short_url
    })
    if (urlParams)
      return res.redirect(urlParams.original_url);
    else
      return res.status(404).json('No uRL found')
  } catch(err) {
      res.status(500).json('Server error')
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
