var scene = document.querySelector('a-scene');
scene.addEventListener('loaded', init);

function init(){
    scene.components['physics-world'].world.defaultContactMaterial.friction = -1;
    scene.components['physics-world'].world.defaultContactMaterial.restitution = -1;
    scene.components['physics-world'].world.defaultContactMaterial.contactEquationRelaxation = 1;
    scene.components['physics-world'].world.defaultContactMaterial.frictionEquationRelaxation = 1;
    scene.components['physics-world'].world.defaultContactMaterial.contactEquationStiffness = 1e7;
    scene.components['physics-world'].world.defaultContactMaterial.frictionEquationStiffness = 1e7;

    add_ball('default');

    AFRAME.registerComponent('grab', {
	  init: function () {
          this.d = distance(camera.components.position.data, this.el.components.position.data);
	  },
	  tick: function () {
          var phi = camera.components.rotation.data.x * Math.PI/180;
          var theta = -camera.components.rotation.data.y * Math.PI/180;
          var x = camera.components.position.data.x;
          var y = camera.components.position.data.y;
          var z = camera.components.position.data.z;
          this.el.setAttribute('position', {
              x: this.d * Math.cos(phi) * Math.sin(theta) + x,
              y: this.d * Math.sin(phi) + y,
              z: -this.d * Math.cos(phi)*Math.cos(theta) + z,
          });
          this.el.components['physics-body'].body.position = this.el.getAttribute('position');
	  }
	});

    init_audio();
}

function init_audio(){
}

function play(){
    for(var key in balls){
        var ball = balls[key];
        ball.components.sound.sound.play();
    }
}


var balls = {};

function add_ball(id){
    var num_balls = Object.keys(balls).length;
    var scene = document.querySelector('a-scene');
    var ball = document.createElement('a-sphere');
    scene.appendChild(ball);
    ball.setAttribute('mixin', 'ball');
    ball.setAttribute('id', id);
    ball.setAttribute('position', {
        x: Math.sin(Math.PI/6 * Math.ceil(num_balls/2) * Math.pow(-1, num_balls))*8,
        y:0,
        z:-Math.cos(Math.PI/6 * Math.ceil(num_balls/2) * Math.pow(-1, num_balls))*8,
    });
    if(id == 'default'){
        ball.setAttribute('sound', 'src', 'audio/spokey_dokey.wav;');
        ball.setAttribute('sound', 'autoplay', true);
    }else{
        ball.setAttribute('sound', 'src', 'audio/spokey_dokey.wav;');
    }
    ball.setAttribute('sound', 'loop', true);
    ball.addEventListener('loaded', function(){
        this.components.material.setMaterial(new_material());
        this.components.sound.sound.panner.panningModel = 'HRTF';
        this.components.sound.sound.panner.panningModel.coneOuterAngle = 360;
        var physics = this.components['physics-body'];
        physics.body = physics.getBody(physics.el, physics.data);
        physics.world = physics.el.sceneEl.components['physics-world'].world;
        physics.body.allowSleep = false;
        physics.world.add(physics.body);
    });
    ball.addEventListener('stateadded', function(e){
        if(e.detail.state === 'hovered'){
            this.setAttribute('geometry', 'radius', 1.1);
        }
    });
    ball.addEventListener('stateremoved', function(e){
        if(e.detail.state === 'hovered'){
            this.setAttribute('geometry', 'radius', 1.0);
        }
    });
    ball.addEventListener('mousedown', function(e){
        this.setAttribute('grab');
        this.components['physics-body'].body.velocity.x = 0;
        this.components['physics-body'].body.velocity.y = 0;
        this.components['physics-body'].body.velocity.z = 0;
    });
    ball.addEventListener('mouseup', function(e){
        var scene = document.querySelector('a-scene');
        this.removeAttribute('grab');
        var curr = this.components['physics-body'].body.position;
        var prev = this.components['physics-body'].body.previousPosition;
        var factor = 2;
        var force = {x: factor*(curr.x - prev.x), y: factor*(curr.y - prev.y), z: factor*(curr.z - prev.z)};
        this.components['physics-body'].applyImpulse(force, {x: 0, y:0, z:0});
    });
    balls[id] = ball;
}

function new_material(){
    var r = Math.random().toString();
    var g = Math.random().toString();
    var b = Math.random().toString();
    var vertexShader = "varying vec3 vNormal; \n void main(){vNormal = normalize( normalMatrix * normal );\n gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}";
    var fragmentShader = "varying vec3 vNormal; \nvoid main(){float intensity = pow( 0.7 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 3.0 );\n gl_FragColor = vec4("+r+","+g+","+b+", 1.0 ) * intensity;}";
    var customMaterial = new THREE.ShaderMaterial( {
        uniforms: {},
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    return customMaterial;
}

function distance(a, b){
    return Math.sqrt(Math.pow(a.x-b.x,2) + Math.pow(a.y-b.y,2) + Math.pow(a.z-b.z,2));
}
