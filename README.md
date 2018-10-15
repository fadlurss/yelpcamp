## git master : 
1. Feature Comments-showpage branch included
2. Feature jQuery branch included
3. Feature Pagination branch included
4. Feature Sorting branch included
5. Feature Category branch included
6. Feature Start date campground to end date campground
7. Feature Report excel, pdf


## Problem social-login : 
MongoError: E11000 duplicate key error collection: yelpcamp_v15.users index: local.email_1 dup key: { : null }
    at Function.create (/Users/muhammadalfifadhlur/Documents/yelpcamp/node_modules/mongodb-core/lib/error.js:43:12)
    at toError (/Users/muhammadalfifadhlur/Documents/yelpcamp/node_modules/mongodb/lib/utils.js:149:22)
    at coll.s.topology.insert (/Users/muhammadalfifadhlur/Documents/yelpcamp/node_modules/mongodb/lib/operations/collection_ops.js:828:39)
    at /Users/muhammadalfifadhlur/Documents/yelpcamp/node_modules/mongodb-core/lib/connection/pool.js:531:18
    at _combinedTickCallback (internal/process/next_tick.js:131:7)
    at process._tickCallback (internal/process/next_tick.js:180:9)

If i'm try this way, not fixed : 
1. E11000 duplicate key error index in mongodb mongoose, SOLUTION ==> Or use db.users.dropIndexes() if you're making multiple index changes https://stackoverflow.com/questions/24430220/e11000-duplicate-key-error-index-in-mongodb-mongoose




## git command
git branch : 
1. git branch
2. git checkout -b feature1
3. git branch
4. git checkout master
5. klw mau merge, posisinya harus dalam keadaan master, lalu git merge feature1
6. update git per file : (git add .) kemudian git commit -m "your comment"

Sampai section 33
berhubungan dengan login yelpcamp

npm install passport passport-local passport-local-mongoose express-session --save

passportjs.org
passport local on github
passport local mongoose
express-session

login from scotch.io
login via email berhasil

pemanggilan router nya berbeda  : 
campground dan index(login) memakai cara webdevbootcamp
comment pakai cara scotch.io


sampai section 35


If you are using angular.js with express.js and node.js, you will need to do some changes in your code to make express CSRF protection mechanism work with angular.js. Angular.js has built-in support for CSRF protection as they have mentioned in their documentation.



Kalau masih kelihatan teknologi server side nya oleh wappalyzer, penyebabnya adalah cache. Maka, diwajibkan untuk mengganti nilai portnya.
