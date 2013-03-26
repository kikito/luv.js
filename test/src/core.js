describe("Luv", function(){
  it("exists", function(){
    expect(Luv).to.be.a('function');
  });
  describe("constructor", function() {
    describe("when invoked with no params", function() {
      it("creates a Luv instance with default attributes", function() {
        var luv = Luv();
        expect(luv.graphics.el).to.be.ok;
        expect(luv.graphics.getWidth()).to.equal(800);
        expect(luv.graphics.getHeight()).to.equal(600);

        expect(luv.load).to.be.a('function');
        expect(luv.draw).to.be.a('function');
        expect(luv.update).to.be.a('function');
        expect(luv.run).to.be.a('function');

        expect(luv.timer).to.be.ok;
        expect(luv.keyboard).to.be.ok;
        expect(luv.mouse).to.be.ok;
        expect(luv.media).to.be.ok;
      });
    });

    describe("when invoked with params", function() {
      it("sets the el", function() {
        var el = document.createElement('canvas');
        var luv = Luv({el: el});
        expect(luv.el).to.equal(el);
      });

      it("sets the el via an id", function() {
        var el = document.createElement('canvas');
        sinon.stub(document, 'getElementById').withArgs('foo').returns(el);

        var luv = Luv({id: "foo"});
        expect(luv.el).to.equal(el);

        document.getElementById.restore();
      });

      it("reads the width and height from el", function() {
        var el = document.createElement('canvas');
        el.setAttribute('width', 320);
        el.setAttribute('height', 200);

        var luv = Luv({el: el});
        expect(luv.graphics.getDimensions()).to.deep.equal({width: 320, height: 200});
      });

      it("reads the width and height from options", function() {
        var el = document.createElement('canvas');
        el.setAttribute('width', 320);
        el.setAttribute('height', 200);

        var luv = Luv({el: el, width: 500, height: 300});
        expect(luv.graphics.getDimensions()).to.deep.equal({width: 500, height: 300});
      });

      it("reads the load, update, draw and run functions from options", function() {
        var load   = function(){},
            update = function(){},
            draw   = function(){},
            run    = function(){};

        var luv = Luv({load: load, update: update, draw: draw, run: run});

        expect(luv.load).to.equal(load);
        expect(luv.update).to.equal(update);
        expect(luv.draw).to.equal(draw);
        expect(luv.run).to.equal(run);

      });

    });

  });

  describe("Luv.Class", function() {
    it("is a function", function() {
      expect(Luv.Class).to.be.a('function');
    });

    describe("the class it creates", function() {
      it("has a name", function() {
        var c = Luv.Class('MyClass');
        expect(c+"").to.equal('MyClass');
        expect(c.getName()).to.equal('MyClass');
      });

      it("is capable of instantiating objects", function() {
        var MyClass = Luv.Class('MyClass');
        var obj = MyClass();

        expect(obj.getClass()).to.deep.equal(MyClass);
        expect(obj+"").to.equal('instance of MyClass');
      });

      it("accepts an optional methods object", function() {
        var MyClass = Luv.Class('MyClass', {foo: 'bar'});
        var obj = MyClass();
        expect(obj.foo).to.equal('bar');
      });

      it("uses the init method on the instances, if it exists", function() {
        var MyClass = Luv.Class('MyClass', {
          init: function(name) {
            this.name = name;
          }
        });
        var obj = MyClass('peter');
        expect(obj.name).to.equal('peter');
      });

      it("has an 'include' class method", function() {
        var Dodo = Luv.Class('Dodo');
        var flyMixing = { fly: function(){ this.flying = true; } };
        Dodo.include(flyMixing);

        var ronald = Dodo();
        ronald.fly();

        expect(ronald.flying).to.be.True;
      });

      it("is capable of creating subclasses", function() {
        var Bird = Luv.Class('Bird', {fly: 'high', eat: 'worms'});
        var Eagle = Bird.subclass('Eagle', {hotel: 'california', eat: 'rabbits'});

        var john = Eagle();
        expect(Eagle.getSuper()).to.deep.equal(Bird);
        expect(john.hotel).to.equal('california');
        expect(john.fly).to.equal('high');
        expect(john.eat).to.equal('rabbits');
      });
    });
  });

  describe("luv.run", function() {
    it("invokes the expected functions", function() {

      this.clock = sinon.useFakeTimers(0, "setTimeout", "clearTimeout", "Date");

      var luv = Luv();

      var load      = sinon.spy(luv,'load'),
          update    = sinon.spy(luv, 'update'),
          step      = sinon.spy(luv.timer, 'step'),
          clear     = sinon.spy(luv.graphics, 'clear'),
          draw      = sinon.spy(luv, 'draw');

      var counter = 0;
      var nextFrame = sinon.stub(luv.timer, 'nextFrame', function(f) {
        if(counter !== 0) { return; }
        counter = counter + 1;
        f(0);
      });

      luv.run();

      expect(step).to.have.been.called;
      expect(load).to.have.been.called;
      expect(update).to.have.been.called;
      expect(clear).to.have.been.called;
      expect(draw).to.have.been.called;
      expect(nextFrame).to.have.been.called;

      this.clock.restore();
    });
  });

  describe("luv.onBlur", function() {
    it("gets invoked when the main canvas loses focus", function() {
      var count = 0;
      var luv = Luv({onBlur: function(){ count ++; }});

      trigger(luv.el, 'blur');

      expect(count).to.equal(1);
    });
  });

  describe("luv.onFocus", function() {
    it("gets invoked when the main canvas gains focus", function() {
      var count = 0;
      var luv = Luv({onFocus: function(){ count ++; }});

      trigger(luv.el, 'focus');

      expect(count).to.equal(1);
    });
  });


});
