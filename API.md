# reduxdb

### use(name)  

Return an `reduxdb.DB` object. Create if not exist.

# reduxdb.DB

### createCollection(name, options)  

`options` can be only used to define index, for example
  
```
db.createCollection("user", {index: "uid"})
```

# reduxdb.Collection
  
### find(query)

See [Query for Equality](https://docs.mongodb.org/manual/reference/method/db.collection.find/#query-for-equality), for example

```
// Return all users matching {"age": 18, "name": {"first": "Andrew"}}
db.user.find({"age": 18, "name.first": "Andrew"})
```

### findOne(query)

Same `query` type as `find()`.

### insert(documents)

No `options` supported here.

### remove(query)

Same `query` type as `find()`.

### update(query, update, options)

+ Same `query` type as `find()`.
+ `upsert` and `multi` are supported in `options`.