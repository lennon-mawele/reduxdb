# reduxdb [![](https://badge.fury.io/js/reduxdb.svg)](https://www.npmjs.com/package/reduxdb) [![](https://travis-ci.org/wizawu/reduxdb.svg)](https://travis-ci.org/wizawu/reduxdb)

Redux with MongoDB-like API.

Notice that NOT all the features of MongoDB are implemented here, such as multi-index and query operators.

The purpose of _reduxdb_ is to avoid writing almost the same actions and stores again and again in different projects.

### Installation

```shell
npm install --save reduxdb
```

### Usage

```javascript
var reduxdb = require("reduxdb")

var db = reduxdb.use("test")
db.createCollection("users", {index: "id"})
db.createCollection("teams", {index: "id"})
db.createCollection("books")    // using default index `_id`

db.subscribe(function() {
    console.log(db.stats())
    console.log(db.users.stats())
    console.log(db.teams.stats())
    console.log(db.books.stats())
})

db.users.insert({id: "1234", name: "wizawu"})
db.users.findOne({name: "wizawu"}).id    // 1234
```

### API

#### reduxdb

+ use(name)

#### reduxdb.DB

+ [createCollection(name, options)](https://docs.mongodb.org/manual/reference/method/db.createCollection/)

  `options` can be only used to define index, for example

  ```
  db.createCollection("user", {index: "uid"})
  ```

+ [getCollection(name)](https://docs.mongodb.org/manual/reference/method/db.getCollection/)
+ [getCollectionNames()](https://docs.mongodb.org/manual/reference/method/db.getCollectionNames/)
+ [getName()](https://docs.mongodb.org/manual/reference/method/db.getName/)
+ [stats()](https://docs.mongodb.org/manual/reference/method/db.stats/)
+ [subscribe(listener)](http://redux.js.org/docs/api/Store.html#subscribe)

#### reduxdb.Collection

+ [copyTo(newCollection)](https://docs.mongodb.org/manual/reference/method/db.collection.copyTo/)
+ [count()](https://docs.mongodb.org/manual/reference/method/db.collection.count/)
+ [drop()](https://docs.mongodb.org/manual/reference/method/db.collection.drop/)
+ [find(query)](https://docs.mongodb.org/manual/reference/method/db.collection.find/)

  Only support [Query for Equality](https://docs.mongodb.org/manual/reference/method/db.collection.find/#query-for-equality), for example

  ```
  // Return all users matching {"age": 18, "name": {"first": "Andrew"}}
  db.user.find({"age": 18, "name.first": "Andrew"})
  ```

+ [findOne(query)](https://docs.mongodb.org/manual/reference/method/db.collection.findOne/)

  Same `query` type as `find()`.

+ getDB()
+ getFullName()
+ getIndexKeys()
+ getName()
+ [insert(documents)](https://docs.mongodb.org/manual/reference/method/db.collection.insert/)

  No `options` supported here.

+ [remove(query)](https://docs.mongodb.org/manual/reference/method/db.collection.remove/)

  Same `query` type as `find()`.

+ [renameCollection(newName)](https://docs.mongodb.org/manual/reference/method/db.collection.renameCollection/)
+ [save(document)](https://docs.mongodb.org/manual/reference/method/db.collection.save/)
+ [stats()](https://docs.mongodb.org/manual/reference/method/db.collection.stats/)
+ [update(query, update, options)](https://docs.mongodb.org/manual/reference/method/db.collection.update/)

  Same `query` type as `find()`. `upsert` and `multi` are supported in `options`.

