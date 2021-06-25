var token = require('./createJWT.js');
exports.setApp = function (app, client)
{


    
    app.post('/api/login', async (req, res, next) =>    
    {
        // incoming: login, password
        // outgoing: id, firstName, lastName, error
    
        var error = '';

        const { login, password } = req.body;

        const db = client.db();
        const results = await db.collection('Users').find({Login:login,Password:password}).toArray();

        var ret = '';
        var id = -1;
        var fn = '';
        var ln = '';

        if( results.length > 0 )
        {
            id = results[0].userId;
            fn = results[0].firstName;
            ln = results[0].lastName;

            try
            {
                // const token = require("./createJWT.js");
                ret = token.createToken(fn, ln, id);
            }
            catch(e)
            {
                ret  = {error:e.message};
            }
        }
        else
        {
            ret = {error: "Login/Password Incorrect"}; 
        }

           
        res.status(200).json(ret);
    });
    
    app.post('/api/register', async (req, res, next) =>    
    {
        // incoming: login, password
        // outgoing: id, firstName, lastName, error
        var error = 'OK';
        const { login, password, id, firstName, lastName} = req.body;
        const newCard = {Login:login,Password:password, id:id, firstName:firstName, lastName:lastName};
        try{
        const db = client.db();
        const results = await db.collection('Users').insertOne(newCard);
        }
        catch(err)
        {
            error = err;
        }
        var ret = {error:error};    
        res.status(200).json(ret);
    });
    
    app.post('/api/addcard', async (req, res, next) =>
    {
      // incoming: userId, color
      // outgoing: error
        
      const { userId, card, jwtToken } = req.body;

      try
      {
        if( token.isExpired(jwtToken))
        {
          var r = {error:'The JWT is no longer valid', jwtToken: ''};
          res.status(200).json(r);
          return;
        }
      }
      catch(e)
      {
        console.log(e.message);
      }
    
      const newCard = {Card:card,UserId:userId};
      var error = '';
    
      try
      {
        const db = client.db();
        const result = db.collection('Cards').insertOne(newCard);
      }
      catch(e)
      {
        error = e.toString();
      }
    
      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
    
      var ret = { error: error, jwtToken: refreshedToken };
      
      res.status(200).json(ret);
    });
    
    app.post('/api/searchcards', async (req, res, next) => 
    {
      // incoming: userId, search
      // outgoing: results[], error
    
      var error = '';
    
      const { userId, search, jwtToken } = req.body;

      try
      {
        if( token.isExpired(jwtToken))
        {
          var r = {error:'The JWT is no longer valid', jwtToken: ''};
          res.status(200).json(r);
          return;
        }
      }
      catch(e)
      {
        console.log(e.message);
      }
      
      var _search = search.trim();
      
      const db = client.db();
      const results = await db.collection('Cards').find({"Card":{$regex:_search+'.*', $options:'r'}}).toArray();
      
      var _ret = [];
      for( var i=0; i<results.length; i++ )
      {
        _ret.push( results[i].Card );
      }
      
      var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
    
      var ret = { results:_ret, error: error, jwtToken: refreshedToken };
      
      res.status(200).json(ret);
    });

}