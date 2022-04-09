const express = require('express'); // import express module (simplifies routing/requests, among other things)
const cors = require('cors'); // import the CORS library to allow Cross-origin resource sharing
const http = require('http'); 

const setupWebSocket = require('./setupWebSocket')
const app = express(); // create an instance of the express module (app is the conventional variable name used)
var bodyParser = require('body-parser');

const services = require('./services/requests')

const PORT = process.env.PORT || 5000; // use either the host env var port (PORT) provided by Heroku or the local port (5000) on your machine

app.use(cors()); // Enable CORS 
app.use(express.json()); // Recognize Request Objects as JSON objects
app.use(express.static('build')); // serve static files (css & js) from the 'public' directory
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// app.get('/api/activities', (req, res) => { // route root directory ('/' is this file (app.js))

//   services.getAllActivities(req, res);
// });

// app.post('/api/activities', (req, res) => {
//   services.addActivityToDB(req, res);
// });

// app.get('/api/activities/new', (req, res) => {
//   services.getSingleActivity(req, res);
// });

// app.get('/api/activities/delete', (req, res) => {
//   services.deleteAllActivites(req, res);
// });

app.post('/donations', (req, res) => {
  // services.addDonationToDB(req, res);
  // console.log('Got a new donation', req.body);
  // const newDonation = new Donation(req.body);

  services.addDonationToDB(req, res)
      .then((donation) => {
        console.log('donation', donation);
        services.getTotalDonations()
            .then((total) => {
              const data = {
                message_type: 'new_donation',
                donation,
                total,
              };
              console.log('Broadcast new total and donation', data);
              broadcastNewDonation(JSON.stringify(data));
            }).catch((err) => {
              console.log('err', err);
            });
        res.send(`donation saved to database: ${newDonation}`);
      })
      .catch((err) => {
        res.status(400).send('undable to save to database');
      });
});

// app.get('/donations', (req, res) => {
//     services.getAllDonations(req, res);
//   // Donation.find({}, (err, donations) => {
//   //   if (err) res.send(err);
//   //   res.json(donations);
//   // });
// });

app.delete('/donations', (req, res) => {
  services.deleteAllDonations(req, res);
  // Donation.remove({}, (err) => {
  //   if (err) res.send(err);
  //   res.send('deleted all donations');
  // });
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
  res.sendFile(__dirname+'/build/index.html');
});

const server = app.listen(PORT, (err) => { // start server and listen on specified port
  if (err) console.log("Error in server setup")
  console.log(`App is running on ${PORT}`) // confirm server is running and log port to the console
}) 

const wss = setupWebSocket(server);

// what to do after a connection is established
wss.on("connection", (ctx) => {
  // print number of active connections
  console.log("connected", wss.clients.size);

  // handle message events
  // receive a message and echo it back
  ctx.on("message", (message) => {
    console.log(`Received message => ${message}`);
    ctx.send(`you said ${message}`);
  });

  // handle close event
  ctx.on("close", () => {
    console.log("closed", wss.clients.size);
  });

  // sent a message that we're good to proceed
  ctx.send("connection established.");
  
  services.getTotalDonations().then(total => {
    ctx.send(JSON.stringify({
      message: 'current_total',
      total,
    }));
  });
});