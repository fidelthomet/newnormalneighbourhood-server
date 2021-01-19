# nnn server

## data types

### speculation
```
db.specualtion.insertMany([{
  type: "vulnerability",
  date: new Date(),
  img: "r379pw8r.jpg",
  sketch: [],
  coords: [ 52.46762, 13.42230 ],
  title: "test",
  description: "lorem ipsum",
}])
```

### challenge
```
db.challenge.insertMany([{
  title: "Information Infrastructure Breakdown",
  region: "Berlin",
  bounds: [],
  img: "a/information-infrastructure-breakdown.jpg",
  description: "lorem ipsum",
}])
```