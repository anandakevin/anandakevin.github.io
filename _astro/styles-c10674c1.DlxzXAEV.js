import{t as e}from"./channel.DhaTrpdf.js";import{A as t,Bt as n,Dt as r,E as i,Ft as a,R as o,c as s,fn as c,hn as l,m as u,mn as d,ot as f,pn as p,v as m,w as h,x as g,z as _}from"./dist.CHtKB6sI.js";import{t as v}from"./graphlib.BRfARgRI.js";import{t as y}from"./index-3862675e.OaK1w4BV.js";function b(e){return typeof e==`string`?new p([document.querySelectorAll(e)],[document.documentElement]):new p([l(e)],d)}function x(e,t){return!!e.children(t).length}function S(e){return w(e.v)+`:`+w(e.w)+`:`+w(e.name)}var C=/:/g;function w(e){return e?String(e).replace(C,`\\:`):``}function T(e,t){t&&e.attr(`style`,t)}function E(e,t,n){t&&e.attr(`class`,t).attr(`class`,n+` `+e.attr(`class`))}function D(e,t){var n=t.graph();if(f(n)){var i=n.transition;if(r(i))return i(e)}return e}function O(e,t){var n=e.append(`foreignObject`).attr(`width`,`100000`),r=n.append(`xhtml:div`);r.attr(`xmlns`,`http://www.w3.org/1999/xhtml`);var i=t.label;switch(typeof i){case`function`:r.insert(i);break;case`object`:r.insert(function(){return i});break;default:r.html(i)}T(r,t.labelStyle),r.style(`display`,`inline-block`),r.style(`white-space`,`nowrap`);var a=r.node().getBoundingClientRect();return n.attr(`width`,a.width).attr(`height`,a.height),n}var k={},A=function(e){let t=Object.keys(e);for(let n of t)k[n]=e[n]},j=async function(e,n,r,a,o,c){let l=a.select(`[id="${r}"]`),d=Object.keys(e);for(let r of d){let a=e[r],d=`default`;a.classes.length>0&&(d=a.classes.join(` `)),d+=` flowchart-label`;let f=g(a.styles),p=a.text===void 0?a.id:a.text,h;if(i.info(`vertex`,a,a.labelType),a.labelType===`markdown`)i.info(`vertex`,a,a.labelType);else if(u(m().flowchart.htmlLabels))h=O(l,{label:p}).node(),h.parentNode.removeChild(h);else{let e=o.createElementNS(`http://www.w3.org/2000/svg`,`text`);e.setAttribute(`style`,f.labelStyle.replace(`color:`,`fill:`));let t=p.split(s.lineBreakRegex);for(let n of t){let t=o.createElementNS(`http://www.w3.org/2000/svg`,`tspan`);t.setAttributeNS(`http://www.w3.org/XML/1998/namespace`,`xml:space`,`preserve`),t.setAttribute(`dy`,`1em`),t.setAttribute(`x`,`1`),t.textContent=n,e.appendChild(t)}h=e}let _=0,v=``;switch(a.type){case`round`:_=5,v=`rect`;break;case`square`:v=`rect`;break;case`diamond`:v=`question`;break;case`hexagon`:v=`hexagon`;break;case`odd`:v=`rect_left_inv_arrow`;break;case`lean_right`:v=`lean_right`;break;case`lean_left`:v=`lean_left`;break;case`trapezoid`:v=`trapezoid`;break;case`inv_trapezoid`:v=`inv_trapezoid`;break;case`odd_right`:v=`rect_left_inv_arrow`;break;case`circle`:v=`circle`;break;case`ellipse`:v=`ellipse`;break;case`stadium`:v=`stadium`;break;case`subroutine`:v=`subroutine`;break;case`cylinder`:v=`cylinder`;break;case`group`:v=`rect`;break;case`doublecircle`:v=`doublecircle`;break;default:v=`rect`}let y=await t(p,m());n.setNode(a.id,{labelStyle:f.labelStyle,shape:v,labelText:y,labelType:a.labelType,rx:_,ry:_,class:d,style:f.style,id:a.id,link:a.link,linkTarget:a.linkTarget,tooltip:c.db.getTooltip(a.id)||``,domId:c.db.lookUpDomId(a.id),haveCallback:a.haveCallback,width:a.type===`group`?500:void 0,dir:a.dir,type:a.type,props:a.props,padding:m().flowchart.padding}),i.info(`setNode`,{labelStyle:f.labelStyle,labelType:a.labelType,shape:v,labelText:y,rx:_,ry:_,class:d,style:f.style,id:a.id,domId:c.db.lookUpDomId(a.id),width:a.type===`group`?500:void 0,type:a.type,dir:a.dir,props:a.props,padding:m().flowchart.padding})}},M=async function(e,r,a){i.info(`abc78 edges = `,e);let o=0,c={},l,u;if(e.defaultStyle!==void 0){let t=g(e.defaultStyle);l=t.style,u=t.labelStyle}for(let a of e){o++;let d=`L-`+a.start+`-`+a.end;c[d]===void 0?(c[d]=0,i.info(`abc78 new entry`,d,c[d])):(c[d]++,i.info(`abc78 new entry`,d,c[d]));let f=d+`-`+c[d];i.info(`abc78 new link id to be used is`,d,f,c[d]);let p=`LS-`+a.start,_=`LE-`+a.end,v={style:``,labelStyle:``};switch(v.minlen=a.length||1,v.arrowhead=a.type===`arrow_open`?`none`:`normal`,v.arrowTypeStart=`arrow_open`,v.arrowTypeEnd=`arrow_open`,a.type){case`double_arrow_cross`:v.arrowTypeStart=`arrow_cross`;case`arrow_cross`:v.arrowTypeEnd=`arrow_cross`;break;case`double_arrow_point`:v.arrowTypeStart=`arrow_point`;case`arrow_point`:v.arrowTypeEnd=`arrow_point`;break;case`double_arrow_circle`:v.arrowTypeStart=`arrow_circle`;case`arrow_circle`:v.arrowTypeEnd=`arrow_circle`}let y=``,b=``;switch(a.stroke){case`normal`:y=`fill:none;`,l!==void 0&&(y=l),u!==void 0&&(b=u),v.thickness=`normal`,v.pattern=`solid`;break;case`dotted`:v.thickness=`normal`,v.pattern=`dotted`,v.style=`fill:none;stroke-width:2px;stroke-dasharray:3;`;break;case`thick`:v.thickness=`thick`,v.pattern=`solid`,v.style=`stroke-width: 3.5px;fill:none;`;break;case`invisible`:v.thickness=`invisible`,v.pattern=`solid`,v.style=`stroke-width: 0;fill:none;`}if(a.style!==void 0){let e=g(a.style);y=e.style,b=e.labelStyle}v.style=v.style+=y,v.labelStyle=v.labelStyle+=b,v.curve=a.interpolate===void 0?e.defaultInterpolate===void 0?h(k.curve,n):h(e.defaultInterpolate,n):h(a.interpolate,n),a.text===void 0?a.style!==void 0&&(v.arrowheadStyle=`fill: #333`):(v.arrowheadStyle=`fill: #333`,v.labelpos=`c`),v.labelType=a.labelType,v.label=await t(a.text.replace(s.lineBreakRegex,`
`),m()),a.style===void 0&&(v.style=v.style||`stroke: #333; stroke-width: 1.5px;fill:none;`),v.labelStyle=v.labelStyle.replace(`color:`,`fill:`),v.id=f,v.classes=`flowchart-link `+p+` `+_,r.setEdge(a.start,a.end,v,o)}},N={setConf:A,addVertices:j,addEdges:M,getClasses:function(e,t){return t.db.getClasses()},draw:async function(e,t,n,r){i.info(`Drawing flowchart`);let a=r.db.getDirection();a===void 0&&(a=`TD`);let{securityLevel:s,flowchart:l}=m(),u=l.nodeSpacing||50,d=l.rankSpacing||50,f;s===`sandbox`&&(f=c(`#i`+t));let p=c(s===`sandbox`?f.nodes()[0].contentDocument.body:`body`),h=s===`sandbox`?f.nodes()[0].contentDocument:document,g=new v({multigraph:!0,compound:!0}).setGraph({rankdir:a,nodesep:u,ranksep:d,marginx:0,marginy:0}).setDefaultEdgeLabel(function(){return{}}),x,S=r.db.getSubGraphs();i.info(`Subgraphs - `,S);for(let e=S.length-1;e>=0;e--)x=S[e],i.info(`Subgraph - `,x),r.db.addVertex(x.id,{text:x.title,type:x.labelType},`group`,void 0,x.classes,x.dir);let C=r.db.getVertices(),w=r.db.getEdges();i.info(`Edges`,w);let T=0;for(T=S.length-1;T>=0;T--){x=S[T],b(`cluster`).append(`text`);for(let e=0;e<x.nodes.length;e++)i.info(`Setting up subgraphs`,x.nodes[e],x.id),g.setParent(x.nodes[e],x.id)}await j(C,g,t,p,h,r),await M(w,g);let E=p.select(`[id="${t}"]`),D=p.select(`#`+t+` g`);if(await y(D,g,[`point`,`circle`,`cross`],`flowchart`,t),_.insertTitle(E,`flowchartTitleText`,l.titleTopMargin,r.db.getDiagramTitle()),o(g,E,l.diagramPadding,l.useMaxWidth),r.db.indexNodes(`subGraph`+T),!l.htmlLabels){let e=h.querySelectorAll(`[id="`+t+`"] .edgeLabel .label`);for(let t of e){let e=t.getBBox(),n=h.createElementNS(`http://www.w3.org/2000/svg`,`rect`);n.setAttribute(`rx`,0),n.setAttribute(`ry`,0),n.setAttribute(`width`,e.width),n.setAttribute(`height`,e.height),t.insertBefore(n,t.firstChild)}}Object.keys(C).forEach(function(e){let n=C[e];if(n.link){let r=c(`#`+t+` [id="`+e+`"]`);if(r){let e=h.createElementNS(`http://www.w3.org/2000/svg`,`a`);e.setAttributeNS(`http://www.w3.org/2000/svg`,`class`,n.classes.join(` `)),e.setAttributeNS(`http://www.w3.org/2000/svg`,`href`,n.link),e.setAttributeNS(`http://www.w3.org/2000/svg`,`rel`,`noopener`),s===`sandbox`?e.setAttributeNS(`http://www.w3.org/2000/svg`,`target`,`_top`):n.linkTarget&&e.setAttributeNS(`http://www.w3.org/2000/svg`,`target`,n.linkTarget);let t=r.insert(function(){return e},`:first-child`),i=r.select(`.label-container`);i&&t.append(function(){return i.node()});let a=r.select(`.label`);a&&t.append(function(){return a.node()})}}})}},P=(t,n)=>{let r=e,i=r(t,`r`),o=r(t,`g`),s=r(t,`b`);return a(i,o,s,n)},F=e=>`.label {
    font-family: ${e.fontFamily};
    color: ${e.nodeTextColor||e.textColor};
  }
  .cluster-label text {
    fill: ${e.titleColor};
  }
  .cluster-label span,p {
    color: ${e.titleColor};
  }

  .label text,span,p {
    fill: ${e.nodeTextColor||e.textColor};
    color: ${e.nodeTextColor||e.textColor};
  }

  .node rect,
  .node circle,
  .node ellipse,
  .node polygon,
  .node path {
    fill: ${e.mainBkg};
    stroke: ${e.nodeBorder};
    stroke-width: 1px;
  }
  .flowchart-label text {
    text-anchor: middle;
  }
  // .flowchart-label .text-outer-tspan {
  //   text-anchor: middle;
  // }
  // .flowchart-label .text-inner-tspan {
  //   text-anchor: start;
  // }

  .node .katex path {
    fill: #000;
    stroke: #000;
    stroke-width: 1px;
  }

  .node .label {
    text-align: center;
  }
  .node.clickable {
    cursor: pointer;
  }

  .arrowheadPath {
    fill: ${e.arrowheadColor};
  }

  .edgePath .path {
    stroke: ${e.lineColor};
    stroke-width: 2.0px;
  }

  .flowchart-link {
    stroke: ${e.lineColor};
    fill: none;
  }

  .edgeLabel {
    background-color: ${e.edgeLabelBackground};
    rect {
      opacity: 0.5;
      background-color: ${e.edgeLabelBackground};
      fill: ${e.edgeLabelBackground};
    }
    text-align: center;
  }

  /* For html labels only */
  .labelBkg {
    background-color: ${P(e.edgeLabelBackground,.5)};
    // background-color: 
  }

  .cluster rect {
    fill: ${e.clusterBkg};
    stroke: ${e.clusterBorder};
    stroke-width: 1px;
  }

  .cluster text {
    fill: ${e.titleColor};
  }

  .cluster span,p {
    color: ${e.titleColor};
  }
  /* .cluster div {
    color: ${e.titleColor};
  } */

  div.mermaidTooltip {
    position: absolute;
    text-align: center;
    max-width: 200px;
    padding: 2px;
    font-family: ${e.fontFamily};
    font-size: 12px;
    background: ${e.tertiaryColor};
    border: 1px solid ${e.border2};
    border-radius: 2px;
    pointer-events: none;
    z-index: 100;
  }

  .flowchartTitleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${e.textColor};
  }
`;export{T as a,x as c,E as i,b as l,F as n,D as o,O as r,S as s,N as t};