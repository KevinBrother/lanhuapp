// prohabit console.log on production env.
if ( window.location.host.match("^t") == null && !(window.location.host.indexOf("localhost") >= 0) && !(window.location.host.indexOf("100.0.0") >= 0) ) { 
	if (typeof console != 'undefined') console.log = function(){};
// Modern browsers
}
else  if (typeof console != 'undefined' && typeof console.log == 'function') {
}
// Tell IE9 to use its built-in console
else if (Function.prototype.bind && console && typeof console.log == "object") {
	["log","info","warn","error","assert","dir","clear","profile","profileEnd"].forEach(function (method) {
        console[method] = this.call(console[method], console);
    }, Function.prototype.bind);
}
// IE8, IE7 and lower, and other old browsers
else {
	console = {log:function(){}};
}



// 前端，只有在html页面中想获取地址栏中的汉字并显示在input框中，这个时候需要decodeURI, 例如wine.html中:
//  $("#keyword").val(decodeURI(param("name")));
// 其他情况一律不需要编码。
// 对"测试" 2个字的编码过程理解：
// 地址栏中实际上是
//  encodeURI("测试") 函数的结果
//  "%E6%B5%8B%E8%AF%95"
// 对ruby而言，
//  就是收到上述的编码
//  到ruby中，要正常显示该汉字， 则需要 CGI.unescape()来获取，即把"%E6%B5%8B%E8%AF%95" 转换为汉字。
function param(name) {
  var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
  var value = window.location.search.substr(1).match(reg);

  if (value != null) return decodeURIComponent(value[2]);

  return "";
}

/*****************************************************************************************
 * 页面渲染框架
 *****************************************************************************************/
function tip(what) {
	// body...
	$(".hint").html(what);
	$(".hint").addClass("hintShow");
	window.setTimeout(function () {
		// body...
		$(".hint").removeClass("hintShow");
		window.setTimeout(function () {
			// body...
			$(".hint").html("");
		}, 650)
	}, 3500)
}

isJson = function(obj) {
  var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && typeof(obj.length) == "undefined";
  return isjson;
}

function apphost() {
	
 /* return (/^t\.|test/).test(window.location.host) ? "/FinanceChain/api/employee/v1/" : "";*/
	return "/FinanceChain/api/employee/v1/";
}

function filehost() {
	
  return (/^t\.|test/).test(window.location.host) ? "http://file.95mst.com:8091" : "http://file.95mst.com";
	
}

function sys() {
	
  return "/sys;terminate=WEB";
}

function sysWithToken() {
	
  return sys();
}

function toView(jsonData, needRefresh) {
  // console.log("the json data is :", jsonData)
  if (jsonData.status != undefined && jsonData.status == "fail") return false;

  var doc = window.document;
  var result = jsonData.result;
  result.dual = "";
  var name, els, el;

  for (var key in result) {
    // user: {name: xxx, gender: male, email}
    // html element's name: user.name user.gender user.email
	if (result[key] == null) continue;
    if (isJson(result[key])) {
      for (var k in result[key]) {
    	// attr01: {replyCode1: cm, replyCode2: black, ..., tolerence: {normalValue: 50, upperValue: 0.01, downValue: 0.01}}
  		if (result[key][k] == null) continue;
    	if (isJson(result[key][k])) {
    		for (var j in result[key][k]) {
    			name = key + "." + k + "." + j;
    			els = $("[name='" + name + "']");
    			if (els.length == 0) continue;
    			for (var l = 0; el = els[l]; l++) valueTo(el, result[key][k][j]);
    		}
    		continue;
    	}
    		
        name = key + "." + k;
        els = $("[name='" + name + "']");
        if (els.length == 0) continue;
        for (var i = 0; el = els[i]; i++) valueTo(el, result[key][k]);
      }
      /** key 是  wines   {status: "succ", result: {wines: [{id: 1, name: "aaa"}, {id: 2, name: "bbb"}]}} **/
    } else if (result[key] instanceof Array) { // <ul name="wines"> <li name="winesTemplate"></li></ul>  
      //var template = document.getElementsByName(key + "Template")[0];
      var template = $.find("[name='" + key + "Template']:hidden");
	  if (template.length == 0) template = $.find("[name='" + key + "Template']");
      if (template.length == 0) {
        console.log(key + "Template does not exist, please check !!!!!!!!!!!!!!!!");
        continue;
      }
      if (needRefresh) $(template).parent().find("[name='" + key + "Template" + "']:not([style*='none'])").remove();
      if (result[key].length == 0) {
      	if($(template).parent().parent().find("div[name='nothingTip']").length == 0)
      		$(template).parent().after("<div name='nothingTip' style='margin: 10px; font-size: 14px; width: 100px;'>暂无数据!</div>")
     	continue;
      }else {
      	$($(template).parent().parent().find("div[name='nothingTip']")).remove();
      }
      var record;
      /** key 是  wines   {status: "succ", result: {wines: [{id: 1, name: "aaa"}, {id: 2, name: "bbb"}]}} **/
      /** record 是  {id: 1, name: "aaa"} 或 {id: 2, name: "bbb"} **/
      for (var i = 0; record = result[key][i]; i++) {
        //console.log(record)
        var row = $(template).clone();
        
        // add odd or even class.
        if (row.hasClass("odd")) {row.removeClass("odd"); row.addClass(i%2 == 0 ? "odd" : "even");}
		// if record(elements in Array) is String or number ,not json object, look for elements with name's value is "name".
		if ( typeof record == "string" || typeof record == "number" ) {
          els = row.find("[name='name']");
          if (els.length == 0) continue;
          for (var j = 0; el = els[j]; j++) valueTo(el, record);
		} else { // record is a json object.
			record.rowNo = i + 1; // 添加行号，和业务没有关系
			// <option value="" name=otherRolesTemplate  style="display: none" function=roleOptionValueTo></option>
			// key is otherRoles, otherRoles :[{id: 1, name: "sysAdmin"},{id: 2, name: "operator"}]
			// after the below statement, record is {id: 1, name: "sysAdmin", otherRolesTemplate: {id: 1, name: "sysAdmin"}}
			if (row.prop("tagName") == "OPTION") record[key + "Template"] = JSON.stringify(record); 
			//keys.push("rowNo");
			for (var k in record) {
				// for OPTION, row is himself, so row.find(...)'s result is null.
				// and so we must push row into els.
				if (k == key + "Template") els.push(row[0])
				else els = row.find("[name='" + k + "']");
				if (els.length == 0) continue;
				for (var j = 0; el = els[j]; j++) valueTo(el, record[k]);
			}
		}
		row.css({"display":""});
		$(template).parent().append(row.prop("outerHTML"))
      }
    } else {
      els = $("[name='" + key + "']");
      if (els.length == 0) continue;
      for (var i = 0; el = els[i]; i++) valueTo(el, result[key]);
    }
  }
}

function valueTo(el, value) {
	if (null == value) value = "";
	if (el.getAttribute("function") != undefined && el.getAttribute("function").trimAll().length > 1) {
		var func = el.getAttribute("function").trimAll();
		//console.log(func)
		eval(func + '(el, value)');
		return;
	}
	valueToWithNoFunc(el, value);
}

function valueToWithNoFunc(el, value) {
	//console.log(el)
	if (null == value) value = "";
	if (el.tagName == "A") {
		el.href = el.href.replace(window.location.href,"").replaceAll("#{" + el.getAttribute("name") + "}", value)
	} 
	else if(el.tagName == "BUTTON") {
		if (typeof($(el).data("url")) != "undefined")
			$(el).data("url", $(el).data("url").replaceAll("#{" + el.getAttribute("name") + "}", value));
		else if (typeof($(el).attr("data")) != "undefined")
			$(el).attr("data", value);
		else if (typeof($(el).attr("onclick")) != "undefined")
			$(el).attr("onclick", $(el).attr("onclick").replaceAll("#{" + el.getAttribute("name") + "}", value)) ;
	} 
	else if(el.tagName == "INPUT") {
		if (el.type == "radio") 
			el.checked = $(el).attr("value") == value ?  true : false;
		else
			$(el).attr("value", value);
	}
	else if(el.tagName == "IMG") el.src = value;
	else if(el.tagName == "TEXTAREA") $(el).text(value.replace(/\\n/g,"\n"));
	else if(el.tagName == "SELECT") $(el).val(value);
	else if(el.tagName == "TITLE") el.innerHTML = el.innerHTML + value;
	else if(el.tagName == "OPTION") {
		el.innerHTML = value.text;
		el.value = value.value;
	}
	else el.innerHTML = value;
}

function right(jsonData) {
	if (typeof(jsonData.result.err) != 'undefined') {
		tip(jsonData.result.err);
		return false;
	} else
		return true;
}

/*****************************************************************************************
 * 页面渲染框架 end
 *****************************************************************************************/

function ispc() {
  var userAgentInfo = navigator.userAgent;
  var agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
  var flag = true;
  for (var v = 0; v < agents.length; v++) {
    if (userAgentInfo.indexOf(agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}

var $$ = function(id) {
  return "string" == typeof id ? document.getElementById(id) : id;
};

/*****************************************************************************************
 * 字符， 日期 工具类型函数
 *****************************************************************************************/
String.prototype.replaceAll = function(reg,input) {
  return this.replace(new RegExp(reg,"gm"),input);
}
String.prototype.include = function(pattern) {
  return this.indexOf(pattern) > -1;
}
String.prototype.trimAll = function() {
  return this.replace(/\s+/g,"");
}
String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g,"");
}
String.prototype.ltrim = function() {
  return this.replace(/^\s*/g, "");
}
String.prototype.rtrim = function() {
  return this.replace(/\/s*$/g, "");
}
/**
 * #    %23
 * /    %2f
 * \    %5C
 * ;    %3B
 * ?    %3F
 * =    %3D
 * %    %25
 * #/\;?=%
 */
String.prototype.escape = function() {
	return this.replaceAll("%","%25").replaceAll("#","%23").replaceAll("/","%2F").replace(/\n/g, "%5Cn").replace(/\\/g, "%5C").replaceAll(";","%3B").replace(/\?/g,"%3F").replaceAll("=","%3D");
}

String.prototype.unique = function() {
	if (this == "") return "";
	var self = this.replace(/[\s|,]+/g," ");
	if (self == " ") return " ";
	self = self.split(" ");
    var result = [], hash = {};
    for (var i = 0, elem; (elem = self[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result.join(" ");
}
String.prototype.newlineWithBr = function() { // 解决在h5,h4等元素中不换行的问题。
	return this.replaceAll("\\\\n","<br />");
}
String.prototype.newlineWithSlashN = function() { // 解决在textarea元素中不换行的问题。
	return this.replace(/\\n/g, "\n");
}
Date.prototype.toDay = function() {
  var thisMonth = this.getMonth() + 1
  if(thisMonth < 10)
  	thisMonth = "0" + thisMonth;
  	
  var thisDay = this.getDate();
  if(thisDay < 10)
  	thisDay = "0" + thisDay;
	
  return this.getFullYear() + "-" + thisMonth + "-" + thisDay;
}

Date.prototype.toFullDay = function() {
  var thisMonth = this.getMonth() + 1
  if(thisMonth < 10)
  thisMonth = "0" + thisMonth;
	
  return this.getFullYear() + "-" + thisMonth + "-" + this.getDate() + " " + this.getHours() + ":" + this.getMinutes() + ":" + this.getSeconds();
}
Array.prototype.include = function(input) {
	for(var i = 0; i < this.length; i++) {
		if (this[i].include(input)) return true;
	}
  return false;
}
///集合取交集
Array.intersect = function () {
    var result = new Array();
    var obj = {};
    for (var i = 0; i < arguments.length; i++) {
        for (var j = 0; j < arguments[i].length; j++) {
            var str = arguments[i][j];
            if (!obj[str])
                obj[str] = 1;
            else {
                obj[str]++;
                if (obj[str] == arguments.length)
                    result.push(str);
            }//end else
        }//end for j
    }//end for i
    return result;
}

/**  
* js时间对象的格式化; 
* eg:format="yyyy-MM-dd hh:mm:ss";   
*/  
Date.prototype.format = function(format) { 
	var o = { 
		"M+": this.getMonth() + 1, //month 
		"d+": this.getDate(), //day 
		"h+": this.getHours(), //hour 
		"m+": this.getMinutes(), //minute 
		"s+": this.getSeconds(), //second 
		"q+": Math.floor((this.getMonth() + 3) / 3), //quarter 
		"S": this.getMilliseconds() //millisecond 
	} 
	if (/(y+)/.test(format)) { 
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length)); 
	} 
	for (var k in o) { 
		if (new RegExp("(" + k + ")").test(format)) { 
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)); 
		} 
	} 
	return format; 
} 
/** 
*js中更改日期  
* y年， m月， d日， h小时， n分钟，s秒  
*/  
Date.prototype.add = function (part, value) {  
    value *= 1;  
    if (isNaN(value)) {  
        value = 0;  
    }  
    switch (part) {  
        case "y":  
            this.setFullYear(this.getFullYear() + value);  
            break;  
        case "m":  
            this.setMonth(this.getMonth() + value);  
            break;  
        case "d":  
            this.setDate(this.getDate() + value);  
            break;  
        case "h":  
            this.setHours(this.getHours() + value);  
            break;  
        case "n":  
            this.setMinutes(this.getMinutes() + value);  
            break;  
        case "s":  
            this.setSeconds(this.getSeconds() + value);  
            break;  
        default:  
   
    }  
}  
Array.prototype.unique = function() {
    var result = [], hash = {};
    for (var i = 0, elem; (elem = this[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result;
}
Array.prototype.last = function() {

	if ( this.length == 0 ) return null;

	return this[this.length - 1];
}
Array.prototype.contains = function(input) {
	for (var i in this) {
		if (this[i].indexOf(input)) return true;
	}
	return false;
}
function toChineseCurrency(input) {
	input = String(input);
	var MAXIMUM_NUMBER = 99999999999.99;  //最大值
	// 定义转移字符
	var CN_ZERO = "零", CN_ONE = "壹", CN_TWO = "贰", CN_THREE = "叁", CN_FOUR = "肆", CN_FIVE = "伍", CN_SIX = "陆", CN_SEVEN = "柒", CN_EIGHT = "捌";
	var CN_NINE = "玖", CN_TEN = "拾", CN_HUNDRED = "佰", CN_THOUSAND = "仟", CN_TEN_THOUSAND = "万", CN_HUNDRED_MILLION = "亿";
	var CN_DOLLAR = "元", CN_TEN_CENT = "角", CN_CENT = "分", CN_INTEGER = "整";
	
	// 初始化验证:
	var integral, decimal, output, parts;
	var digits, radices, bigRadices, decimals;
	var zeroCount;
	var i, p, d;
	var quotient, modulus;
	
	parts = input.split(".");
	if (parts.length > 1) {
	    integral = parts[0];
	    decimal = parts[1];
	    decimal = decimal.substr(0, 2);
	} else {
	    integral = parts[0];
	    decimal = "";
	}
	// 实例化字符大写人民币汉字对应的数字
	digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE, CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE);
	radices = new Array("", CN_TEN, CN_HUNDRED, CN_THOUSAND);
	bigRadices = new Array("", CN_TEN_THOUSAND, CN_HUNDRED_MILLION);
	decimals = new Array(CN_TEN_CENT, CN_CENT);
	
	output = "";
	//大于零处理逻辑
	if (Number(integral) > 0) {
	    zeroCount = 0;
	    for (i = 0; i < integral.length; i++) {
	        p = integral.length - i - 1;
	        d = integral.substr(i, 1);
	        quotient = p / 4;
	        modulus = p % 4;
	        if (d == "0") {zeroCount++;}
	        else {
	            if (zeroCount > 0) {output += digits[0];}
	            zeroCount = 0;
	            output += digits[Number(d)] + radices[modulus];
	        }
	        if (modulus == 0 && zeroCount < 4) {output += bigRadices[quotient];}
	    }
	    output += CN_DOLLAR;
	}
	// 包含小数部分处理逻辑
	if (decimal != "") {
	    for (i = 0; i < decimal.length; i++) {
	        d = decimal.substr(i, 1);
	        if (d != "0") {output += digits[Number(d)] + decimals[i];}
	    }
	}
	//确认并返回最终的输出字符串
	if (output == "") {output = CN_ZERO + CN_DOLLAR;}
	if (decimal == "") {output += CN_INTEGER;}
	
	return output;
}
/*****************************************************************************************
 * 字符， 日期 工具类型函数 end
 *****************************************************************************************/

// 禁止事件传播
function stopBubble(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  else e.cancelBubble = true;
  if (e && e.preventDefault) e.preventDefault();
  else e.returnValue = false;
}

// 回退
function back() {
  var href = window.location.href;
  if(/#top/.test(href)){
    window.history.go(-2);
    window.location.load(window.location.href)
  }
  else{
    window.history.back();
    window.location.load(window.location.href)
  }
}

function backLogout() {
	$.ajax({
		type: "post",
		url: apphost() + "/part/back/logout/" + $.cookie("sid") + "/sys",
		dataType: "json",
		success: function (jsonData) {

			window.location = "/back/login.html";
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			console.log("ajax request error: ", errorThrown);
		}
	});
	
}
function adminLogout() {
	$.ajax({
		type: "post",
		url: apphost() + "/part/admin/logout/" + $.cookie("sid") + "/sys",
		dataType: "json",
		success: function (jsonData) {

			window.location = "/admin/login.html";
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			console.log("ajax request error: ", errorThrown);
		}
	});
	
}


/*****************************************************************************************
 * 地区，工作类型等业务主数据函数（下拉列表）
 *****************************************************************************************/
function region(parentId, elementId, allName) {
	if (!parentId || parentId == "") {
		$("#" + elementId +" option").remove();
		return false;
	}
	$.ajax({
		type: "post",
		url: apphost() + "/part/regionService/children/" + parentId + "/sys",
		async: false,
		dataType: "json",
		success: function (data) {
			var r;
			if (right(data)) {
				var list = data.result.list;
				$("#" + elementId +" option").remove();
				if (list.length > 1 && allName) {
					$("#" + elementId).append("<option value=''>" + allName + "</option>");
				}
				for (var i = 0; r = list[i]; i++) {
					// 1.为Select追加一个Option(下拉项);
					$("#" + elementId).append("<option value='" + r.id + "'>" + r.name + "</option>"); 
				}
				if (list.length == 1) {
					region(list[0].id, "distId");
				}

			}

		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {
			console.log("ajax request error: ", errorThrown);
		}
	});
}

/*****************************************************************************************
 * 地区，工作类型等业务主数据函数 end
 *****************************************************************************************/

/*****************************************************************************************
 * 分页函数
 *****************************************************************************************/
/**
 * 页面中必须
 * 0. 必须有page-nav div元素
 * 1. 实现的查询列表函数_commit()，该函数必须为页面元素$$("total")完成赋值;
 * 2. 3个input: total, offset, limit
 * 3. <script type="text/javascript" src="/js/jquery.simplePagination.js"></script>
 * 4. <link rel="stylesheet" type="text/css" href="/css/simplePagination.css">
 * 5. 如果查询条件发生变化，需要重新初始化paginate控件：<button class="btn" onclick="paginateInit(); $$('offset').value=0;_commit();paginate();">查询</button>
**/
window.onload = function () { 
	paginate();
}

function paginate() {
	if ($$("page-nav")) {
		$("#page-nav").pagination({
			items: $$("total").value,
			itemsOnPage: $$("limit").value,
			cssStyle: "light-theme",
			onPageClick: function(pageIndex, event) {

				$$("offset").value = $$("limit").value * (pageIndex - 1);

				_commit();
			}
		});
	}
}
/*****************************************************************************************
 * 分页函数 end
 *****************************************************************************************/



