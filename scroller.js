/**
 * Created by Graf on 24.10.13.
 * v 1.0
 * there should some bugs with elements selection locking in this version
 */
(function(jQuery){
    'use strict';
    var
        Master=[],
        jdoc,jbody,jwindow;

    function checkMaster(el){
        var
            i=0,
            ml=Master.length;
        for(i;i<ml;i++)
            if(Master[i].el==el)
                return Master[i];
        return false;
    };
	function construct(el,axis){
		if(!el)
            return;
		this.el=el;
		this.jel=$(el);
		this.axis=axis||'y';
		this.pos=this.jel.css('position')!='static'?this.jel.css('position'):'relative';
	};
    construct.prototype.init=function(){
		this.tempHtml=this.el.innerHTML;
		this.catched=false;//flag means that runner is pressed
		this.clicked=false;//flag means that runner was pressed
		this.out=true;//flag means that cursor el is hovered
		this.scrollable=true;//flag means that element is scrollable
		this.child=$('<div/>');
		this.scontent=$('<div/>');//scrolled content
		this.scontrol=$('<div/>');
		this.scrollRail=$('<div/>');
		this.runner=$('<div/>');//runner  on rail
		this.scwidth=0;//scrolled content width
		this.scheight=0;//scrolled content height
		this.childwidth=0;//
		this.childheight=0;//
		this.railwidth=0;//width of rail
		this.railheight=0;//height of rail
		this.runnerwidth=0;//width of runner
		this.runnerheight=0;//height of runner
		this.runnerSize=0;//current size of runner
		this.runnerMin=20;//minimal size of runner
		this.fadeIn=100;//speed of fadingIn rail
		this.fadeOut=500;//speed of fadingIn rail
		this.coef=0;//relation between height of content and height of rail
		this.delta=0;//
		this.wheelRel=5;//sensitivity of mouse wheel
		this.last=0;//last value of delta
		this.startX=0;//
		this.startY=0;//
        this.visualise();
        this.bindEvents();
    }
    construct.prototype.bindEvents=function(){
		var
			self=this;
        this.jel.on('mouseenter.scrollable',showRail).on('mouseleave.scrollable',hideRail)
        this.runner.on('mousedown.scrollable',mousedown);
        this.scrollRail.on('click.scrollable',click);
        jdoc.on('mousemove.scrollable',mousemove);
        this.jel.on('scroll.scrollable, mousewheel.scrollable',mousewheel);
        jwindow.on('mouseup.scrollable',mouseup);
		document.ondragstart = function() {if(self.catched)return false;};
        document.body.onselectstart = function() {if(self.catched)return false;};
        function hideRail(){
            self.out=true;
            if(!self.catched)
                self.scrollRail.stop().animate({opacity:0},self.fadeOut);
        };
        function showRail(){
            self.out=false;
            self.scrollRail.stop().animate({opacity:1},self.fadeIn);
        };
        function mousedown(e){//start dragging runner
            self.catched=true;
            self.clicked=true;
            self.startX=e.pageX;
            self.startY=e.pageY;
        };
        function click(e){//scrolling by click on rail
            if(!self.clicked)
                self.last=self.axis=='y'?self.move(e.offsetY-self.runnerheight/2):self.move(e.offsetX-self.runnerwidth/2);
            self.clicked=false;
        };
        function mousemove(e){//scrolling by dragging runner
            if(self.catched)
                self.axis=='y'?self.move(e.pageY-self.startY+self.last):self.move(e.pageX-self.startX+self.last);
        };
        function mousewheel(e){//scrolling by tracking mouse wheel
            self.last=self.move(e.originalEvent.wheelDelta<0?self.delta+self.wheelRel:self.delta-self.wheelRel);
        };
        function mouseup(){//end dragging runner
            self.catched=false;
            self.last=self.delta;
            if(self.out)
                self.scrollRail.stop().animate({opacity:0},self.fadeOut);
        };
    };
    construct.prototype.unscroll=function(){//removing all scrollable functionality
		if(this.jel.find('.j_scontent').length)
			this.jel.html(this.scontent.html());
        this.scrollable=false;
        this.jel.off('mouseenter.scrollable').off('mouseleave.scrollable').off('mousewheel.scrollable');
        this.runner.off('mousedown.scrollable');
        this.scrollRail.off('click.scrollable');
        jdoc.off('mousemove.scrollable');
        jwindow.off('mouseup.scrollable');
    };
    construct.prototype.move=function(val){//validates delta and moves runner and content
        if(this.axis=='y'){
            this.delta=val<0?0:val=val>this.railheight-this.runnerheight?this.railheight-this.runnerheight:val;//validation for edges
            this.runner.css('top',this.delta);
            this.scontent.css('top',-this.delta/this.coef);
        }
        else{
            this.delta=val<0?0:val=val>this.railwidth-this.runnerwidth?this.railwidth-this.runnerwidth:val;//validation for edges
            this.runner.css('left',this.delta);
            this.scontent.css('left',-this.delta/this.coef);
        }
        return this.delta;
    };
    construct.prototype.visualise=function(){//prepares element to become scrollable
        this.jel
            .empty()
            .css('position',this.pos);
        this.child
            .addClass('scr_Child')
            .appendTo(this.jel);
        this.scontent
            .html(this.tempHtml)
            .addClass('j_scontent scr_Content')
            .appendTo(this.child);
        this.scontrol
            .addClass('scr_Control '+(this.axis=='y'?'scr_Control_vert':'scr_Control_hor'))
            .appendTo(this.child);
        this.scrollRail
            .addClass('scr_Rail')
            .appendTo(this.scontrol);
        this.runner
            .addClass('scr_Runner '+(this.axis=='y'?'scr_Runner_vert':'scr_Runner_hor'))
            .appendTo(this.scrollRail);
        this.checkSizes();
    };
    construct.prototype.checkSizes=function(){//recalculates sizes
        this.scwidth=this.scontent[0].clientWidth;
        this.scheight=this.scontent[0].clientHeight;
        this.railwidth=this.scrollRail[0].clientWidth;
        this.railheight=this.scrollRail[0].clientHeight;
        this.runnerSize=this.axis=='y'?this.railheight*(this.railheight/this.scheight)>this.runnerMin?this.railheight*(this.railheight/this.scheight):this.runnerMin:this.railwidth*(this.railwidth/this.scwidth)>this.runnerMin?this.railwidth*(this.railwidth/this.scwidth):this.runnerMin;
		this.runner.css(this.axis=='y'?{'height':this.runnerSize+'px'}:{'width':this.runnerSize+'px'});
        this.runnerwidth=this.runner[0].clientWidth;
        this.runnerheight=this.runner[0].clientHeight;
        this.coef=this.axis=='y'?(this.railheight-this.runnerheight)/(this.scheight-this.railheight):(this.railwidth-this.runnerwidth)/(this.scwidth-this.railwidth);
        this.childwidth=this.child[0].clientWidth;
        this.childheight=this.child[0].clientHeight;

        if(this.axis=='y'){
			if(this.jel.find('.j_scontent').length){//inner html of element was not changed
				if(this.scheight<=this.childheight && this.scrollable){//if we don't have a reason to scroll via Y
					if(checkMaster(this.el))//element was inited
						this.unscroll();
				}
				else {//we  have a reason to scroll via Y 
					if(checkMaster(this.el)){//element was inited
						if(!this.scrollable)
							this.init();
					}
				}
			}
			else
				this.init();
        }
        else{
			if(this.jel.find('.j_scontent').length){//inner html of element was not changed
				if(this.scwidth<=this.childwidth && this.scrollable){//if we don't have a reason to scroll via X
					if(checkMaster(this.el))
						this.unscroll();
				}
				else{//we have a reason to scroll via X
					if(checkMaster(this.el)){
						if(!this.scrollable)
							this.init();
					}
				}
			}
			else
				this.init();
        }
    };
	$(function(){
		jwindow=$(window);
		jdoc=$(document);
		jbody=$(document.body);
	});
    jQuery.fn.extend({
        scrollUpdate: function() {
            return this.each(function() {
				var 
					obj=checkMaster(this);
                if(obj)
                    obj.checkSizes();

            });
        },
        scrollable: function(axis) {
            return this.each(function() {
			if(!checkMaster(this))
				(Master[Master.push(new construct(this,axis))-1]).init();
            });
        }
    });
}(jQuery))