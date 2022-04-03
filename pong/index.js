import * as THREE from 'three';
import { Int8BufferAttribute, Layers } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

import fontRaw from 'three/examples/fonts/helvetiker_bold.typeface.json';
import { MeshBasicMaterial } from 'three';
import { MeshNormalMaterial } from 'three';
var font = 'data:text/plain;base64,' + new Buffer(JSON.stringify(fontRaw)).toString('base64');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1,1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xFFD124)
document.body.appendChild(renderer.domElement)


const controls = new OrbitControls(camera, renderer.domElement)
camera.position.z = 20;

let maxWidth = camera.aspect * 15.3465 // 20 * tan(35.5)
let width = maxWidth - 3
let height = 15 - 2

let speed = 0.4

let stop = false;

/* CREATE TEXT */
function loadFont() {
    const fontLoader = new FontLoader();
    fontLoader.load(font, f => {
        font = f

        createText()
    });
}
loadFont();

var textMesh
var text = '0 - 0'
var textRotation = 0
function createText() {
    const textGeo = new TextGeometry(text, {
        font,
        size: 5,
        bevelSize: 1,
        height: 1
    })
    textGeo.center()

    if(textMesh) {
        scene.remove(textMesh)
    }
    textMesh = new THREE.Mesh(textGeo, new THREE.MeshBasicMaterial({ color: 0x222222 }))
    textMesh.position.z = -20;
    textMesh.rotation.z = textRotation;

    scene.add(textMesh)
}
/* CREATE TEXT */

/* CREATE TWO BAR */
const keys = []
var left, right
function createBarAndListener() {
    left = new THREE.Mesh(new THREE.BoxGeometry(1,5,1), new THREE.MeshNormalMaterial())
    left.position.x = -width
    scene.add(left)

    right = new THREE.Mesh(new THREE.BoxGeometry(1,5,1), new THREE.MeshNormalMaterial())
    right.position.x = width
    scene.add(right)

    const top = new THREE.Mesh(new THREE.BoxGeometry(width * 2, 1,1), new MeshNormalMaterial())
    top.position.y = height
    scene.add(top)

    const bottom = new THREE.Mesh(new THREE.BoxGeometry(width * 2, 1,1), new MeshNormalMaterial())
    bottom.position.y = -height
    scene.add(bottom)

    document.addEventListener('keydown', e => {
        if(keys.indexOf(e.key) === -1) {
            keys.push(e.key)
        }
    })

    document.addEventListener('keyup', e => {
        if(keys.indexOf(e.key) !== -1) {
            keys.splice(keys.indexOf(e.key), 1)
        }
    })
}
createBarAndListener()

const speedBar = 0.5
const max = 13
function barUpdate() {
    if(keys.includes('z') && left.position.y <= max) left.position.y += speedBar
    if(keys.includes('s') && left.position.y >= -max) left.position.y -= speedBar

    if(keys.includes('i') && right.position.y <= max) right.position.y += speedBar
    if(keys.includes('k') && right.position.y >= -max) right.position.y -= speedBar
}
/* CREATE TWO BAR */


var ball;
var angle;
function createBall() {
    const geometry = new THREE.SphereGeometry(1, 32, 16)

    ball = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }))
    scene.add(ball)

    angle = Math.random() * (Math.PI * 2)
}
createBall()


var distance = 0
var xBounce = 0, yBounce = 0;
function loose(winner) {
    left.position.y = 0;
    right.position.y = 0
    ball.position.set(0,0,0);
    distance = 0;
    xBounce = 0;
    yBounce = 0;
    angle = Math.random() * (Math.PI * 2)
    stop = true

    const score = text.split(' - ')
    if(!winner) score[0] = parseInt(score[0]) + 1
    else score[1] = parseInt(score[1]) + 1
    text = score.join(' - ');
    createText()

    setTimeout(() => stop = false, 1500)
}

function randomizeAngle(angle) {
    return angle + (Math.random() * 0.3) - 0.15
}

function ballUpdate() {
    const pos = new THREE.Vector3(distance * Math.cos(angle) + xBounce, distance * Math.sin(angle) + yBounce, 0)
    ball.position.set(pos.x, pos.y, pos.z);
    distance += speed

    const ifHorizontal = (pos.y >= height -1 || pos.y <= -height + 1)
    const ifVerticalLeft = pos.x <= -width + 1
    const ifVerticalRight = pos.x >= width - 1
    if(ifHorizontal || (ifVerticalLeft || ifVerticalRight)) {

        if(ifHorizontal) angle = (Math.PI * 2) - (randomizeAngle(angle))

        if(ifVerticalLeft || ifVerticalRight) {
            if(ifVerticalLeft) {
                if(left.position.y + 3 >= pos.y && left.position.y - 3 <= pos.y) {
                    angle = (Math.PI * 3) - randomizeAngle(angle)       
                } else {
                    loose(true)
                    return;
                }
            } else if(ifVerticalRight) {
                if(right.position.y + 3 >= pos.y && right.position.y - 3 <= pos.y) {
                    angle = (Math.PI * 3) - randomizeAngle(angle)       
                } else {
                    loose(false)
                    return;
                }
            }
        }

        xBounce = pos.x
        yBounce = pos.y
        distance = speed
    }
}

function loop() {
    requestAnimationFrame(loop)

    renderer.render(scene,camera)
    controls.update()

    barUpdate()
    if(!stop) ballUpdate()
}
loop()