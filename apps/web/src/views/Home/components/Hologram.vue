<template>
   <canvas id="hologram"></canvas>
</template>
<script setup lang="ts">
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {useTemplateRef, onMounted, ref} from 'vue'
const hologramRef = useTemplateRef<HTMLCanvasElement>('hologramRef')
const initThree = () => { 
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 500 / 250, 0.1, 1000)
    camera.position.set(0, 0, 10)
    const loaders=new GLTFLoader()
    loaders.load('/models/hologram/scene.gltf',(gltf)=>{
        scene.add(gltf.scene)
    })
    const renderer = new THREE.WebGLRenderer({
        canvas: hologramRef.value!,
        antialias: true,
        alpha: true,
        precision: 'highp',
        powerPreference: 'high-performance'
    })
    renderer.setSize(500, 250)
    const controls = new OrbitControls(camera, renderer.domElement)
    const animate = ()=>{
        requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
        
    }
    animate()

}
onMounted(() => { 
    initThree()
})

</script>