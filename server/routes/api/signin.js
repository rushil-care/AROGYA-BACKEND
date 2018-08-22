const User = require('../../models/User');
const UserSession = require('../../models/UserSession');
module.exports = (app) => {
  /*
   * Sign up
   */
  app.post('/api/account/signup', (req, res, next) => {
    const { body } = req;
    const {
      Name,
      password,
      dob
    } = body;
    let {
      email
    } = body;
    if (!Name) {
      return res.send({
        success: false,
        message: 'Error: Name cannot be blank.'
      });
    }
    if (!email) {
      return res.send({
        success: false,
        message: 'Error: Email cannot be blank.'
      });
    }
    if (!password) {
      return res.send({
        success: false,
        message: 'Error: Password cannot be blank.'
      });
    }
    email = email.toLowerCase();
    email = email.trim();
    // Steps:
    // 1. Verify email doesn't exist
    // 2. Save
    User.find({
      email: email
    }, (err, previousUsers) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      } else if (previousUsers.length > 0) {
        return res.send({
          success: false,
          message: 'Error: Account already exist.'
        });
      }
      // Save the new user
      const newUser = new User();
      newUser.email = email;
      newUser.password = newUser.generateHash(password);
      newUser.dob = dob;
      newUser.Name = Name;
    
      newUser.save((err, user) => {
        if (err) {
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }
        return res.send({
          success: true,
          message: 'Signed up'
        });
      });
    });

  }); // end of sign up endpoint



  /*
  *
  * SIGN IN DETAILS***
  * 
  * */




  app.post('/api/account/signin', (req, res, next) => {
    const { body } = req;
    const {
      password
    } = body;
    let {
      email
    } = body;

    if (!email) {
      return res.send({
        success: false,
        message: 'Error: Email cannot be blank.'
      });
    }
    if (!password) {
      return res.send({
        success: false,
        message: 'Error: Password cannot be blank.'
      });
    }
    email = email.toLowerCase();
    email = email.trim();
    // Steps:
    // 1. Verify email doesn't exist
    // 2. Save
    User.find({
      email: email
    }, (err, users) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      } 
       if (users.length != 1) {
        return res.send({
          success: false,
          message: 'Error: Invalid.'
        });
      }
        const user = users[0];

        if(!user.validPassword(password)) {
          return res.send({
            success: false,
            message: 'Error: Invalid.'
          });
        }


          // Otherwise  create user session

          const userSession = new UserSession();
          userSession.userId = user._id;
          userSession.save((err, doc)=> {
            if (err) {
              return res.send({
                success: false,
                message: 'Error: Server error'
              });
            }
            return res.send({
              success: true,
              message: 'Valid Sign in',
              token: doc._id
            });
          });




  }); 

  }); // end of sign in endpoint

  /*
  *
  * 
  * 
  * VERIFY OPTION AND LOGOUT
  * */

 app.get('/api/account/verify', (req, res, next) => {
      // GET the token
      const {query} = req;
      const {token} = query;
      //  TOKEN TEST
      // Verify the token of a kind

      UserSession.find({
        _id: token,
        isDeleted: false
      },(err, sessions) => {
          if(err) {
            return res.send({
              success: false,
              message: 'Error: SERVER ERROR '
            });
          }
          if(sessions.length != 1) {
            return res.send({
              success: false,
              message: 'Error: SERVER ERROR '
            })
          }
          else {
            return res.send({
              success: true,
              message: 'GOOD '
            })
          }
      });
 });


//  LOGOUT REQ

app.get('/api/account/logout', (req, res, next) => {
  // Get the token
  const { query } = req;
  const { token } = query;
  // ?token=test
  // Verify the token is one of a kind and it's not deleted.
  UserSession.findOneAndUpdate({
    _id: token,
    isDeleted: false
  }, {
    $set: {
      isDeleted:true
    }
  }, null, (err, sessions) => {
    if (err) {
      console.log(err);
      return res.send({
        success: false,
        message: 'Error: Server error'
      });
    }
    return res.send({
      success: true,
      message: 'Good'
    });
  });
});



}
