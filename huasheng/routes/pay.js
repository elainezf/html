var express = require('express');
var router = express.Router();
var GoodsModel = require('../models/GoodsModel');
var ShoppingModel = require('../models/ShoppingModel');
var sequelize =require('../models/ModelHead')();


/* GET home page. */
router.get('/putshopping', function(req, res, next) {
	loginbean = req.session.loginbean;
	if(typeof(loginbean)=='undefined'){
		res.send('<script>alert("您没登陆,请登陆后操作");window.close();</script>');
		return;
	}
  //res.locals.loginbean = loginbean;
  //--------查询goods表--------------------------
  goodsid = req.query.goodsid;
  
  GoodsModel.findOne({where:{id:goodsid}}).then(function(goodsRs){
          //--------插入购物意向表----------------------
          syl = {
          	goodsid:goodsid,
          	uid:loginbean.id,
          	price:goodsRs.price,
          	num:1,
          	shopid:goodsRs.shopid,
          	creattime:new Date()
          };
          ShoppingModel.create(syl).then(function(rs){
	          console.log(rs);
	          //--------查询购物意向表---------------------
			  sql = 'select s.id as shoppingid,s.shopid as shopid ,g.id as goodsid ,g.goods.img ,g.goodsname,s.price,s.num,g.shopid from shoppings s,goods g where s.uid = ? and s.orderid = 0 and s.goodsid = g.id ';
			  sequelize.query(sql,{replacements: [loginbean.id],type: sequelize.QueryTypes.QUERY}).then(function(shopList){
	         // ShoppingModel.findAll({where:{uid:loginbean.id}}).then(function(shopList){
		          	//--------显示购物车---------------------------
		          	rsjson = JSON.parse(JSON.stringify(shopList[0]));
		          	res.render('buy/shoppingcar',{shopList:rsjson[0]});
	          });
	       }).catch(function(err){
	          console.log(err);
	          if(err.errors[0].path=='shoppinguniq')
			  {
				ShoppingModel.update({num:sequelize.literal('num+1')},{where:{'goodsid':goodsid,'uid':loginbean.id,'orderid':0}}).then(function(rs){
					//--------查询购物意向表---------------------
					  sql = 'select s.id as shoppingid,g.id as goodsid ,g.goods.img ,g.goodsname,s.price,s.num,g.shopid from shoppings s,goods g where s.uid = ? and s.orderid = 0 and s.goodsid = g.id ';
					  sequelize.query(sql,{replacements: [loginbean.id],type: sequelize.QueryTypes.QUERY}).then(function(shopList){
			         // ShoppingModel.findAll({where:{uid:loginbean.id}}).then(function(shopList){
			          	//--------显示购物车---------------------------
			          	rsjson = JSON.parse(JSON.stringify(shopList[0]));
			          	res.render('buy/shoppingcar',{shopList:rsjson});
			          });
					//res.render('shoppingcar',{shopList:shopList});
				})
			  }else{
			  	res.send('数据库错误,请稍后再试');
			  }
	          // res.send('创建失败');
	       })

  });

});


router.get('/createOrder', function(req, res, next) {
	orderStr = req.query.orderStr;
	orderArr = oederSet.split(',')
	len = orderArr.length;
	obj = {};
	for(i = 1; i<len; i++){
		v= orderArr[i];
		tempArr = v.split('_');
		shopid = tempArr[0];
		goodsid = tempArr[1];
		sql = 'select id,goodsid,price,num,shopid from shopping where goodsid = ? and uid = ?';
		obj[shopid].push(rs);
	}

module.exports = router;
