const express= require('express');
const cors=require('cors');
const uniqid=require('uniqid');
const mongoose=require('mongoose');
const app=express();
const port =process.env.port||3000;
const bodyParser=require('body-parser')
app.use(cors());
app.use(bodyParser.json())
app.use(express.json())

mongoose.connect('mongodb://127.0.0.1:27017/ipl',{ useNewUrlParser: true, useUnifiedTopology: true });
app.use("/", express.static(__dirname));
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

let userModel=mongoose.model('user',{
    userid:String,
    uname:{type:String,unique:true},
    password:String,

});

let deliveriesModel=mongoose.model('deliveries',{
    ball : Number,
    batsman : String,
    batsman_runs : Number,
    batting_team : String,
    bowler : String,
    bowling_team : String,
    bye_runs : Number,
    dismissal_kind : Number,
    extra_runs : Number,
    fielder : String,
    inning : Number,
    is_super_over : Number,
    legbye_runs : Number,
    match_id : Number,
    noball_runs : Number,
    non_striker : String,
    over : String,
    penalty_runs : Number,
    player_dismissed : String,
    total_runs : Number,
    wide_runs : Number
});

let matchModel=mongoose.model('matches',{
    city:String,
    date:String,
    id:Number,
    dl_applied:Number,
    player_of_match:String,
    result:String,
    season:Number,
    team1:String,
    team2:String,
    toss_decision:String,
    toss_winner:String,
    umpire1:String,
    umpire2:String,
    umpire3:String,
    venue:String,
    win_by_runs:String,
    win_by_wickets:String,
    winner:String
});



app.get('/',(req,res) => {

    
    res.redirect('/home.html')
    
});

app.post('/login',(req,res) => {
    
    console.log(req.body)
    userModel.findOne({uname:req.body.name,password:req.body.password},(e,docs)=>{
        console.log(docs)
        res.send(docs); 
         
     });
})

app.post('/register',(req,res) => {


    // for new user
    var newUser=new userModel({
        userid:uniqid(),
        uname:req.body.name,
        password:req.body.password
    });
    // res.end("hii");
    newUser.save().then(data=>{
        res.send(data);
        console.log("user added");
    },(e)=>{
        console.log(e);
    });
})

app.post('/register',(req,res) => {


    // for new user
    var newUser=new userModel({
        userid:uniqid(),
        uname:req.body.name,
        password:req.body.password
    });
    // res.end("hii");
    newUser.save().then(data=>{
        res.send(data);
        console.log("user added");
    },(e)=>{
        console.log(e);
    });
})

app.post('/getHighestRunGetter',(req,res)=>{
    console.log(req.body.session)
    var sess =  parseInt(req.body.session, 10);
    console.log(sess)
   
    deliveriesModel.aggregate([ 
        {$group:{_id:{batsman:'$batsman'} , score:{$sum:'$batsman_runs'}}}, 
        {$group:{_id:'$_id.batsman', score:{$first:'$score'}}},{$sort:{score :-1}}
    ],(e,docs)=>{
        res.send(docs)
    });
})

app.post('/playerEverPlayedForTeam',(req,res)=>{
    console.log(req.body.session)
    var sess =  parseInt(req.body.session, 10);
    console.log(sess)
   
    
})

app.post('/teams',(req,res)=>{
    console.log(req.body.session)
    var sess =  parseInt(req.body.session, 10);
    console.log(sess)
   
    if(req.body.session == 'all')
    {
        matchModel.find().distinct('team1', function(error, vals) {
            res.send(vals);
        });
    }
    else{
        matchModel.find({season : sess}).distinct('team1', function(error, vals) {
            res.send(vals);
        });
    }
})

app.post('/mostwins',(req,res)=>{
    console.log(req.body.session)
    var sess =  parseInt(req.body.session, 10);
    console.log(sess)
   
    if(req.body.session == 'all')
    {
        matchModel.aggregate([ 
            {$group:{_id:{team:'$winner'} , score:{$sum:1}}}, 
            {$group:{_id:'$_id.team', score:{$first:'$score'}}},{$sort:{score :-1}}
        ],(e,docs)=>{
            res.send(docs)
        });
    }
    else{
        matchModel.aggregate([ 
            {$group:{_id:{team:'$winner','$season':sess }, score:{$sum:1}}}, 
            {$group:{_id:'$_id.team', score:{$first:'$score'}}},{$sort:{score :-1}}
        ],(e,docs)=>{
            res.send(docs)
        });
    }
})

app.post('/mosttosswins',(req,res)=>{
    console.log(req.body.session)
    var sess =  parseInt(req.body.session, 10);
    console.log(sess)
   
    if(req.body.session == 'all')
    {
        matchModel.aggregate([ 
            {$group:{_id:{team:'$toss_winner'} , score:{$sum:1}}}, 
            {$group:{_id:'$_id.team', score:{$first:'$score'}}},{$sort:{score :-1}}
        ],(e,docs)=>{
            res.send(docs)
        });
    }
    else{
        matchModel.aggregate([ 
            {$group:{_id:{team:'$toss_winner','$season':sess }, score:{$sum:1}}}, 
            {$group:{_id:'$_id.team', score:{$first:'$score'}}},{$sort:{score :-1}}
        ],(e,docs)=>{
            res.send(docs)
        });
    }
})

app.post('/getHeighestWicketTaker',(req,res)=>{
    console.log("ddd")
    deliveriesModel.aggregate([ 
        {$group:{_id:{bowler:'$bowler'}, wickets:{ $sum: {
            "$cond": [{
                
                    '$dismissal_kind': 'bowled',
                    
              '$dismissal_kind': 'caught'},
              1,
              0
            ]
          }}}}, 
        {$group:{_id:'$_id.bowler', wickets:{$first:'$wickets'}}},{$sort:{wickets :-1}}
    ],(e,docs)=>{
        res.send(docs)
    });
})

app.post('/playerOfTheMatch',(req,res) => {
    console.log(req.body.session)
    var sess =  parseInt(req.body.session, 10);
    console.log(sess)
    if(req.body.session == 'all')
    {
        /*matchModel.find({},['season','player_of_match'],(e,docs)=>{
            res.send(docs)
                //  console.log(docs)
        });*/
        matchModel.find().distinct('player_of_match', function(error, vals) {
            res.send(vals);
        });
    }
    else
    {
        /*matchModel.find({'season' : sess},['season','player_of_match'],(e,docs)=>{
            res.send(docs)
                //  console.log(docs)
        });*/
        matchModel.find({'season' : sess},['season','player_of_match']).distinct('player_of_match', function(error, vals) {
            res.send(vals);
        });
    }
})

app.post('/venue',(req,res) => {
    console.log(req.body.session)
    var sess =  parseInt(req.body.session, 10);
    console.log(sess)
    if(req.body.session == 'all')
    {
        matchModel.find().distinct('venue', function(error, vals) {
            res.send(vals);
        });
    }
    else
    {
        matchModel.find({'season' : sess},['season','venue']).distinct('venue', function(error, vals) {
            res.send(vals);
        });
    }
    
})

app.listen(port,()=>{
    console.log("Server started at port " + port)
})