# reduxdb [![build status](https://travis-ci.org/wizawu/reduxdb.svg)](https://travis-ci.org/wizawu/reduxdb)

Redux with MongoDB-like API.

Notice that NOT all the features of MongoDB are implemented here, such as multi-index and query operators.

The purpose of _reduxdb_ is to avoid writing almost the same actions and stores again and again in different projects.

### Installation

```shell
npm install --save reduxdb
```

### Usage

```javascript
import reduxdb = require("reduxdb")

let db = reduxdb.use("mysite")
db.createCollection("user", {index: "id"})
db.createCollection("team", {index: "id"})
db.createCollection("book")     // using default index `_id`

db.user.insert({id: "123", name: "wizawu"})
db.user.findOne({name: "wizawu"}).id    // "123"
```

### API

This [markdown](https://github.com/wizawu/reduxdb/blob/master/API.md) explains the differences with official API.

#### reduxdb

+ use(name)

#### reduxdb.DB

+ [createCollection(name, options)](https://docs.mongodb.org/manual/reference/method/db.createCollection/)
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
+ [findOne(query)](https://docs.mongodb.org/manual/reference/method/db.collection.findOne/)
+ getDB()
+ getFullName()
+ getIndexKeys()
+ getName()
+ [insert(documents)](https://docs.mongodb.org/manual/reference/method/db.collection.insert/)
+ [remove(query)](https://docs.mongodb.org/manual/reference/method/db.collection.remove/)
+ [renameCollection(newName)](https://docs.mongodb.org/manual/reference/method/db.collection.renameCollection/)
+ [save(document)](https://docs.mongodb.org/manual/reference/method/db.collection.save/)
+ [stats()](https://docs.mongodb.org/manual/reference/method/db.collection.stats/)
+ [update(query, update, options)](https://docs.mongodb.org/manual/reference/method/db.collection.update/)
