// ------------------------------- ROUTER SET UP -------------------------------

var express = require('express'),
    router = express.Router(),
    User = require('../models/users.js'),
    Activity = require('../models/activities.js');

// -------------------------------- SEED ROUTE ---------------------------------
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// NOTE: JUST FOR TESTING PURPOSES! TAKE OUT AFTER REVIEW!
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var seedData = [
  {
    /*creator: '5908ab38137910051a6e14ae', */
    title: 'This is an exercise',
    creator: 'Hannah',
    description: 'It is so much fun!',
    typeOfExercise: 'Aerobic',
    outdoor: 'true',
    weather: 'Sunny',
    minAge: 3,
    tags: ['fun', 'splash', 'splish']
  },
  {
    /*creator: 'create user first and insert user id here', */
    title: 'This is another exercise',
    creator: 'Hannah',
    description: 'It is so much more fun!',
    typeOfExercise: 'Balance',
    outdoor: false,
    weather: 'Rainy',
    minAge: 16,
    tags: ['bla', 'splash', 'blo']
  },
  {
    /*creator: 'create user first and insert user id here', */
    title: 'This is a third exercise',
    creator: 'Hannah',
    description: 'It is even much more fun!',
    typeOfExercise: 'Cardio',
    outdoor: true,
    weather: 'Snow',
    minAge: 13,
    tags: ['bla', 'splash', 'blo']
  },
  {
    /*creator: 'create user first and insert user id here', */
    title: 'This is a fourth exercise',
    creator: 'Hannah',
    description: 'It is not fun!',
    typeOfExercise: 'Flexibility',
    outdoor: true,
    weather: 'Rainy',
    minAge: 6,
    tags: ['bla', 'splash', 'blo']
  }
];

router.get('/seed', function (req, res) {
  // add seed data to
  Activity.insertMany(seedData, function(error, createdActivities) {
    if (!error) {
      // if no error occurs, redirect to activities routes
      res.redirect('/activities')
    } else {
      // else send error
      res.json(error);
    }
  });
});

// ------------------------------- GET ROUTES ----------------------------------

// *** GET all database entries ***
// --> tested in browser and with curl
// --> we might want to limit this to the ten most recent entries or
// sth like that depending on user stories

router.get('/', function (req, res) {
  // find most recent activities in the database
  Activity.find({}).populate('creator').sort({"date": -1}).limit(10).exec(function (error, allActivities) {
    if (!error) {
      // if no error occurs, send array of all found database entries as json
      res.json(allActivities);
    } else {
      // else send error
      res.json(error);
    }
  });
});

// *** GET all distinct tags ***
// --> tested in browser and with curl

router.get('/tags', function (req, res) {
  // find all distinct tags
  Activity.find().distinct('tags', function (error, distinctTags) {
    // if no error occurs, send tags array back as json
    if (!error) {
      res.json(distinctTags);
    } else {
      // in case of error, send error
      res.json(error);
    }
  });
});


// -------------------------------- POST ROUTE ---------------------------------

// *** CREATE a new activity ***
// --> tested with curl

router.post('/new', function (req, res)  {
  // Create new database entry based on user input
  Activity.create(req.body, function (error, createdActivity) {
    if(!error) {
      // if no error occurs, send json of createdActivity
      res.json(createdActivity);
    } else {
      // else send error
      res.json(error);
    }
  });
});

// --------------------------------- PUT ROUTE ---------------------------------

// *** add an existing activity to user's favorites ***
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// NOTE: THIS IS JUST FOR TESTING --> needed this to be able to test if my
// delete route logic also removes deleted activity from users' favorites arrays
// TAKE OUT AFTER REVIEW! Real route should be on user controller and should use
// ObjectIds not req.params
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.put('/:id/favorite/:userID', function (req, res) {
  // find activity by id
      User.findByIdAndUpdate(req.params.userID,
        // update by pushing the id of foundActivity into favorites array on user
        { $addToSet: { 'favorites': req.params.id } }, {new: true})
        .populate('favorites').exec(
         function (error, updatedUser) {
           if (!error) {
             // if no error occurs, send json of updated user entry
             res.json(updatedUser);
           } else {
             // else send error
             res.json(error);
           }
      });
});

router.delete('/:id/favorite/:userID', function(req, res) {
  User.findByIdAndUpdate(req.params.userID,
    { $pull: { favorites: req.params.id } }, {new:true}).populate('favorites').exec(function(error, updatedUser) {
      if (!error) {
        res.json(updatedUser);
      } else {
        res.json(error);
      }
    });
});

// *** UPDATE an existing activity ***
// --> tested with curl
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// NOTE: Why not just findByIdAndUpdate: If we want to run authorization (-->
// is the user making the put request the creator of the database entry?), we'll
// need to compare the current user's id to the database entry's value for
// creator first. If they match, we will can allow an update, if not, we will
// want to send a 403. We cannot solely rely on the frontend for authorization,
// since you could also try to use curl to make a PUT request. This is why I
// opted for this update version. If you don't agree or know a better way to do
// it, let me know and I'll change it. I wrote the basic conditional for this,
// but commented it out for now.
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.put('/:id', function (req, res) {
  // find activity to be updated
  Activity.findById(req.params.id, function (error, foundActivity) {
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // NOTE: just basic logic, fill with correct variable names for authorization!!
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // if logged-in user is author of activity, make update to database entry
    // if (req.session.currentuser._id === foundActivity.creator) {
      Activity.findByIdAndUpdate(req.params.id, req.body, {new: true},
        function (error, updatedActivity) {
        if(!error) {
          // if no error occurs, send updated database entry as json
          res.json(updatedActivity);
        } else {
          // else send error
          res.json(error)
        }
      });
      // if user is NOT the author of activity, send 403
    //} else {
      //res.status(403).send('Forbidden');
    //}
  });
});

// ------------------------------- DELETE ROUTE --------------------------------
// --> tested with curl
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// NOTE: Why not just findByIdAndRemove: see put route
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

router.delete('/:id', function (req, res) {
  // find activity to be deleted
  Activity.findById(req.params.id, function (error, foundActivity) {
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // NOTE: just basic logic, fill with correct variable names for
    // authorization!!
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // if logged-in user is the author of the activity, delete
    // if (req.session.currentuser._id === foundActivity.creator) {
      Activity.findByIdAndRemove(req.params.id,
        function (error, deletedActivity) {
          // if no error occurs
          var id = deletedActivity._id.toString(); // JUST FOR TESTING, proper route will have to work with ObjectIds!
          if (!error) {
            User.update(
              { },
              { $pull: { favorites: id } },
              { multi: true },
              function (error) {
                console.log(error);
              });
            res.json(deletedActivity)
          } else {
            res.json(error);
          }
      });
      // if user is NOT the author of activity, send 403
    // } else {
      //res.status(403).send('Forbidden');
    // }
  });
});

router.post('/search', function (req, res) {
  // find activities based on query pattern
  Activity.find({ title: { $regex: req.body.pattern, $options: 'i' }}).sort({"date": -1}).exec(function (error, foundActivities) {
    if (!error) {
      // if no error occurs, send array of all found database entries as json
      res.json(foundActivities);
    } else {
      // else send error
      res.json(error);
    }
  });
});
// ------------------------------- ROUTER EXPORT -------------------------------

module.exports = router;
