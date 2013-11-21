/**
 * Created by Graf on 24.10.13.
 * pre-alfa version
 */
(function(jQuery){
    'use strict';
    var
        Master=[],
        jdoc=$(document),
		jbody,
        jwindow=$(window);

    function checkMaster(el){
        var
            i=0,
            ml=Master.length;
        for(i;i<ml;i++)
            if(Master[i].el==el)
                return Master[i];
        return false;
    };
    function init(el,axis){
		jbody=$(document.body);
        if(!el)
            return;
        if(!checkMaster(el))
            var index=Master.push({
                el:el,
                jel:$(el),
                catched:false,//flag means that runner is pressed
                clicked:false,//flag means that runner was pressed
                out:true,//flag means that cursor el is hovered
                scrollable:true,//flag means that element is scrollable
                axis:axis?axis:'y',
                tempHtml:el.innerHTML,
                child:$('<div/>'),
                scontent:$('<div/>'),//scrolled content
                gscrollcont:$('<div/>'),
                scrollRail:$('<div/>'),
                runner:$('<div/>'),//runner  on rail
                scwidth:null,//scrolled content width
                scheight:null,//scrolled content height
                railwidth:null,//width of rail
                railheight:null,//height of rail
                runnerwidth:null,//width of runner
                runnerheight:null,//height of runner
                runnerSize:null,//current size of runner
                runnerMin:20,//minimal size of runner
                fadeIn:100,//speed of fadingIn rail
                fadeOut:500,//speed of fadingIn rail
                coef:null,//relation between height of content and height of rail
                childwidth:null,//
                childheight:null,//
                delta:0,//
                wheelRel:5,//sensitivity of mouse wheel
                last:0,//last value of delta
                startX:0,//
                startY:0//
            });


        visualise(el);
        bindEvents(el);
    }
    function bindEvents(el){
        var data=checkMaster(el);
        data.jel.on('mouseenter.scrollable',showRail).on('mouseleave.scrollable',hideRail)
        data.runner.on('mousedown.scrollable',mousedown);
        data.scrollRail.on('click.scrollable',click);
        jdoc.on('mousemove.scrollable',mousemove);
        data.jel.on('scroll.scrollable, mousewheel.scrollable',mousewheel);
        jwindow.on('mouseup.scrollable',mouseup);
 
        function hideRail(){
            data.out=true;
            if(!data.catched)
                data.scrollRail.stop().animate({opacity:0},data.fadeOut);
        };
        function showRail(){
            data.out=false;
            data.scrollRail.stop().animate({opacity:1},data.fadeIn);
        };
        function mousedown(e){//start dragging runner
            data.catched=true;
            data.clicked=true;
            data.hui=true;
            data.startX=e.pageX;
            data.startY=e.pageY;
		jbody.css({
			'-mozUserSelect': 'none',
			'-webkitUserSelect': 'none',
			'-khtmlUserSelect': 'none',
			'-msUserSelect': 'none',
			'-oUserSelect': 'none',
			'userSelect': 'none'
		});
        };
        function click(e){//scrolling by click on rail
            if(!data.clicked)
                data.last=data.axis=='y'?move(el,e.offsetY-data.runnerheight/2):move(el,e.offsetX-data.runnerwidth/2);
            data.clicked=false;
        };
        function mousemove(e){//scrolling by dragging runner
            if(data.catched)
                data.axis=='y'?move(el,e.pageY-data.startY+data.last):move(el,e.pageX-data.startX+data.last);
        };
        function mousewheel(e){//scrolling by tracking mouse wheel
            data.last=move(el,e.originalEvent.wheelDelta<0?data.delta+data.wheelRel:data.delta-data.wheelRel);
        };
        function mouseup(){//end dragging runner
            data.catched=false;
            data.last=data.delta;
            if(data.out)
                data.scrollRail.stop().animate({opacity:0},data.fadeOut);
			jbody.css({
			'-mozUserSelect': 'all',
			'-webkitUserSelect': 'all',
			'-khtmlUserSelect': 'all',
			'-msUserSelect': 'all',
			'-oUserSelect': 'all',
			'userSelect': 'all'
		});
        };
    };
    function unscroll(el){//removing all scrollable functionality
        var
            data=checkMaster(el),
            tempHTML=$('.j_scontent',el).html();
        data.scrollable=false;
        el.innerHTML=tempHTML;
        data.jel.off('mouseenter.scrollable').off('mouseleave.scrollable').off('mousewheel.scrollable');
        data.runner.off('mousedown.scrollable');
        data.scrollRail.off('click.scrollable');
        jdoc.off('mousemove.scrollable');
        jwindow.off('mouseup.scrollable');
    };
    function move(el,val){//validates delta and moves runner and content
        var data=checkMaster(el);
        if(data.axis=='y'){
            data.delta=val<0?0:val=val>data.railheight-data.runnerheight?data.railheight-data.runnerheight:val;//validation for edges
            data.runner.css('top',data.delta);
            data.scontent.css('top',-data.delta/data.coef);
        }
        else{
            data.delta=val<0?0:val=val>data.railwidth-data.runnerwidth?data.railwidth-data.runnerwidth:val;//validation for edges
            data.runner.css('left',data.delta);
            data.scontent.css('left',-data.delta/data.coef);
        }
        return data.delta;
    };
    function visualise(el){//prepares element to become scrollable
        var
            data=checkMaster(el),
            tempHTML=el.innerHTML,
            pos=$(el).css('position')!='static'?$(el).css('position'):'relative';
        data.jel
            .empty()
            .css({
                'position': pos
            });
        data.child
            .css({
                'position':'absolute',
                'width':'100%',
                'height':'100%',
                'overflow':'hidden'
            })
            .appendTo(data.jel);
        data.scontent
            .html(tempHTML)
            .addClass('j_scontent')
            .css({
                'position':'absolute',
                'top':'0px',
                'left':'0px'
            })
            .appendTo(data.child);
        data.gscrollcont
            .css({
                'padding': '0px',
                'position': 'absolute'
            })
            .css(data.axis=='y'?{
                'width': '8px',
                'height': '100%',
                'right': '4px',
                'top': '0px'
            }:{
                'width': '100%',
                'height': '8px',
                'left': '0px',
                'bottom': '4px'
            })
            .appendTo(data.child);
        data.scrollRail
            .css({
                'opacity':'0',
                'background':'none',
                'borderRadius': '5px',
                'cursor': 'pointer',
                'height': '100%',
                'position': 'relative',
                'width': '100%',
                'zIndex': '999'
            })
            .appendTo(data.gscrollcont);
        data.runner
            .css({
                'background':'#D6D6D6',
                'borderRadius': '5px',
                'position': 'absolute'
            })
            .css(data.axis=='y'?{
                'width': '100%',
                'top': '0px'
            }:{
                'height': '100%',
                'left': '0px'
            })
            .appendTo(data.scrollRail);
        checkSizes(el);
    };
    function checkSizes(el){
        var data=checkMaster(el);
        data.scwidth=data.scontent[0].clientWidth;
        data.scheight=data.scontent[0].clientHeight;
        data.railwidth=data.scrollRail[0].clientWidth;
        data.railheight=data.scrollRail[0].clientHeight;
        data.runnerSize=data.axis=='y'?data.railheight*(data.railheight/data.scheight)>data.runnerMin?data.railheight*(data.railheight/data.scheight):data.runnerMin:data.railwidth*(data.railwidth/data.scwidth)>data.runnerMin?data.railwidth*(data.railwidth/data.scwidth):data.runnerMin;
        data.runner
            .css(data.axis=='y'?{
                'height': data.runnerSize+'px'
            }:{
                'width': data.runnerSize+'px'
            })

        data.runnerwidth=data.runner[0].clientWidth;
        data.runnerheight=data.runner[0].clientHeight;
        data.coef=data.axis=='y'?(data.railheight-data.runnerheight)/(data.scheight-data.railheight):(data.railwidth-data.runnerwidth)/(data.scwidth-data.railwidth);
        data.childwidth=data.child[0].clientWidth;
        data.childheight=data.child[0].clientHeight;

        if(data.axis=='y'){
            if(data.scheight<=data.childheight && data.scrollable)//if we don't have a reason to scroll via Y
                if($('.j_scontent',el)[0]){
                    unscroll(el);
                }
                else{
                    data.scrollable=true;
                    init(el);
                }
            else {//if element was inited, but unscrolled
                if(data.scrollable){
                    bindEvents(el);
                }
                else{
                    data.scrollable=true;
                    init(el);
                }
            }
        }

        else{
            if(data.scwidth<=data.childwidth && data.scrollable)//if we don't have a reason to scroll via X
                if($('.j_scontent',el)[0]){
                    unscroll(el);
                }
                else{
                    data.scrollable=true;
                    init(el);
                }
            else{//if element was inited, but unscrolled
                if(data.scrollable){
                    bindEvents(el);

                }
                else{
                    data.scrollable=true;
                    init(el);
                }

            }
        }
    };
    jQuery.fn.extend({
        scrollUpdate: function() {
            return this.each(function() {
                if(checkMaster(this))
                    checkSizes(this);

            });
        },
        scrollable: function(axis) {
            return this.each(function() {
                init(this,axis);
            });
        }
    });
}(jQuery))