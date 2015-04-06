$(function(){
  LeapController
    .use('riggedHand', {
      scale: 2.5,
      //offset: new THREE.Vector3(100,110,100),
      positionScale: 0.0000000000000000000000000001

  })

	LeapController.on('riggedHand.meshAdded', function(handMesh, leapHand){
  handMesh.material.opacity = 1;
});
}
);