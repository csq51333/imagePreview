
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
app.use(views('pages',{map:{html:'ejs'}}));

// 公共数据，每个路由里面都要该数据
app.use(async (ctx,next)=>{
    ctx.state = {
        userName:'张三'
    }
    // 继续向下匹配路由
    await next(); 
});

// 访问静态资源
app.use(static(path.join(__dirname, '\\image')))

let globleImageList = []

// 删除图片接口
router.post('/deleteImage', async (ctx) => {

    console.log('收到delte请求---------', ctx.request.header)
    let header = ctx.request.header
    let currentimageurl = decodeURI(header.currentimageurl)
    console.log('当前储存的图片列表', globleImageList)

    fs.unlinkSync(currentimageurl)
    let succedStatus = {
        status: 200,
        flag: true,
        data: {}
    }
    // 返回
    ctx.body = succedStatus
})

// 请求图片列表接口
router.get('/imgLoad', async(ctx) => {
    console.log('收到load请求', ctx.query.imageName)
    let res = getJsonFiles(ctx.query.imageName);
    console.log('getJsonFiles', res)
    globleImageList = res.map(item => {
        let src = item.replace(/\/+/g, "/").replace(/\\+/g, `/`);

        let uri = __dirname.replace(/\/+/g, "/").replace(/\\+/g, `/`) + '/'+ src;

        let reg = new RegExp(`${ctx.query.imageName}`)
        let url = src.replace(reg, "")
        return {
            uri,
            url,
        }
    }) // 返回的是//image//xx.jpg

    console.log('globleImageList', globleImageList)

    let getData = ctx.query;
    let getReData = ctx.request.query;
    let postData = ctx.querystring;
    let postReData = ctx.request.querystring;

    console.log('getData', getData)
    console.log('postData', postData)
    console.log(__dirname);  // 当前文件所在的绝对路径。
    console.log(__filename);  // 当前文件的文件名,包括全路径。  __dirname和__filename都是全局对象。

    let succedStatus = {
        status: 200,
        dataStr: JSON.stringify(globleImageList),
        data: globleImageList,
        page: 1,
    }
    ctx.body = succedStatus
})

// 递归读取所有文件功能函数
function getJsonFiles(jsonPath) {
  let jsonFiles = [];
  function findJsonFile(path) {
    let files = fs.readdirSync(path);
    files.forEach(function (item, index) {
      let fPath = join(path, item);
      let stat = fs.statSync(fPath);
      if (stat.isDirectory() === true) {
        findJsonFile(fPath);
      }
      if (stat.isFile() === true) {
        jsonFiles.push(fPath);
      }
    });
  }
  findJsonFile(jsonPath);
  return jsonFiles || []
}


// 以下是测试页面 --- 无关紧要，可以删除
router.get('/:name/:id',async (ctx)=>{
    let title = '你好ejs';
    let list = ['哈哈','嘻嘻','看看','问问'];
    let content = "<h2>这是一个h2</h2>";
    let num = 18;
    let name = ctx.params.name || ''
    let id = ctx.params.id || ''
    await ctx.render('index',{
        title,list,content,num,name,id
    });
}).get('/one/:name/:id',async (ctx)=>{
    let title = '这里是one层';
    let list = ['0','1','2','3'];
    let content = "<h2>还能输出标签666</h2>";
    let num = 10;
    let name = ctx.params.name || ''
    let id = ctx.params.id || ''
    await ctx.render('one',{
        title,list,content,num,name,id
    });
}).get('/imagePreview',async (ctx)=>{
    let title = '图片浏览页'
    await ctx.render('imagePreview',{
        title
    });
})


// 作用:启动路由
app.use(router.routes());
// 作用:这是官方文档的推荐用法,我们可以看到 router.allowedMethords() 用在 router.routes() 之后,
// 所有,在当所有的路由中间件最后使用.此时根据 ctx.status 设置 response 响应头
app.use(router.allowedMethods());
                
// 监听端口≈
app.listen(3000,function(){
    console.log('启动成功');
});