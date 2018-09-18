// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'        : '315003429251209', // your App ID
        'clientSecret'    : 'e43b6f50eed0fe2c0df60ca35c8649e1', // your App Secret
        'callbackURL'     : 'http://localhost:2000/auth/facebook/callback',
        'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields'   : ['id', 'email', 'name'] // For requesting permissions from Facebook API

    },

    'twitterAuth' : {
        'consumerKey'        : 'your-consumer-key-here',
        'consumerSecret'     : 'your-client-secret-here',
        'callbackURL'        : 'http://localhost:2000/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'         : '957405754426-0rv1m8nuebmcpgcbjqsops6rg4rbatad.apps.googleusercontent.com',
        'clientSecret'     : 'XMFAIvNRJWp2pN7HToHv9sx4',
        'callbackURL'      : 'http://localhost:5000/auth/google/callback'
    }

    

};
