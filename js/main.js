var scene = document.querySelector('a-scene');
scene.addEventListener('loaded', init);

function init(){
    scene.components['physics-world'].world.defaultContactMaterial.friction = -1;
    scene.components['physics-world'].world.defaultContactMaterial.restitution = -1;
    scene.components['physics-world'].world.defaultContactMaterial.contactEquationRelaxation = 1;
    scene.components['physics-world'].world.defaultContactMaterial.frictionEquationRelaxation = 1;
    scene.components['physics-world'].world.defaultContactMaterial.contactEquationStiffness = 1e7;
    scene.components['physics-world'].world.defaultContactMaterial.frictionEquationStiffness = 1e7;


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
          //this.el.setAttribute('position', {
          var position = {
              x: this.d * Math.cos(phi) * Math.sin(theta) + x,
              y: this.d * Math.sin(phi) + y,
              z: -this.d * Math.cos(phi)*Math.cos(theta) + z,
          };
          this.el.components['physics-body'].body.position.x = position.x;
          this.el.components['physics-body'].body.position.y = position.y;
          this.el.components['physics-body'].body.position.z = position.z;

          this.el.components['physics-body'].body.velocity.x = 0;
          this.el.components['physics-body'].body.velocity.y = 0;
          this.el.components['physics-body'].body.velocity.z = 0;
	  }
	});


    add_input('default');
    add_ball('default');

    init_audio();
    init_settings();

    document.onkeypress = function (e) {
        e = e || window.event;
        if(e.keyCode == 32){
            e.preventDefault();
            if(isPlaying){
                pause();
                isPlaying = false;
            }else{
                play();
                isPlaying = true;
            }
        }
    };
}

var audio_context;
function init_audio(){
}

function init_settings(){
    document.getElementById('settings-button').addEventListener('click', open_settings);
    document.getElementById('submit').addEventListener('click', close_settings);
    document.getElementById('saymyname').addEventListener('click', function(){
        var stems = [
            'audio/stems/say_my_name/SynthLead.m4a',
            'audio/stems/say_my_name/BgVoxWet.m4a',
            'audio/stems/say_my_name/Drums.m4a',
            'audio/stems/say_my_name/ArpBass.m4a',
            'audio/stems/say_my_name/PianoAndGuitar.m4a',
            'audio/stems/say_my_name/MainVoxDry.m4a',
            'audio/stems/say_my_name/BgVoxDry.m4a',
            'audio/stems/say_my_name/MainVoxWet.m4a',
            'audio/stems/say_my_name/Arp.m4a',
            'audio/stems/say_my_name/Bass.m4a',
        ];
        load_stems(stems);
    });
    document.getElementById('tighten_up').addEventListener('click', function(){
        var stems = [
            'audio/stems/tighten_up/keys.ogg',
            'audio/stems/tighten_up/drums.ogg',
            'audio/stems/tighten_up/guitar.ogg',
            'audio/stems/tighten_up/vocals.ogg',
            'audio/stems/tighten_up/song.ogg',
            'audio/stems/tighten_up/rhythm.ogg',
        ];
        load_stems(stems);
    });
    document.getElementById('breezeblocks').addEventListener('click', function(){
        var stems = [
            'audio/stems/breezeblocks/sampled_kick.mp3',
            'audio/stems/breezeblocks/Joe_main_vocs_dry.mp3',
            'audio/stems/breezeblocks/drum_kit.mp3',
            'audio/stems/breezeblocks/Joe_guitar.mp3',
            'audio/stems/breezeblocks/synth_top.mp3',
            'audio/stems/breezeblocks/Gwill_end_gtr.mp3',
        ];
        load_stems(stems);
    });
    document.getElementById('reckoner').addEventListener('click', function(){
        var stems = [
            'audio/stems/reckoner/lead_vocal.m4a',
            'audio/stems/reckoner/lead_and_backing_vocal.m4a',
            'audio/stems/reckoner/drum2.m4a',
            'audio/stems/reckoner/drum1.m4a',
            'audio/stems/reckoner/piano_strings.m4a',
            'audio/stems/reckoner/guitar.m4a',
            'audio/stems/reckoner/backing_vocal.m4a',
            'audio/stems/reckoner/bass.m4a',
        ];
        load_stems(stems);
    });
}

var isPlaying = true;
function play(){
    if(audio_context.state === 'suspended') {
        audio_context.resume();
    }
    for(var key in balls){
        var ball = balls[key];
        //ball.components.sound.sound.isPlaying = false;
        ball.components.sound.sound.play();
        ball.components.sound.sound.source.disconnect();
        ball.components.sound.sound.source.connect(ball.components.sound.sound.splitter);
    }
}
function pause(){
    audio_context.suspend();
}


var sources = {};
var balls = {};

function add_ball(id, src){
    if(balls[id] != null){
        balls[id].components.sound.sound.isPlaying = false;
        return;
    }
    if(src === undefined){
        src = 'audio/spokey_dokey.mp3';
    }
    var num_balls = Object.keys(balls).length;
    var scene = document.querySelector('a-scene');
    var ball = document.createElement('a-sphere');
    scene.appendChild(ball);
    ball.setAttribute('mixin', 'ball');
    ball.setAttribute('id', id);
    ball.setAttribute('position', {
        x: Math.sin(Math.PI/6 * Math.ceil(num_balls/2) * Math.pow(-1, num_balls))*8,
        y: Math.floor(num_balls/12) * 4,
        z:-Math.cos(Math.PI/6 * Math.ceil(num_balls/2) * Math.pow(-1, num_balls))*8,
    });
    if(id == 'default'){
        ball.setAttribute('sound', 'src', src);
        ball.setAttribute('sound', 'autoplay', true);
    }else{
        ball.setAttribute('sound', 'src', src);
    }
    ball.setAttribute('sound', 'loop', true);
    ball.setAttribute('sound', 'on', false);
    ball.addEventListener('loaded', function(){
        audio_context = this.components.sound.sound.context;

        this.components.material.setMaterial(new_material(sources[id].color));
        this.components.sound.sound.panner.panningModel = 'HRTF';
        this.components.sound.sound.panner.panningModel.coneOuterAngle = 360;
        var physics = this.components['physics-body'];
        physics.body = physics.getBody(physics.el, physics.data);
        physics.world = physics.el.sceneEl.components['physics-world'].world;
        physics.body.allowSleep = false;
        physics.world.add(physics.body);


        // force mono
        var splitter = audio_context.createChannelSplitter(2);
        var merger = audio_context.createChannelMerger(1);
        this.components.sound.sound.source.disconnect();
        this.components.sound.sound.source.connect(splitter);
        splitter.connect(merger, 0, 0);
        splitter.connect(merger, 1, 0);
        merger.connect(this.components.sound.sound.panner);
        this.components.sound.sound.splitter = splitter;
    });
    ball.addEventListener('stateadded', function(e){
        if(e.detail.state === 'hovered'){
            this.setAttribute('geometry', 'radius', 1.6);
        }
    });
    ball.addEventListener('stateremoved', function(e){
        if(e.detail.state === 'hovered'){
            this.setAttribute('geometry', 'radius', 1.5);
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
    return ball;
}

function new_material(color){
    var r = color[0]/255;
    var g = color[1]/255;
    var b = color[2]/255;
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

function open_settings(){
    pause();
    scene.style.display = 'none';
    var settings = document.getElementById('settings');
    settings.style.display = 'block';
}

function close_settings(){
    scene.style.display = 'block';
    settings.style.display = 'none';
    play();
}

function add_input(id){
    var settings = document.getElementById('file_inputs');
    var source_div = document.createElement('div');
    var file_input = document.createElement('input');
    var file_label = document.createElement('label');
    var source_button = document.createElement('button');
    file_input.type = 'file';
    file_input.accept = 'audio/*';
    file_input.multiple = "multiple";

    file_label.textContent = 'No file chosen';
    file_label.style.width = '200px';
    file_label.style.display = 'inline-block';
    file_label.style['text-align'] = 'left';

    if(id === undefined){
        id = Date.now();
        id = id + Math.random();
    }
    sources[id] = {};
    file_input.name = id;
    file_input.onchange = handleFileSelect;
    sources[id].fileinput = file_input;
	sources[id].color = random_color();
	sources[id].source_button = source_button;
	sources[id].label= file_label;
	sources[id].div = source_div;

	source_button.classList.add('source_button');
	source_button.style.backgroundColor = 'rgb(' + sources[id].color + ')';
	source_button.style.borderColor= 'rgb(' + sources[id].color + ')';
    source_button.type= 'button';
    source_button.style.opacity = 0.3;
    //
    source_div.appendChild(source_button);
    source_div.appendChild(file_input);
    source_div.appendChild(file_label);
    source_div.classList.add('source_div');
    settings.appendChild(source_div);
    return source_div;
}

function create_source(buffer, input, id) {
    if(!(id in sources)){
        sources[id] = {};
    }
    sources[id].buffer = buffer;
    source = audio_context.createBufferSource();
	source.buffer = buffer;
    source.loop = 'true';
    sources[id].audio_source = source;
    if(input.parentElement.nextElementSibling == null){
        add_input();
    }
    sources[id].source_button.style.opacity = 1;

    try{
        balls[id].components.sound.sound.source.stop();
    }catch (e){
    }
    balls[id].components.sound.sound.source.disconnect();
    balls[id].components.sound.sound.source = source;
    source.connect(balls[id].components.sound.sound.splitter);
}

var semaphore = 0;
function handleFileSelect(e) {
    var submit = document.getElementById('submit');
    var input = this;
    var id = this.name;
    var files = e.target.files; // FileList object
    for(var f=0;f<files.length;f++){
        semaphore += 1;
        submit.textContent = 'Loading...';
        submit.disabled = true;
        var file = files[f];
        if(f > 0){
            var input = add_input();
            input = input.querySelector('input');
            id = input.name;
        }
        input.nextElementSibling.textContent = file.name;
        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function(theFile, id) {
            return function(e) {
                var ball = add_ball(id);
                audio_context.decodeAudioData(e.target.result, function(buffer){
                    create_source(buffer, input, id);
                    semaphore -= 1;
                    console.log(semaphore);
                    if(semaphore <= 0){
                        submit.textContent = 'Play!';
                        submit.disabled = false;
                    }
                });
            };
        })(file, id);
        reader.readAsArrayBuffer(file);
    }
}

function random_color(){
    var r = Math.round(Math.random()*255);
    var g = Math.round(Math.random()*255);
    var b = Math.round(Math.random()*255);
    return [r, g, b];
}

function load_stems(files){
    var submit = document.getElementById('submit');
    submit.textContent = 'Loading...';
    submit.disabled = true;

    for(var key in balls){
        delete_ball(key);
    }

    for(var i=0; i<files.length; i++){
        semaphore += 1;
        semaphore = Math.min(semaphore, 6);
        var file = files[i];
        var name = file.replace(/^.*\/(.*)$/, "$1");
        var input = add_input(name);
        console.log(name);
        var asset = document.createElement('audio');
        asset.src = file;
        asset.id = file;
        sources[name].asset = asset;
        setTimeout(function(){
        scene.querySelector('a-assets').appendChild(asset);
        }, 5000);
        var ball = add_ball(name, file);
        sources[name].label.textContent = name;
        asset.addEventListener('loadeddata', function(e){
            semaphore -= 1;
            console.log(semaphore);
            if(semaphore <= 0){
                setTimeout(function(){
                    submit.textContent = 'Play!';
                    submit.disabled = false;
                }, 5000);
            }
        });
    }
}

function delete_ball(id){
    balls[id].components['physics-body'].body.world.removeBody(balls[id].components['physics-body'].body);
    balls[id].components.sound.sound.gain.disconnect();
    balls[id].removeAttribute('sound');
    balls[id].parentElement.removeChild(balls[id]);
    delete balls[id];
    sources[id].div.parentElement.removeChild(sources[id].div);
    delete sources[id];
}
