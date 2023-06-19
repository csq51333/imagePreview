
const fs = require('fs');
const path = require('path')
const join = path.join;

// 引入koa
const koa = require('koa');

const app = new koa();

// 注意：引入的方式
const router = require('koa-router')();

const views = require('koa-views');

// koa-static中间件，用于访问静态文件
const static = require('koa-static')

// 配置模版引擎中间件
// 如果这样配置不修改html后缀g改成ejs
// app.use(views('views',{extension:'ejs'}));
// 如果这样配置不修改html后缀
// app.use(views('views',{map:{html:'ejs'}}));
// 另一个pages文件夹中
app.use(views('tarot',{map:{html:'ejs'}}));

// 公共数据，每个路由里面都要该数据
app.use(async (ctx,next)=>{
    ctx.state = {
        userName:'张三'
    }
    // 继续向下匹配路由
    await next(); 
});

// 访问静态资源
app.use(static(path.join(__dirname, '\\tarot')))


// 以下是测试页面 --- 无关紧要，可以删除
router.get('/tarot',async (ctx)=>{
    let title = '塔罗占卜'
    await ctx.render('index',{
        title
    });
}).get('/book',async (ctx)=>{
    let title = '塔罗占卜'
    await ctx.render('src/book',{
        title
    });
})


// 作用:启动路由
app.use(router.routes());
// 作用:这是官方文档的推荐用法,我们可以看到 router.allowedMethords() 用在 router.routes() 之后,
// 所有,在当所有的路由中间件最后使用.此时根据 ctx.status 设置 response 响应头
app.use(router.allowedMethods());
                
// 监听端口≈
app.listen(8080,function(){
    console.log('启动成功');
});