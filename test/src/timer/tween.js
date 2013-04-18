describe("Luv.Timer.Tween", function(){
  var Tween = Luv.Timer.Tween;

  it('exists', function() {
    expect(Tween).to.be.a('function');
  });

  describe(".init", function() {
    it("initializes the tween", function() {
      var tween = Tween(1, 0, 10);
      expect(tween.runningTime).to.equal(0);
      expect(tween.timeToFinish).to.equal(1);
      expect(tween.from).to.equal(0);
      expect(tween.to).to.equal(10);
      expect(tween.easing).to.equal(Luv.Timer.Tween.easing.linear);
      expect(tween.step).to.be.ok;
      expect(tween.onFinished).to.be.ok;
    });

    it("creates references from in subject, but creates a copy of to and another of from", function() {
      var from  = {color: {r:1,g:1,b:1}, alpha: 0},
          to    = {color: {r:255,g:255,b:255}, alpha: 1},
          tween = Tween(1, from, to);
      expect(tween.subject).to.equal(from);
      expect(tween.from).to.not.equal(from);
      expect(tween.from).to.deep.equal(from);
      expect(tween.to).to.not.equal(to);
      expect(tween.to).to.deep.equal(to);
    });

    it("checks from making sure that it contains everything needed in to", function() {
      expect(function(){ Tween(1, {}, {x:1}); }).to.Throw(Error);
      expect(function(){ Tween(1, {y:1}, {x:1}); }).to.Throw(Error);
      expect(function(){ Tween(1, {y:1}, {y:[1,2,3]}); }).to.Throw(Error);
      expect(function(){ Tween(1, {a:{b:{c:3}}}, {a:1}); }).to.Throw(Error);
    });

    it("accepts the easing option as a string", function() {
      var tween = Tween(5, 1, 10, {easing: 'linear'});
      expect(tween.easing).to.equal(Tween.easing.linear);
    });

    it("accepts the easing option as a function", function() {
      var tween = Tween(5, 1, 10, {easing: Tween.easing.linear});
      expect(tween.easing).to.equal(Tween.easing.linear);
    });
  });

  describe(".update", function() {
    it("works on plain numbers", function() {
      var tween = Tween(3, 0,3);

      tween.update(1);
      expect(tween.subject).to.equal(1);

      tween.update(1);
      expect(tween.subject).to.equal(2);

      tween.update(1);
      expect(tween.subject).to.equal(3);

      tween.update(1);
      expect(tween.subject).to.equal(3);
    });

    it("works with complex structures", function() {
      var from  = {a: [1, [2, 3]]},
          to    = {a: [4, [8, 12]]},
          tween = Tween(3, from, to);

      tween.update(1);
      expect(from).to.deep.equal({a: [2, [4, 6]]});

      tween.update(1);
      expect(from).to.deep.equal({a: [3, [6, 9]]});

      tween.update(1);
      expect(from).to.deep.equal({a: [4, [8, 12]]});

      tween.update(1);
      expect(from).to.deep.equal({a: [4, [8, 12]]});
    });

    it("uses the step option, if provided", function() {
      var sum = 0,
          tween = Tween(3, 0,3, { step: function(v){sum +=v; } });

      tween.update(1);
      expect(sum).to.equal(1);

      tween.update(1);
      expect(sum).to.equal(3);

      tween.update(1);
      expect(sum).to.equal(6);

      tween.update(1);
      expect(sum).to.equal(6);
    });

    it("invokes the onFinished callback, if provided", function() {
      var count = 0,
          tween = Tween(3, 0,3, { onFinished: function(){count++;} });

      tween.update(3);
      expect(count).to.equal(1);
      expect(tween.isFinished()).to.be.truthy;

      tween.update(1);
      expect(count).to.equal(1);
    });
  });


});
