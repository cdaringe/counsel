(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{144:function(e,t,n){"use strict";var r=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t},a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var i=r(n(0)),o=a(n(149)),l=a(n(156));t.default=function(){return i.createElement(o.default,null,i.createElement(l.default,{title:"404: Not found"}),i.createElement("h1",null,"NOT FOUND"),i.createElement("p",null,"You just hit a route that doesn't exist... the sadness."))}},147:function(e,t,n){"use strict";n.r(t),n.d(t,"graphql",function(){return m}),n.d(t,"StaticQueryContext",function(){return f}),n.d(t,"StaticQuery",function(){return p});var r=n(0),a=n.n(r),i=n(4),o=n.n(i),l=n(146),u=n.n(l);n.d(t,"Link",function(){return u.a}),n.d(t,"withPrefix",function(){return l.withPrefix}),n.d(t,"navigate",function(){return l.navigate}),n.d(t,"push",function(){return l.push}),n.d(t,"replace",function(){return l.replace}),n.d(t,"navigateTo",function(){return l.navigateTo});var c=n(148),s=n.n(c);n.d(t,"PageRenderer",function(){return s.a});var d=n(32);n.d(t,"parsePath",function(){return d.a});var f=a.a.createContext({}),p=function(e){return a.a.createElement(f.Consumer,null,function(t){return e.data||t[e.query]&&t[e.query].data?(e.render||e.children)(e.data?e.data.data:t[e.query].data):a.a.createElement("div",null,"Loading (StaticQuery)")})};function m(){throw new Error("It appears like Gatsby is misconfigured. Gatsby related `graphql` calls are supposed to only be evaluated at compile time, and then compiled away,. Unfortunately, something went wrong and the query was left in the compiled code.\n\n.Unless your site has a complex or custom babel/Gatsby configuration this is likely a bug in Gatsby.")}p.propTypes={data:o.a.object,query:o.a.string.isRequired,render:o.a.func,children:o.a.func}},148:function(e,t,n){var r;e.exports=(r=n(152))&&r.default||r},149:function(e,t,n){"use strict";n(155),n(34);var r=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t},a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),n(150);var i=r(n(0)),o=a(n(154)),l=a(n(151)),u=n(147),c="undefined"!=typeof window?window:{location:{}},s=function(e){var t=e.currentTarget.getAttribute("href").replace(/([^#]+)#/,"");setTimeout(function(){c.location.hash=t},1e3);var n="a[name="+t+"]",r=document.querySelector(n);r?(e.preventDefault(),r.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"})):console.warn("unable to find node: "+n)},d=i.createElement("span",{style:{fontSize:"60%"}},"> ");t.default=function(e){var t=e.children,n=e.headings,r=void 0===n?[]:n,a=e.slug,f=void 0===a?"":a;return i.createElement("div",{id:"root"},i.createElement(o.default,null,i.createElement("link",{href:"https://fonts.googleapis.com/css?family=Ubuntu+Mono",rel:"stylesheet"})),i.createElement("div",{id:"primary"},i.createElement(l.default,null),t),i.createElement("nav",{id:"nav-menu"},i.createElement("div",{id:"nav-sticker"},i.createElement("h3",null,"nav"),i.createElement("ul",null,i.createElement("li",null,i.createElement(u.Link,{to:"/"},"/"===c.location.pathname&&d,"home")),i.createElement("li",null,i.createElement(u.Link,{to:"/docs/"},"/docs/"===c.location.pathname&&d,"docs")),i.createElement("li",null,i.createElement(u.Link,{to:"/api/"},"reference"))),i.createElement("hr",null),i.createElement("ul",null,r.map(function(e){var t=e.value,n=e.depth,r=t.replace(/[^a-zA-Z]/g,"").toLowerCase();return i.createElement("li",null,i.createElement(u.Link,{className:"nav-depth-"+n,onClick:s,to:f+"#"+r},c.location.hash.endsWith(r)&&d,t))})))))}},150:function(e,t,n){},151:function(e,t,n){"use strict";var r=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t};Object.defineProperty(t,"__esModule",{value:!0});var a=r(n(0)),i=n(147),o=n(153);t.default=function(){return a.createElement("div",{id:"header"},a.createElement(i.Link,{to:"/"},a.createElement("img",{id:"header__logo",src:o})),a.createElement("h1",null,"counsel"))}},152:function(e,t,n){"use strict";n.r(t);n(33);var r=n(0),a=n.n(r),i=n(4),o=n.n(i),l=n(52),u=n(2),c=function(e){var t=e.location,n=u.default.getResourcesForPathnameSync(t.pathname);return a.a.createElement(l.a,Object.assign({location:t,pageResources:n},n.json))};c.propTypes={location:o.a.shape({pathname:o.a.string.isRequired}).isRequired},t.default=c},153:function(e,t,n){e.exports=n.p+"static/counsel-16e8e4a3b48d2e8c7686a05188cb5893.png"},156:function(e,t,n){"use strict";var r=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t},a=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var i=r(n(0)),o=a(n(4)),l=a(n(154));function u(e){var t=e.description,n=e.lang,r=e.meta,a=e.keywords,o=e.title;return i.createElement(gatsby_1.StaticQuery,{query:c,render:function(e){var u=t||e.site.siteMetadata.description;return i.createElement(l.default,{htmlAttributes:{lang:n},title:o,titleTemplate:"%s | "+e.site.siteMetadata.title,meta:[{name:"description",content:u},{property:"og:title",content:o},{property:"og:description",content:u},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"},{name:"twitter:creator",content:e.site.siteMetadata.author},{name:"twitter:title",content:o},{name:"twitter:description",content:u}].concat(a.length>0?{name:"keywords",content:a.join(", ")}:[]).concat(r)})}})}u.defaultProps={lang:"en",meta:[],keywords:[]},u.propTypes={description:o.default.string,lang:o.default.string,meta:o.default.array,keywords:o.default.arrayOf(o.default.string),title:o.default.string.isRequired},t.default=u;var c="1025518380"}}]);
//# sourceMappingURL=component---src-pages-404-js-09c51fcb7b4adcfc0c5b.js.map