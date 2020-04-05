  
env={
  expire: 3600,           // alive for seconds
  secret :`$eCr3T`,       // importat!!!! : change it
  sec_cookie: false,      // if true only pass on https. on develop dont set it to true

  use_redis : false,      // use redis or not
  redis_host:'localhost',
  redis_port:6379,
  redis_pass:'',

  port : 3000,
}

const express = require('express')
const app = express()

const bodyparser = require('body-parser');   //necessary for getting posted data from client (posted csrf & captcha text)
const cookieparser= require('cookie-parser') //necessary for web apps (by default it stored in cookie on client side)  . for mobile apps you can get it via json result
app.use(cookieparser())
   .use(bodyparser.json())
   .use(bodyparser.urlencoded({ extended: false }))

const ejwt  = require('express-jwt-enhanced')(env); 
app.use(function(req,res,next){ejwt.req=req,ejwt.res=res,next()})


app.listen(env.port, () => console.log(`listening on port ${env.port}!`))



/*******************************************************************
   Middlewares
*******************************************************************/

async function auth(req,res,next){
 
   await ejwt.get() ? next() : res.send({err:'auth failed'} )
}
  

/*******************************************************************
  Routes
*******************************************************************/


app.get('/', (req, res) => {
  res.end(`Hello ejwt(enhanced json web token) \n
   [get] => /login \n
   [get] => /logout
   [get] => /get\n
   [get] => /csrfgen\n
   [get] => /csrfchk\n
   [get] => /captcha\n
   [get] => /captcha-form\n
   [post] => /captcha-chk\n
   [get] => /logout
  `);

})

app.get('/login', async(req, res)=> {

    await ejwt.set({ user:'aghae',rol:'admin' })

    res.json({ succ:'logined',
               token:ejwt.token,
               csrf_token: ejwt.data.csrf_token
             })
})

app.get('/logout', async(req, res)=> {
    await ejwt.unset()
    res.send('logouted.')
})

app.all('/get',auth, async (req, res)=> {
    res.send(await ejwt.get())
});




app.get('/csrfgen', async (req, res)=> {

    res.json(await ejwt.csrfgen())

    /* in real world:

      await ejwt.csrfgen()
      res.render('your-form.hrml')

    */
});

app.get('/csrfchk', async (req, res)=> {

  res.json(await ejwt.csrfchk())
  
  /* in real world
  
    var csrf_chk = await ejwt.csrfchk()
    if(csrf_chk.err) 
        res.send('csruf token error')
    else
        do somthing....
  */
});

app.get('/captcha', async function(req, res) {
   res.type('svg').send(await ejwt.captcha_gen())
});

app.get('/captcha-form', async function(req, res) {
   res.send(`
          <form method='POST' action='/captcha-chk' >
            <img src="/captcha" ><br>
            <input name='captcha' placeholder='Enter above text :'>
          </form>
        `,
        200,
        {'Content-Type':'text/html'}
    )
});

app.post('/captcha-chk', async function(req, res) {
   res.send(await ejwt.captcha_chk())
    
});


