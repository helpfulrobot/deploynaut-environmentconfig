!function e(t,n,r){function a(u,o){if(!n[u]){if(!t[u]){var l="function"==typeof require&&require;if(!o&&l)return l(u,!0);if(i)return i(u,!0);var s=new Error("Cannot find module '"+u+"'");throw s.code="MODULE_NOT_FOUND",s}var c=n[u]={exports:{}};t[u][0].call(c.exports,function(e){var n=t[u][1][e];return a(n?n:e)},c,c.exports,e,t,n,r)}return n[u].exports}for(var i="function"==typeof require&&require,u=0;u<r.length;u++)a(r[u]);return a}({1:[function(e,t,n){var r=e("./variables.jsx"),a=e("./tools.jsx"),i=a.readInlineData("environmentconfig-variables-model"),u=a.readInlineData("environmentconfig-variables-blacklist");React.render(React.createElement(r,{model:i,blacklist:u,context:environmentConfigContext}),document.getElementById("environmentconfig-variables-holder"))},{"./tools.jsx":2,"./variables.jsx":5}],2:[function(e,t,n){t.exports={readInlineData:function(e){var t=document.getElementById(e),n=t.textContent||t.innerText,r=document.createElement("textarea");return r.innerHTML=n,JSON.parse(r.value)},deepCopyModel:function(e){for(var t=[],n=0;n<e.length;n++)e[n].deleted||e[n].vacant||t.push({variable:e[n].variable,value:e[n].value});return t}}},{}],3:[function(e,t,n){var r=e("./tools.jsx"),a=e("underscore.string/trim"),i=e("underscore"),u=React.createClass({displayName:"VariableEditor",getInitialState:function(){var e=r.deepCopyModel(this.props.model);return e.push({variable:"",value:"",vacant:!0}),{saving:!1,model:e,valid:!0,message:""}},save:function(e){e.stopPropagation(),e.preventDefault(),this.setState({saving:!0,message:""});var t=r.deepCopyModel(this.state.model);t.sort(function(e,t){return e.variable<t.variable?-1:e.variable>t.variable?1:0});for(var n={},a=0;a<t.length;a++)t[a].deleted||(n[t[a].variable]=t[a].value);var i=this;Q($.ajax({type:"POST",url:this.props.context.envUrl+"/configuration/save",data:{variables:JSON.stringify(n)}})).then(function(){i.props.editingSuccessful(t)},function(e){i.setState({saving:!1,message:"Failed to save changes: "+e.responseText})})},rowStateProxy:function(e){var t=this,n=function(){t.setState({model:t.state.model})},r=function(n){for(var r=0;r<t.state.model.length;r++)if(e!=r&&!t.state.model[r].deleted&&t.state.model[r].variable===n)return!1;return!0};return{isVacant:function(){return"undefined"!=typeof t.state.model[e].vacant&&t.state.model[e].vacant},setVariable:function(r){t.state.model[e].vacant&&t.state.model.push({variable:"",value:"",vacant:!0}),t.state.model[e].variable=r,t.state.model[e].vacant=!1,n()},setValue:function(r){t.state.model[e].value=r,n()},add:function(e,t){n()},remove:function(){t.state.model[e].deleted=!0,n()},validateVariable:function(e){if(""===a(e))return"Variable cannot be empty.";if(e.match(/[^a-zA-Z_0-9]/))return"Only alphanumerics and underscore permitted.";if(e.match(/^[0-9]/))return"Variable cannot start with a digit.";if(!r(e))return"Variable already exists.";if(t.props.blacklist)for(var n=0;n<t.props.blacklist.length;n++){var i=new RegExp(t.props.blacklist[n]);if(e.match(i))return"Variable is not allowed."}}}},handleValidationFail:function(){this.setState({valid:!1})},handleValidationSuccess:function(){this.setState({valid:!0})},render:function(){var e=this,t=0,n=i.map(this.state.model,function(n){var r;return n.deleted||(r=React.createElement(l,{key:t,disabled:e.state.saving,variable:n.variable,value:n.value,validationFail:e.handleValidationFail,validationSuccess:e.handleValidationSuccess,rowState:e.rowStateProxy(t)})),t++,r}),r=null;return this.state.message&&(r=React.createElement("div",{className:"alert alert-danger"},this.state.message)),React.createElement("form",{className:"variable-editor",onSubmit:this.save},React.createElement(o,{context:this.props.context,disabled:!this.state.valid,saving:this.state.saving,cancel:this.props.editingCancelled}),r,React.createElement("table",{className:"table table-striped"},React.createElement("thead",null,React.createElement("tr",null,React.createElement("th",{className:"variable"},"Variable"),React.createElement("th",{className:"value"},"Value"),React.createElement("th",{className:"actions"}," "))),React.createElement("tbody",null,n)))}}),o=React.createClass({displayName:"VariableEditorActions",render:function(){if(this.props.saving)var e="Saving...";else var e="Save";return React.createElement("div",{className:"variables-actions variable-editor-actions"},React.createElement("input",{type:"submit",disabled:this.props.disabled||this.props.saving,className:"btn btn-primary",value:e}),React.createElement("button",{type:"button",className:"btn btn-default",disabled:this.props.disabled||this.props.saving,onClick:this.props.cancel},"Cancel"))}}),l=React.createClass({displayName:"VariableEditorRow",handleVariableChange:function(e){this.props.rowState.setVariable(e.target.value)},handleValueChange:function(e){this.props.rowState.setValue(e.target.value)},validateVariable:function(e){return this.props.rowState.validateVariable(e)},render:function(){var e=null;return this.props.rowState.isVacant()||this.props.disabled||(e=React.createElement("button",{type:"button",className:"btn btn-danger btn-xs",onClick:this.props.rowState.remove,disabled:this.props.disabled},React.createElement("span",{className:"glyphicon glyphicon-remove","aria-hidden":"true"}))),React.createElement("tr",null,React.createElement("td",{className:"variable"},React.createElement(s,{disabled:this.props.disabled,type:"text",value:this.props.variable,onChange:this.handleVariableChange,validate:this.validateVariable,onValidationFail:this.props.validationFail,onValidationSuccess:this.props.validationSuccess})),React.createElement("td",{className:"value"},React.createElement("input",{disabled:this.props.disabled,type:"text",value:this.props.value,onChange:this.handleValueChange})),React.createElement("td",{className:"actions"},e))}}),s=React.createClass({displayName:"ValidatableInput",getInitialState:function(){return{message:""}},update:function(e){var t=this.props.validate(e);this.setState({message:t}),t?this.props.onValidationFail():this.props.onValidationSuccess()},handleChange:function(e){this.update(e.target.value),this.props.onChange&&this.props.onChange(e)},handleBlur:function(e){this.update(e.target.value),this.props.onBlur&&this.props.onBlur(e)},render:function(){return React.createElement("div",null,React.createElement("input",{disabled:this.props.disabled,type:this.props.type,onChange:this.handleChange,onBlur:this.handleBlur,value:this.props.value,defaultValue:this.props.defaultValue}),React.createElement("small",{className:"error"},this.state.message))}});t.exports=u},{"./tools.jsx":2,underscore:10,"underscore.string/trim":9}],4:[function(e,t,n){var r=e("underscore"),a=React.createClass({displayName:"VariableTable",render:function(){var e=r.map(this.props.model,function(e){return React.createElement(i,{key:e.variable+"_"+e.value,variable:e.variable,value:e.value})});return React.createElement("div",null,React.createElement("div",{className:"variables-actions variable-table-actions"},React.createElement("button",{type:"button",className:"btn btn-primary",onClick:this.props.startEditing},"Edit")),React.createElement("table",{className:"variable-table table table-striped"},React.createElement("thead",null,React.createElement("tr",null,React.createElement("th",{className:"variable"},"Variable"),React.createElement("th",{className:"value"},"Value"))),React.createElement("tbody",null,e)))}}),i=React.createClass({displayName:"VariableTableRow",render:function(){return React.createElement("tr",null,React.createElement("td",null,this.props.variable),React.createElement("td",null,this.props.value))}});t.exports=a},{underscore:10}],5:[function(e,t,n){var r=e("underscore"),a=e("./variable_table.jsx"),i=e("./variable_editor.jsx"),u=React.createClass({displayName:"Variables",getInitialState:function(){var e=this,t=r.map(r.keys(this.props.model),function(t){return{variable:t,value:e.props.model[t]}});return{editing:!1,model:t}},startEditing:function(){this.setState({editing:!0})},editingSuccessful:function(e){this.setState({editing:!1,model:e})},editingCancelled:function(){this.setState({editing:!1})},render:function(){return this.state.editing?React.createElement(i,{context:this.props.context,blacklist:this.props.blacklist,model:this.state.model,editingSuccessful:this.editingSuccessful,editingCancelled:this.editingCancelled}):React.createElement(a,{context:this.props.context,model:this.state.model,startEditing:this.startEditing})}});t.exports=u},{"./variable_editor.jsx":3,"./variable_table.jsx":4,underscore:10}],6:[function(e,t,n){var r=e("./escapeRegExp");t.exports=function(e){return null==e?"\\s":e.source?e.source:"["+r(e)+"]"}},{"./escapeRegExp":7}],7:[function(e,t,n){var r=e("./makeString");t.exports=function(e){return r(e).replace(/([.*+?^=!:${}()|[\]\/\\])/g,"\\$1")}},{"./makeString":8}],8:[function(e,t,n){t.exports=function(e){return null==e?"":""+e}},{}],9:[function(e,t,n){var r=e("./helper/makeString"),a=e("./helper/defaultToWhiteSpace"),i=String.prototype.trim;t.exports=function(e,t){return e=r(e),!t&&i?i.call(e):(t=a(t),e.replace(new RegExp("^"+t+"+|"+t+"+$","g"),""))}},{"./helper/defaultToWhiteSpace":6,"./helper/makeString":8}],10:[function(e,t,n){(function(){function e(e){function t(t,n,r,a,i,u){for(;i>=0&&u>i;i+=e){var o=a?a[i]:i;r=n(r,t[o],o,t)}return r}return function(n,r,a,i){r=E(r,i,4);var u=!N(n)&&x.keys(n),o=(u||n).length,l=e>0?0:o-1;return arguments.length<3&&(a=n[u?u[l]:l],l+=e),t(n,r,a,u,l,o)}}function r(e){return function(t,n,r){n=R(n,r);for(var a=k(t),i=e>0?0:a-1;i>=0&&a>i;i+=e)if(n(t[i],i,t))return i;return-1}}function a(e,t,n){return function(r,a,i){var u=0,o=k(r);if("number"==typeof i)e>0?u=i>=0?i:Math.max(i+o,u):o=i>=0?Math.min(i+1,o):i+o+1;else if(n&&i&&o)return i=n(r,a),r[i]===a?i:-1;if(a!==a)return i=t(p.call(r,u,o),x.isNaN),i>=0?i+u:-1;for(i=e>0?u:o-1;i>=0&&o>i;i+=e)if(r[i]===a)return i;return-1}}function i(e,t){var n=F.length,r=e.constructor,a=x.isFunction(r)&&r.prototype||s,i="constructor";for(x.has(e,i)&&!x.contains(t,i)&&t.push(i);n--;)i=F[n],i in e&&e[i]!==a[i]&&!x.contains(t,i)&&t.push(i)}var u=this,o=u._,l=Array.prototype,s=Object.prototype,c=Function.prototype,f=l.push,p=l.slice,d=s.toString,v=s.hasOwnProperty,h=Array.isArray,m=Object.keys,g=c.bind,b=Object.create,y=function(){},x=function(e){return e instanceof x?e:this instanceof x?void(this._wrapped=e):new x(e)};"undefined"!=typeof n?("undefined"!=typeof t&&t.exports&&(n=t.exports=x),n._=x):u._=x,x.VERSION="1.8.3";var E=function(e,t,n){if(void 0===t)return e;switch(null==n?3:n){case 1:return function(n){return e.call(t,n)};case 2:return function(n,r){return e.call(t,n,r)};case 3:return function(n,r,a){return e.call(t,n,r,a)};case 4:return function(n,r,a,i){return e.call(t,n,r,a,i)}}return function(){return e.apply(t,arguments)}},R=function(e,t,n){return null==e?x.identity:x.isFunction(e)?E(e,t,n):x.isObject(e)?x.matcher(e):x.property(e)};x.iteratee=function(e,t){return R(e,t,1/0)};var S=function(e,t){return function(n){var r=arguments.length;if(2>r||null==n)return n;for(var a=1;r>a;a++)for(var i=arguments[a],u=e(i),o=u.length,l=0;o>l;l++){var s=u[l];t&&void 0!==n[s]||(n[s]=i[s])}return n}},w=function(e){if(!x.isObject(e))return{};if(b)return b(e);y.prototype=e;var t=new y;return y.prototype=null,t},j=function(e){return function(t){return null==t?void 0:t[e]}},_=Math.pow(2,53)-1,k=j("length"),N=function(e){var t=k(e);return"number"==typeof t&&t>=0&&_>=t};x.each=x.forEach=function(e,t,n){t=E(t,n);var r,a;if(N(e))for(r=0,a=e.length;a>r;r++)t(e[r],r,e);else{var i=x.keys(e);for(r=0,a=i.length;a>r;r++)t(e[i[r]],i[r],e)}return e},x.map=x.collect=function(e,t,n){t=R(t,n);for(var r=!N(e)&&x.keys(e),a=(r||e).length,i=Array(a),u=0;a>u;u++){var o=r?r[u]:u;i[u]=t(e[o],o,e)}return i},x.reduce=x.foldl=x.inject=e(1),x.reduceRight=x.foldr=e(-1),x.find=x.detect=function(e,t,n){var r;return r=N(e)?x.findIndex(e,t,n):x.findKey(e,t,n),void 0!==r&&-1!==r?e[r]:void 0},x.filter=x.select=function(e,t,n){var r=[];return t=R(t,n),x.each(e,function(e,n,a){t(e,n,a)&&r.push(e)}),r},x.reject=function(e,t,n){return x.filter(e,x.negate(R(t)),n)},x.every=x.all=function(e,t,n){t=R(t,n);for(var r=!N(e)&&x.keys(e),a=(r||e).length,i=0;a>i;i++){var u=r?r[i]:i;if(!t(e[u],u,e))return!1}return!0},x.some=x.any=function(e,t,n){t=R(t,n);for(var r=!N(e)&&x.keys(e),a=(r||e).length,i=0;a>i;i++){var u=r?r[i]:i;if(t(e[u],u,e))return!0}return!1},x.contains=x.includes=x.include=function(e,t,n,r){return N(e)||(e=x.values(e)),("number"!=typeof n||r)&&(n=0),x.indexOf(e,t,n)>=0},x.invoke=function(e,t){var n=p.call(arguments,2),r=x.isFunction(t);return x.map(e,function(e){var a=r?t:e[t];return null==a?a:a.apply(e,n)})},x.pluck=function(e,t){return x.map(e,x.property(t))},x.where=function(e,t){return x.filter(e,x.matcher(t))},x.findWhere=function(e,t){return x.find(e,x.matcher(t))},x.max=function(e,t,n){var r,a,i=-(1/0),u=-(1/0);if(null==t&&null!=e){e=N(e)?e:x.values(e);for(var o=0,l=e.length;l>o;o++)r=e[o],r>i&&(i=r)}else t=R(t,n),x.each(e,function(e,n,r){a=t(e,n,r),(a>u||a===-(1/0)&&i===-(1/0))&&(i=e,u=a)});return i},x.min=function(e,t,n){var r,a,i=1/0,u=1/0;if(null==t&&null!=e){e=N(e)?e:x.values(e);for(var o=0,l=e.length;l>o;o++)r=e[o],i>r&&(i=r)}else t=R(t,n),x.each(e,function(e,n,r){a=t(e,n,r),(u>a||a===1/0&&i===1/0)&&(i=e,u=a)});return i},x.shuffle=function(e){for(var t,n=N(e)?e:x.values(e),r=n.length,a=Array(r),i=0;r>i;i++)t=x.random(0,i),t!==i&&(a[i]=a[t]),a[t]=n[i];return a},x.sample=function(e,t,n){return null==t||n?(N(e)||(e=x.values(e)),e[x.random(e.length-1)]):x.shuffle(e).slice(0,Math.max(0,t))},x.sortBy=function(e,t,n){return t=R(t,n),x.pluck(x.map(e,function(e,n,r){return{value:e,index:n,criteria:t(e,n,r)}}).sort(function(e,t){var n=e.criteria,r=t.criteria;if(n!==r){if(n>r||void 0===n)return 1;if(r>n||void 0===r)return-1}return e.index-t.index}),"value")};var V=function(e){return function(t,n,r){var a={};return n=R(n,r),x.each(t,function(r,i){var u=n(r,i,t);e(a,r,u)}),a}};x.groupBy=V(function(e,t,n){x.has(e,n)?e[n].push(t):e[n]=[t]}),x.indexBy=V(function(e,t,n){e[n]=t}),x.countBy=V(function(e,t,n){x.has(e,n)?e[n]++:e[n]=1}),x.toArray=function(e){return e?x.isArray(e)?p.call(e):N(e)?x.map(e,x.identity):x.values(e):[]},x.size=function(e){return null==e?0:N(e)?e.length:x.keys(e).length},x.partition=function(e,t,n){t=R(t,n);var r=[],a=[];return x.each(e,function(e,n,i){(t(e,n,i)?r:a).push(e)}),[r,a]},x.first=x.head=x.take=function(e,t,n){return null==e?void 0:null==t||n?e[0]:x.initial(e,e.length-t)},x.initial=function(e,t,n){return p.call(e,0,Math.max(0,e.length-(null==t||n?1:t)))},x.last=function(e,t,n){return null==e?void 0:null==t||n?e[e.length-1]:x.rest(e,Math.max(0,e.length-t))},x.rest=x.tail=x.drop=function(e,t,n){return p.call(e,null==t||n?1:t)},x.compact=function(e){return x.filter(e,x.identity)};var C=function(e,t,n,r){for(var a=[],i=0,u=r||0,o=k(e);o>u;u++){var l=e[u];if(N(l)&&(x.isArray(l)||x.isArguments(l))){t||(l=C(l,t,n));var s=0,c=l.length;for(a.length+=c;c>s;)a[i++]=l[s++]}else n||(a[i++]=l)}return a};x.flatten=function(e,t){return C(e,t,!1)},x.without=function(e){return x.difference(e,p.call(arguments,1))},x.uniq=x.unique=function(e,t,n,r){x.isBoolean(t)||(r=n,n=t,t=!1),null!=n&&(n=R(n,r));for(var a=[],i=[],u=0,o=k(e);o>u;u++){var l=e[u],s=n?n(l,u,e):l;t?(u&&i===s||a.push(l),i=s):n?x.contains(i,s)||(i.push(s),a.push(l)):x.contains(a,l)||a.push(l)}return a},x.union=function(){return x.uniq(C(arguments,!0,!0))},x.intersection=function(e){for(var t=[],n=arguments.length,r=0,a=k(e);a>r;r++){var i=e[r];if(!x.contains(t,i)){for(var u=1;n>u&&x.contains(arguments[u],i);u++);u===n&&t.push(i)}}return t},x.difference=function(e){var t=C(arguments,!0,!0,1);return x.filter(e,function(e){return!x.contains(t,e)})},x.zip=function(){return x.unzip(arguments)},x.unzip=function(e){for(var t=e&&x.max(e,k).length||0,n=Array(t),r=0;t>r;r++)n[r]=x.pluck(e,r);return n},x.object=function(e,t){for(var n={},r=0,a=k(e);a>r;r++)t?n[e[r]]=t[r]:n[e[r][0]]=e[r][1];return n},x.findIndex=r(1),x.findLastIndex=r(-1),x.sortedIndex=function(e,t,n,r){n=R(n,r,1);for(var a=n(t),i=0,u=k(e);u>i;){var o=Math.floor((i+u)/2);n(e[o])<a?i=o+1:u=o}return i},x.indexOf=a(1,x.findIndex,x.sortedIndex),x.lastIndexOf=a(-1,x.findLastIndex),x.range=function(e,t,n){null==t&&(t=e||0,e=0),n=n||1;for(var r=Math.max(Math.ceil((t-e)/n),0),a=Array(r),i=0;r>i;i++,e+=n)a[i]=e;return a};var O=function(e,t,n,r,a){if(!(r instanceof t))return e.apply(n,a);var i=w(e.prototype),u=e.apply(i,a);return x.isObject(u)?u:i};x.bind=function(e,t){if(g&&e.bind===g)return g.apply(e,p.call(arguments,1));if(!x.isFunction(e))throw new TypeError("Bind must be called on a function");var n=p.call(arguments,2),r=function(){return O(e,r,t,this,n.concat(p.call(arguments)))};return r},x.partial=function(e){var t=p.call(arguments,1),n=function(){for(var r=0,a=t.length,i=Array(a),u=0;a>u;u++)i[u]=t[u]===x?arguments[r++]:t[u];for(;r<arguments.length;)i.push(arguments[r++]);return O(e,n,this,this,i)};return n},x.bindAll=function(e){var t,n,r=arguments.length;if(1>=r)throw new Error("bindAll must be passed function names");for(t=1;r>t;t++)n=arguments[t],e[n]=x.bind(e[n],e);return e},x.memoize=function(e,t){var n=function(r){var a=n.cache,i=""+(t?t.apply(this,arguments):r);return x.has(a,i)||(a[i]=e.apply(this,arguments)),a[i]};return n.cache={},n},x.delay=function(e,t){var n=p.call(arguments,2);return setTimeout(function(){return e.apply(null,n)},t)},x.defer=x.partial(x.delay,x,1),x.throttle=function(e,t,n){var r,a,i,u=null,o=0;n||(n={});var l=function(){o=n.leading===!1?0:x.now(),u=null,i=e.apply(r,a),u||(r=a=null)};return function(){var s=x.now();o||n.leading!==!1||(o=s);var c=t-(s-o);return r=this,a=arguments,0>=c||c>t?(u&&(clearTimeout(u),u=null),o=s,i=e.apply(r,a),u||(r=a=null)):u||n.trailing===!1||(u=setTimeout(l,c)),i}},x.debounce=function(e,t,n){var r,a,i,u,o,l=function(){var s=x.now()-u;t>s&&s>=0?r=setTimeout(l,t-s):(r=null,n||(o=e.apply(i,a),r||(i=a=null)))};return function(){i=this,a=arguments,u=x.now();var s=n&&!r;return r||(r=setTimeout(l,t)),s&&(o=e.apply(i,a),i=a=null),o}},x.wrap=function(e,t){return x.partial(t,e)},x.negate=function(e){return function(){return!e.apply(this,arguments)}},x.compose=function(){var e=arguments,t=e.length-1;return function(){for(var n=t,r=e[t].apply(this,arguments);n--;)r=e[n].call(this,r);return r}},x.after=function(e,t){return function(){return--e<1?t.apply(this,arguments):void 0}},x.before=function(e,t){var n;return function(){return--e>0&&(n=t.apply(this,arguments)),1>=e&&(t=null),n}},x.once=x.partial(x.before,2);var A=!{toString:null}.propertyIsEnumerable("toString"),F=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"];x.keys=function(e){if(!x.isObject(e))return[];if(m)return m(e);var t=[];for(var n in e)x.has(e,n)&&t.push(n);return A&&i(e,t),t},x.allKeys=function(e){if(!x.isObject(e))return[];var t=[];for(var n in e)t.push(n);return A&&i(e,t),t},x.values=function(e){for(var t=x.keys(e),n=t.length,r=Array(n),a=0;n>a;a++)r[a]=e[t[a]];return r},x.mapObject=function(e,t,n){t=R(t,n);for(var r,a=x.keys(e),i=a.length,u={},o=0;i>o;o++)r=a[o],u[r]=t(e[r],r,e);return u},x.pairs=function(e){for(var t=x.keys(e),n=t.length,r=Array(n),a=0;n>a;a++)r[a]=[t[a],e[t[a]]];return r},x.invert=function(e){for(var t={},n=x.keys(e),r=0,a=n.length;a>r;r++)t[e[n[r]]]=n[r];return t},x.functions=x.methods=function(e){var t=[];for(var n in e)x.isFunction(e[n])&&t.push(n);return t.sort()},x.extend=S(x.allKeys),x.extendOwn=x.assign=S(x.keys),x.findKey=function(e,t,n){t=R(t,n);for(var r,a=x.keys(e),i=0,u=a.length;u>i;i++)if(r=a[i],t(e[r],r,e))return r},x.pick=function(e,t,n){var r,a,i={},u=e;if(null==u)return i;x.isFunction(t)?(a=x.allKeys(u),r=E(t,n)):(a=C(arguments,!1,!1,1),r=function(e,t,n){return t in n},u=Object(u));for(var o=0,l=a.length;l>o;o++){var s=a[o],c=u[s];r(c,s,u)&&(i[s]=c)}return i},x.omit=function(e,t,n){if(x.isFunction(t))t=x.negate(t);else{var r=x.map(C(arguments,!1,!1,1),String);t=function(e,t){return!x.contains(r,t)}}return x.pick(e,t,n)},x.defaults=S(x.allKeys,!0),x.create=function(e,t){var n=w(e);return t&&x.extendOwn(n,t),n},x.clone=function(e){return x.isObject(e)?x.isArray(e)?e.slice():x.extend({},e):e},x.tap=function(e,t){return t(e),e},x.isMatch=function(e,t){var n=x.keys(t),r=n.length;if(null==e)return!r;for(var a=Object(e),i=0;r>i;i++){var u=n[i];if(t[u]!==a[u]||!(u in a))return!1}return!0};var I=function(e,t,n,r){if(e===t)return 0!==e||1/e===1/t;if(null==e||null==t)return e===t;e instanceof x&&(e=e._wrapped),t instanceof x&&(t=t._wrapped);var a=d.call(e);if(a!==d.call(t))return!1;switch(a){case"[object RegExp]":case"[object String]":return""+e==""+t;case"[object Number]":return+e!==+e?+t!==+t:0===+e?1/+e===1/t:+e===+t;case"[object Date]":case"[object Boolean]":return+e===+t}var i="[object Array]"===a;if(!i){if("object"!=typeof e||"object"!=typeof t)return!1;var u=e.constructor,o=t.constructor;if(u!==o&&!(x.isFunction(u)&&u instanceof u&&x.isFunction(o)&&o instanceof o)&&"constructor"in e&&"constructor"in t)return!1}n=n||[],r=r||[];for(var l=n.length;l--;)if(n[l]===e)return r[l]===t;if(n.push(e),r.push(t),i){if(l=e.length,l!==t.length)return!1;for(;l--;)if(!I(e[l],t[l],n,r))return!1}else{var s,c=x.keys(e);if(l=c.length,x.keys(t).length!==l)return!1;for(;l--;)if(s=c[l],!x.has(t,s)||!I(e[s],t[s],n,r))return!1}return n.pop(),r.pop(),!0};x.isEqual=function(e,t){return I(e,t)},x.isEmpty=function(e){return null==e?!0:N(e)&&(x.isArray(e)||x.isString(e)||x.isArguments(e))?0===e.length:0===x.keys(e).length},x.isElement=function(e){return!(!e||1!==e.nodeType)},x.isArray=h||function(e){return"[object Array]"===d.call(e)},x.isObject=function(e){var t=typeof e;return"function"===t||"object"===t&&!!e},x.each(["Arguments","Function","String","Number","Date","RegExp","Error"],function(e){x["is"+e]=function(t){return d.call(t)==="[object "+e+"]"}}),x.isArguments(arguments)||(x.isArguments=function(e){return x.has(e,"callee")}),"function"!=typeof/./&&"object"!=typeof Int8Array&&(x.isFunction=function(e){return"function"==typeof e||!1}),x.isFinite=function(e){return isFinite(e)&&!isNaN(parseFloat(e))},x.isNaN=function(e){return x.isNumber(e)&&e!==+e},x.isBoolean=function(e){return e===!0||e===!1||"[object Boolean]"===d.call(e)},x.isNull=function(e){return null===e},x.isUndefined=function(e){return void 0===e},x.has=function(e,t){return null!=e&&v.call(e,t)},x.noConflict=function(){return u._=o,this},x.identity=function(e){return e},x.constant=function(e){return function(){return e}},x.noop=function(){},x.property=j,x.propertyOf=function(e){return null==e?function(){}:function(t){return e[t]}},x.matcher=x.matches=function(e){return e=x.extendOwn({},e),function(t){return x.isMatch(t,e)}},x.times=function(e,t,n){var r=Array(Math.max(0,e));t=E(t,n,1);for(var a=0;e>a;a++)r[a]=t(a);return r},x.random=function(e,t){return null==t&&(t=e,e=0),e+Math.floor(Math.random()*(t-e+1))},x.now=Date.now||function(){return(new Date).getTime()};var M={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},T=x.invert(M),B=function(e){var t=function(t){return e[t]},n="(?:"+x.keys(e).join("|")+")",r=RegExp(n),a=RegExp(n,"g");return function(e){return e=null==e?"":""+e,r.test(e)?e.replace(a,t):e}};x.escape=B(M),x.unescape=B(T),x.result=function(e,t,n){var r=null==e?void 0:e[t];return void 0===r&&(r=n),x.isFunction(r)?r.call(e):r};var q=0;x.uniqueId=function(e){var t=++q+"";return e?e+t:t},x.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var D=/(.)^/,P={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},z=/\\|'|\r|\n|\u2028|\u2029/g,K=function(e){return"\\"+P[e]};x.template=function(e,t,n){!t&&n&&(t=n),t=x.defaults({},t,x.templateSettings);var r=RegExp([(t.escape||D).source,(t.interpolate||D).source,(t.evaluate||D).source].join("|")+"|$","g"),a=0,i="__p+='";e.replace(r,function(t,n,r,u,o){return i+=e.slice(a,o).replace(z,K),a=o+t.length,n?i+="'+\n((__t=("+n+"))==null?'':_.escape(__t))+\n'":r?i+="'+\n((__t=("+r+"))==null?'':__t)+\n'":u&&(i+="';\n"+u+"\n__p+='"),t}),i+="';\n",t.variable||(i="with(obj||{}){\n"+i+"}\n"),i="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+i+"return __p;\n";try{var u=new Function(t.variable||"obj","_",i)}catch(o){throw o.source=i,o}var l=function(e){return u.call(this,e,x)},s=t.variable||"obj";return l.source="function("+s+"){\n"+i+"}",l},x.chain=function(e){var t=x(e);return t._chain=!0,t};var L=function(e,t){return e._chain?x(t).chain():t};x.mixin=function(e){x.each(x.functions(e),function(t){var n=x[t]=e[t];x.prototype[t]=function(){var e=[this._wrapped];return f.apply(e,arguments),L(this,n.apply(x,e))}})},x.mixin(x),x.each(["pop","push","reverse","shift","sort","splice","unshift"],function(e){var t=l[e];x.prototype[e]=function(){var n=this._wrapped;return t.apply(n,arguments),"shift"!==e&&"splice"!==e||0!==n.length||delete n[0],L(this,n)}}),x.each(["concat","join","slice"],function(e){var t=l[e];x.prototype[e]=function(){return L(this,t.apply(this._wrapped,arguments))}}),x.prototype.value=function(){return this._wrapped},x.prototype.valueOf=x.prototype.toJSON=x.prototype.value,x.prototype.toString=function(){return""+this._wrapped},"function"==typeof define&&define.amd&&define("underscore",[],function(){return x})}).call(this)},{}]},{},[1]);