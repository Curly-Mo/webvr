var scene = document.querySelector('a-scene');
scene.addEventListener('loaded', init);

function init(){
    scene.components['physics-world'].world.defaultContactMaterial.friction = -1;
    scene.components['physics-world'].world.defaultContactMaterial.restitution = -1;
    scene.components['physics-world'].world.defaultContactMaterial.contactEquationRelaxation = 1;
    scene.components['physics-world'].world.defaultContactMaterial.frictionEquationRelaxation = 1;
    scene.components['physics-world'].world.defaultContactMaterial.contactEquationStiffness = 1e7;
    scene.components['physics-world'].world.defaultContactMaterial.frictionEquationStiffness = 1e7;
}
//
//AFRAME.registerComponent('projectile', {
//    schema: {
//        velocity: {
//            type: 'vec3',
//            default: {x: 0, y: 0, z: 0},
//        }
//    },
//
//    tick: function () {
//        this.el.object3D.translateX(this.data.velocity.x);
//        this.el.object3D.translateY(this.data.velocity.y);
//        this.el.object3D.translateZ(this.data.velocity.z);
//    }
//});
