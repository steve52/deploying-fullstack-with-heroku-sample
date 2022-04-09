const express = require('express');
const mongoose = require('mongoose');
cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

const promise = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/MovieListdb', {
  useNewUrlParser: true,
});

async function getDonationTotal(DonationModel) {
  const smooshedModels = await DonationModel.aggregate([
    {
      $group: {
        _id: '',
        total: {
          $sum: '$amount',
        },
      },
    },
  ]);
  return smooshedModels[0].total;
}

promise.then(() => {
  console.log('Connected to mongodb');

  const wss = new WebSocket.Server({port: 8080});

  // On first websocket connection from a client do the following
  wss.on('connection', (ws) => {
    console.log('Websocket open with a client');

    getDonationTotal(Donation).then((total) => {
      console.log('Send current total to client');
      ws.send(JSON.stringify({
        message: 'current_total',
        total,
      }));
    }).catch((err) => {
      console.log(err);
    });
  });

  broadcastNewDonation = (data) => {
    console.log('data', data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  const donationSchema = new mongoose.Schema({
    name: {
      type: String,
      default: 'Anonymous',
    },
    amount: Number,
    created_date: {
      type: Date,
      default: Date.now,
    },
  });

  const Donation = mongoose.model('Donation', donationSchema);

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));

  app.post('/donations', (req, res) => {
    console.log('Got a new donation', req.body);
    const newDonation = new Donation(req.body);

    newDonation.save()
        .then((donation) => {
          console.log('donation', donation);

          getDonationTotal(Donation)
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

  app.get('/donations', (req, res) => {
    Donation.find({}, (err, donations) => {
      if (err) res.send(err);
      res.json(donations);
    });
  });

  app.delete('/donations', (req, res) => {
    Donation.remove({}, (err) => {
      if (err) res.send(err);
      res.send('deleted all donations');
    });
  });

  app.listen(port, () => console.log(`Listening on port ${port}`));

  console.log(`Birthday donation ticker RESTful
    API server started on: ${port}`);
}, (err) => {
  console.error('Failed to connect to mongodb', err);
});
